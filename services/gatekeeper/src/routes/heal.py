import json
from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types
from ..db import get_submission, update_submission
from ..config import GEMINI_MODEL, MAX_HEALING_ITERATIONS, GEMINI_API_KEY
from ..prompts import HEALING_PROMPT
from ..models import HealRequest
from .verify import run_verification_logic

router = APIRouter()

# Instantiate the genai client at module level
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else genai.Client()

@router.post("/api/heal/{submission_id}")
def heal(submission_id: int, body: HealRequest):
    sub = get_submission(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")

    data = sub["data"]
    iteration = sub["iteration_count"] + 1

    # HITL GATE: If iterations exceeded, freeze
    if iteration > MAX_HEALING_ITERATIONS:
        try:
            update_submission(submission_id, status="HITL_FROZEN", iteration_count=iteration)
            return {
                "id": submission_id,
                "status": "HITL_FROZEN",
                "iteration_count": iteration,
                "message": "Auto-remediation threshold exceeded (3 attempts). Human override required."
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database update error: {e}")

    # Build prompt from template
    prompt = HEALING_PROMPT.format(
        error_message=json.dumps(data.get("discrepancies", [])),
        correction_prompt=body.prompt,
        dossier_json=json.dumps(data.get("dossier", {}), indent=2)
    )

    try:
        # Call Gemini
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        healed_text = response.text.strip() if response.text else "{}"
        healed_dossier = json.loads(healed_text)
    except json.JSONDecodeError as e:
        update_submission(submission_id, iteration_count=iteration)
        return {
            "id": submission_id,
            "status": "HEALING_FAILED",
            "iteration_count": iteration,
            "message": f"LLM returned unparseable response: {e}"
        }
    except Exception as e:
        update_submission(submission_id, iteration_count=iteration)
        return {
            "id": submission_id,
            "status": "HEALING_FAILED",
            "iteration_count": iteration,
            "message": f"Gemini API call failed: {e}"
        }

    # Store healed data
    data["dossier"] = healed_dossier
    
    # Re-run verify logic inline
    discrepancies = run_verification_logic(healed_dossier)
    data["discrepancies"] = discrepancies
    
    # If the user tries to edit the clinical math, the verification check will still fail
    # resulting in a HITL_FROZEN status.
    new_status = "VERIFIED" if not discrepancies else "HITL_FROZEN"

    try:
        update_submission(submission_id, status=new_status, data=data, iteration_count=iteration)
        return {
            "id": submission_id,
            "status": new_status,
            "iteration_count": iteration,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error during heal: {e}")
