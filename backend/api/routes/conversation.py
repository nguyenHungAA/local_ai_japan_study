from fastapi import APIRouter, HTTPException
from backend.repositories.conversation_repo import (
    create_conversation,
    get_conversation_history_from_repo
)

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)
@router.get("/history/{user_id}")
def get_conversation_history(user_id: str):
    try:
        history = get_conversation_history_from_repo(user_id)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
def create_new_conversation(user_id: str):
    try:
        conversation_id = create_conversation(user_id)
        return {"conversation_id": str(conversation_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


