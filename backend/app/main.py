
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import services.chat_service as chat_service
from schema.chat import ChatRequest
import logging
import config.database as database
from api.routes.conversation import router as conversation_router

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield
    database.close_db()


app = FastAPI(lifespan=lifespan)

app.include_router(conversation_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    return {"message": "Hello World"}

# run unset SSL_CERT_FILE before running this app
