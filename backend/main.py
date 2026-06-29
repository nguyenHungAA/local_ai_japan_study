from fastapi import FastAPI
import lmstudio as lms

app = FastAPI()


@app.get("/")
def read_root():
    return {
        "message": "This is the backend for LM Studio Demo\n", 
            "link": "http://127.0.0.1:8000/docs"
            }


@app.post("http://localhost:1234/api/v1/chat")
def post_prompt(prompt):
    model = lms.llm("qwen/qwen2.5-vl-7b")
    result = model.respond(prompt)

    return result