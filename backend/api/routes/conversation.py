from fastapi import APIRouter, HTTPException
from repositories.conversation_repo import create_conversation

router = APIRouter(
    prefix="/conversations",
    tags=["conversations"]
)

@router.post("/")
def create_new_conversation(user_id: str):
    try:
        conversation_id = create_conversation(user_id)
        return {"conversation_id": str(conversation_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
