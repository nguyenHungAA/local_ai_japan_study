import dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# response model


dotenv.load_dotenv()

uri = dotenv.get_key(dotenv.find_dotenv(), "MONGODB_URI")
client = MongoClient(
    uri,
    server_api=ServerApi(version="1", strict=True, deprecation_errors=True),
)


def init_db():
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")


def close_db():
    client.close()
