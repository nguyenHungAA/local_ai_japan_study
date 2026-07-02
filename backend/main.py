from fastapi import FastAPI
import ai_client

app = FastAPI()

@app.get('/')
def read_root():
   try: 
       res = ai_client.prompt_local_ai("who are you?")
       return {"response": res}
   except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}
