import dotenv
from narwhals import Datetime
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId



dotenv.load_dotenv()

uri = dotenv.get_key(dotenv.find_dotenv(), "MONGODB_URI")
client = MongoClient(
    uri,
    server_api=ServerApi(version="1", strict=True, deprecation_errors=True),
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

