from datetime import datetime, timezone

from bson import ObjectId

from backend.config.database import get_db


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


def update_conversation_after_message(conversation_id: str):
    db = get_db()
    now = datetime.now(timezone.utc)

    db["conversations"].update_one(
        {"_id": _to_object_id(conversation_id)},
        {
            "$inc": {"message_count": 1},
            "$set": {
                "last_message_at": now,
                "updated_at": now,
            },
        },
    )

def get_conversation_history_from_repo(user_id: str):
    db = get_db()
    conversations = db["conversations"]
    history = list(conversations.find({"user_id": user_id}).sort("last_message_at", -1))
    for conversation in history:
        conversation["_id"] = str(conversation["_id"])
        conversation["last_message_at"] = conversation["last_message_at"].isoformat() if "last_message_at" in conversation else None
        conversation["created_at"] = conversation["created_at"].isoformat() if "created_at" in conversation else None
        conversation["updated_at"] = conversation["updated_at"].isoformat() if "updated_at" in conversation else None
    return history
