from bson import ObjectId
from datetime import datetime, timezone
from config.database import get_db

def create_conversation(user_id: str, model_name: str = "qwen2.5-vl-7b"):
    db = get_db()
    endpoints = db["endpoints"]
    conversations = db["conversations"]

    if endpoints is None: 
        raise ValueError(f"Model endpoints not found! ({model_name})")

    now = datetime.now(timezone.utc)
    result = conversations.insert_one({
        "user_id": user_id,
        "status": "active",
        "pinned": False,
        "default_model": {
            "endpoint_id": endpoints["_id"]
        },
        "message_count": 1,
        "last_message_at": now,
        "created_at": now,
        "updated_at": now
    })
    print("Inserted successfully into the conversations collection.")
    return result.inserted_id
