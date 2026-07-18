import re
import json
from fastapi import APIRouter, HTTPException
from ..db import get_submission, update_submission

router = APIRouter()

def run_verification_logic(dossier: dict) -> list:
    discrepancies = []
    
    m1 = dossier.get("m1_admin", {})
    m2 = dossier.get("m2_summary", {})
    m5 = dossier.get("m5_clinical", {})

    # CHECK 1: Defunct Authority (DPM vs ANAM)
    dest = m1.get("destination_authority", "")
    if dest.upper() in ["DPM", "DIRECTORATE OF PHARMACY AND MEDICINE"]:
        discrepancies.append({
            "type": "DEFUNCT_AUTHORITY_ERROR",
            "severity": "RTF_RISK",
            "field": "m1_admin.destination_authority",
            "current_value": dest,
            "expected_value": "ANAM",
            "message": "Submission is addressed to defunct legacy authority 'DPM' instead of legally mandated 'ANAM' (Law 2023-2)."
        })

    # CHECK 2: Fuzzy Batch ID Mismatch (OXAL12 vs OXAL-12)
    m1_batch = m1.get("batch_id", "")
    m5_batch = m5.get("study_batch_id", "")
    
    # Strip non-alphanumeric characters for comparison
    m1_clean = re.sub(r'[^a-zA-Z0-9]', '', m1_batch).lower()
    m5_clean = re.sub(r'[^a-zA-Z0-9]', '', m5_batch).lower()

    if m1_clean == m5_clean and m1_batch != m5_batch:
        discrepancies.append({
            "type": "FUZZY_IDENTIFIER_MISMATCH",
            "severity": "RTF_RISK",
            "field": "m1_admin.batch_id vs m5_clinical.study_batch_id",
            "current_value": f"'{m1_batch}' vs '{m5_batch}'",
            "message": f"Fuzzy mismatch: Batch ID '{m1_batch}' (Module 1) vs '{m5_batch}' (Module 5). Alphanumeric content matches but formatting differs."
        })

    # CHECK 3: Semantic Clinical Contradiction
    claim_text = m2.get("dizziness_claim", "")
    adverse_table = m5.get("adverse_events_table", [])
    
    for row in adverse_table:
        if row.get("event") == "dizziness":
            count = row.get("count", 0)
            total = row.get("total", 1)
            if total == 0:
                total = 1
                
            table_pct = round((count / total) * 100, 2)
            
            # Find any decimal or integer percentage in the claim text
            pct_match = re.search(r'(\d+\.?\d*)\s*%', claim_text)
            if pct_match:
                text_pct = float(pct_match.group(1))
                # Float tolerance comparison
                if abs(text_pct - table_pct) > 0.01:
                    discrepancies.append({
                        "type": "SEMANTIC_CONTRADICTION",
                        "severity": "RTF_RISK",
                        "field": "m2_summary.dizziness_claim vs m5_clinical.adverse_events_table",
                        "current_value": f"Text: {text_pct}% vs Table: {table_pct}%",
                        "message": f"Clinical claim contradiction: Summary claims '{text_pct}% risk' but table records {count}/{total} patients ({table_pct}%)."
                    })
                    
    return discrepancies

@router.post("/api/verify/{submission_id}")
def verify(submission_id: int):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    data = sub["data"]
    dossier = data.get("dossier", {})
    
    discrepancies = run_verification_logic(dossier)
    
    data["discrepancies"] = discrepancies
    new_status = "VERIFIED" if not discrepancies else "HITL_FROZEN"
    
    try:
        update_submission(submission_id, status=new_status, data=data)
        return {
            "id": submission_id,
            "status": new_status,
            "discrepancies": discrepancies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during verification: {e}")
