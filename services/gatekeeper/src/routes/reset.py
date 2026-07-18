from fastapi import APIRouter, HTTPException
from datetime import datetime
import json
from ..db import get_db

router = APIRouter()

SEED_DOSSIER = {
    "errors": [],
    "discrepancies": [],
    "dossier": {
        "m1_admin": {
            "trade_name": "Oxalip-100",
            "active_ingredient": "Oxaliplatin",
            "dosage": "100mg",
            "batch_id": "OXAL12",
            "destination_authority": "DPM"
        },
        "m2_summary": {
            "dizziness_claim": "dizziness was observed in 0.5% of cases"
        },
        "m5_clinical": {
            "study_batch_id": "OXAL-12",
            "adverse_events_table": [
                {"event": "dizziness", "count": 1, "total": 150}
            ]
        }
    }
}

@router.post("/api/reset")
def reset():
    try:
        conn = get_db()
        conn.execute("DELETE FROM submissions")
        conn.execute(
            "INSERT INTO submissions (filename, status, iteration_count, created_at, data) VALUES (?, ?, ?, ?, ?)",
            (
                "oxalip-100-dossier.json", 
                "PENDING", 
                0, 
                datetime.now().isoformat(), 
                json.dumps(SEED_DOSSIER)
            )
        )
        conn.commit()
        conn.close()
        return {"status": "SUCCESS", "message": "Demo database reset and seeded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during reset: {e}")
