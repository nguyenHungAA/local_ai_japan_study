from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    user_id: str
    conversation_id: Optional[str] = None