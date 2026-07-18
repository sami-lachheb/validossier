import re
import json
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..db import get_db, get_all_submissions

router = APIRouter()

@router.get("/api/submissions")
def list_submissions():
    try:
        return get_all_submissions()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="No filename provided in upload.")
        
    content = await file.read()
    errors = []

    # Check 1: lowercase
    if filename != filename.lower():
        errors.append("Filename must be completely lowercase.")

    # Check 2: no spaces
    if " " in filename:
        errors.append("Filename cannot contain spaces.")

    # Check 3: valid characters (alphanumeric, hyphens, dots, underscores only)
    if not re.match(r"^[a-z0-9\-\.\_]+$", filename):
        errors.append("Filename contains invalid characters. Use only lowercase letters, numbers, hyphens, underscores, and dots.")

    # Check 4: max length
    if len(filename) > 64:
        errors.append(f"Filename length ({len(filename)}) exceeds 64 character limit.")

    # Check 5: not empty
    if len(content) == 0:
        errors.append("File is empty.")

    status = "REJECTED" if errors else "ACCEPTED"

    # Default structure for accepted files
    dossier_structure = {
        "errors": errors,
        "discrepancies": [],
        "dossier": {
            "m1_admin": {
                "trade_name": "oxalip-100",
                "active_ingredient": "oxaliplatin",
                "dosage": "100mg",
                "batch_id": "oxal12",
                "destination_authority": "dpm"
            },
            "m2_summary": {
                "dizziness_claim": "dizziness was observed in 0.5% of cases"
            },
            "m5_clinical": {
                "study_batch_id": "oxal-12",
                "adverse_events_table": [
                    {"event": "dizziness", "count": 1, "total": 150}
                ]
            }
        }
    }

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM submissions WHERE filename = ?", (filename,))
    existing = cursor.fetchone()
    if existing:
        cursor.execute(
            "UPDATE submissions SET status = ?, iteration_count = ?, created_at = ?, data = ? WHERE id = ?",
            (
                status,
                0,
                datetime.now().isoformat(),
                json.dumps(dossier_structure),
                existing["id"]
            )
        )
    else:
        cursor.execute(
            "INSERT INTO submissions (filename, status, iteration_count, created_at, data) VALUES (?, ?, ?, ?, ?)",
            (
                filename, 
                status, 
                0, 
                datetime.now().isoformat(), 
                json.dumps(dossier_structure)
            )
        )
    conn.commit()
    conn.close()

    return {"status": status, "filename": filename, "errors": errors}
