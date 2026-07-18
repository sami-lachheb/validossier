from fastapi import APIRouter, HTTPException
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig
from ..prompts import AGENT_SYSTEM_INSTRUCTIONS
from ..config import GEMINI_MODEL
from ..models import ChatRequest
from ..db import get_submission, update_submission

router = APIRouter()

@router.post("/api/chat")
async def chat(body: ChatRequest):
    try:
        config = LocalAgentConfig(
            system_instructions=AGENT_SYSTEM_INSTRUCTIONS,
            capabilities=CapabilitiesConfig(),
            model=GEMINI_MODEL,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create config: {e}")

    try:
        async with Agent(config) as agent:
            response = await agent.chat(body.message)
            full_text = ""
            async for token in response:
                full_text += token
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent runtime error during execution: {e}")

    # If submission context is provided, store the conversation in the database history
    if body.submission_id is not None:
        sub = get_submission(body.submission_id)
        if sub:
            data = sub["data"]
            if "chat_history" not in data:
                data["chat_history"] = []
                
            data["chat_history"].append({
                "sender": "user",
                "message": body.message
            })
            data["chat_history"].append({
                "sender": "assistant",
                "message": full_text
            })
            
            try:
                update_submission(body.submission_id, data=data)
            except Exception as e:
                # Log DB save failure but return response to prevent breaking UI
                pass

    return {
        "response": full_text,
        "submission_id": body.submission_id
    }
