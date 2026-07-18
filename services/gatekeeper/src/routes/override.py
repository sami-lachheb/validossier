from fastapi import APIRouter, HTTPException
from ..db import get_submission, update_submission

router = APIRouter()

@router.post("/api/override/{submission_id}")
def override(submission_id: int):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    try:
        update_submission(submission_id, status="VERIFIED")
        return {
            "id": submission_id,
            "status": "VERIFIED",
            "message": "Human override applied. Dossier locked for submission."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during override: {e}")

@router.post("/api/reject/{submission_id}")
def reject(submission_id: int):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    try:
        update_submission(submission_id, status="REJECTED")
        return {
            "id": submission_id,
            "status": "REJECTED",
            "message": "Human rejection applied. Dossier rejected."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during reject: {e}")

import os
from fastapi.responses import PlainTextResponse

@router.get("/api/sources/{filename}")
def get_source_file(filename: str):
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    path = os.path.join("/data", filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Source file not found")
        
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        return PlainTextResponse(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read source file: {e}")

from fastapi.responses import FileResponse

@router.get("/api/files/{filename}")
def get_pdf_file(filename: str):
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    path = os.path.join("/app/mock_data", filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
        
    headers = {
        "Content-Disposition": f"inline; filename=\"{filename}\""
    }
    return FileResponse(path, media_type="application/pdf", headers=headers)
