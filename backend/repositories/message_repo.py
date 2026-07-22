from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from bson import ObjectId

from backend.config.database import get_db
from backend.repositories.conversation_repo import update_conversation_after_message


def _to_object_id(conversation_id: str) -> ObjectId:
    if not ObjectId.is_valid(conversation_id):
        raise ValueError("Invalid conversation_id")
    return ObjectId(conversation_id)


def create_message(
    conversation_id: str,
    role: str,
    content: str,
    status: str = "completed",
    client_id: Optional[str] = None,
    response_id: Optional[str] = None,
):
    db = get_db()
    messages = db["messages"]
    conversation_object_id = _to_object_id(conversation_id)
    now = datetime.now(timezone.utc)

    sequence = messages.count_documents({
        "conversation_id": conversation_object_id,
    }) + 1

    result = messages.insert_one({
        "conversation_id": conversation_object_id,
        "client_id": client_id,
        "role": role,
        "content": content,
        "response_id": response_id or str(uuid4()),
        "status": status,
        "sequence": sequence,
        "created_at": now,
        "updated_at": now,
    })

    update_conversation_after_message(conversation_id)
    return str(result.inserted_id)

