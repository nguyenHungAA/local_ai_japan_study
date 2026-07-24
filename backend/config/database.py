import dotenv
from pathlib import Path

from pymongo import MongoClient
from pymongo.server_api import ServerApi


ENV_PATH = Path(__file__).resolve().parents[1] / ".env"

dotenv.load_dotenv(ENV_PATH)

uri = dotenv.get_key(str(ENV_PATH), "MONGODB_URI")

if uri is None:
    raise ValueError("MONGODB_URI is not set in the .env file.")

client = MongoClient(
    uri,
    server_api=ServerApi('1'),
)

def get_db():
    return client["local_ai"]

def init_db():
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")

    db = get_db()
    endpoints = db["endpoints"]
    if endpoints.count_documents({}) == 0:
        endpoints.insert_one({
            "name": "qwen2.5-vl-7b",
            "provider": "lm-studio",
            "url": "http://localhost:1234/v1",
        })
    


def close_db():
    client.close()
