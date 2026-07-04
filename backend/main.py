from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import ai_client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# run unset SSL_CERT_FILE before running this app
@app.post('/')
def read_root():
   try: 
       res = ai_client.prompt_local_ai("who are you?")
       return {"response": res}
   except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
