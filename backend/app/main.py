
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import backend.config.database as database
from backend.api.routes.chat import router as chat_router
from backend.api.routes.conversation import router as conversation_router

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield
    database.close_db()


app = FastAPI(lifespan=lifespan)

app.include_router(chat_router)
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
