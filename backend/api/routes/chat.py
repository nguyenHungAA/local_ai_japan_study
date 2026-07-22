from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.schema.chat import ChatRequest
from backend.services.chat_service import stream_chat_response

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
)


@router.post("/")
def chat(request: ChatRequest):
    return StreamingResponse(
        stream_chat_response(request),
        media_type="application/x-ndjson",
    )
