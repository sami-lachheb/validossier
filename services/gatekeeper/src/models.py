from pydantic import BaseModel
from typing import Optional

class HealRequest(BaseModel):
    prompt: str

class ChatRequest(BaseModel):
    message: str
    submission_id: Optional[int] = None
