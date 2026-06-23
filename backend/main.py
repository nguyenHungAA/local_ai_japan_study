from fastapi import FastAPI
import lmstudio as lms

app = FastAPI()


@app.get("/")
def read_root():
    return_value = post_prompt({
        "model": "qwen/qwen2.5-vl-7b",
        "input": "Who are you?"
    })

    return return_value

@app.post("http://localhost:1234/api/v1/chat")
def post_prompt(prompt):
    model = lms.llm("qwen/qwen2.5-vl-7b")
    result = model.respond(prompt["input"])

    return result