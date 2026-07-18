
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import ai_client
from models import ChatRequest
import logging
import database

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    database.init_db()
    yield
    database.close_db()


app = FastAPI(lifespan=lifespan)

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
@app.post('/')
def read_root(request: ChatRequest):
   try: 
       return StreamingResponse(
        ai_client.generate_response(request.prompt),
        media_type="application/x-ndjson",
       )
   except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
