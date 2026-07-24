from datetime import datetime, timezone

from bson import ObjectId

from backend.config.database import get_db


def _preview_text(text: str, limit: int = 80) -> str:
    normalized = " ".join(text.split())
    return normalized[:limit]


def _to_object_id(conversation_id: str) -> ObjectId:
    if not ObjectId.is_valid(conversation_id):
        raise ValueError("Invalid conversation_id")
    return ObjectId(conversation_id)


def create_conversation(user_id: str, model_name: str = "qwen2.5-vl-7b"):
    db = get_db()
    endpoints = db["endpoints"]
    conversations = db["conversations"]
    endpoint = endpoints.find_one({"name": model_name})

    if endpoint is None:
        raise ValueError(f"Model endpoints not found! ({model_name})")

    now = datetime.now(timezone.utc)
    result = conversations.insert_one({
        "title": "New chat",
        "user_id": user_id,
        "status": "active",
        "pinned": False,
        "default_model": {
            "endpoint_id": endpoint["_id"]
        },
        "message_count": 0,
        "last_message_at": now,
        "created_at": now,
        "updated_at": now
    })
    print("Inserted successfully into the conversations collection.")
    return str(result.inserted_id)


def get_conversation(conversation_id: str):
    db = get_db()
    return db["conversations"].find_one({"_id": _to_object_id(conversation_id)})


def update_conversation_after_message(conversation_id: str, content: str | None = None):
    db = get_db()
    now = datetime.now(timezone.utc)
    update_fields = {
        "last_message_at": now,
        "updated_at": now,
    }

    if content:
        preview = _preview_text(content)
        update_fields["last_message_preview"] = preview

        conversation = get_conversation(conversation_id)
        if conversation and conversation.get("title") in (None, "New chat"):
            update_fields["title"] = preview[:60] or "New chat"

    db["conversations"].update_one(
        {"_id": _to_object_id(conversation_id)},
        {
            "$inc": {"message_count": 1},
            "$set": update_fields,
        },
    )

def get_conversation_history_from_repo(user_id: str):
    db = get_db()
    conversations = db["conversations"]
    history = conversations.find(
        {"user_id": user_id},
        {
            "_id": 1,
            "title": 1,
            "message_count": 1,
            "last_message_preview": 1,
            "last_message_at": 1,
            "created_at": 1,
            "updated_at": 1,
        },
    ).sort("last_message_at", -1)

    return [
        {
            "_id": str(conversation["_id"]),
            "title": conversation.get("title") or "New chat",
            "message_count": conversation.get("message_count", 0),
            "last_message_preview": conversation.get("last_message_preview"),
            "last_message_at": conversation["last_message_at"].isoformat() if conversation.get("last_message_at") else None,
            "created_at": conversation["created_at"].isoformat() if conversation.get("created_at") else None,
            "updated_at": conversation["updated_at"].isoformat() if conversation.get("updated_at") else None,
        }
        for conversation in history
    ]
