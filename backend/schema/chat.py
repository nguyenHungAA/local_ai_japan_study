from typing import Literal, Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    user_id: str
    conversation_id: Optional[str] = None

class Attachment(BaseModel):
    type: str

class Endpoint(BaseModel):
    name: str
    provider: str
    url: str 

class Message(BaseModel):
    conversation_id: str
    client_id: Optional[str] = None
    role: Literal["user", "assistant"]
    content: str
    response_id: str
    status: Literal["pending", "completed", "failed", "streaming"]
    sequence: int
