import json
import logging
from openai import OpenAI
from collections.abc import Generator

logger = logging.getLogger(__name__)

def get_client():
    return OpenAI(
        base_url="http://localhost:1234/v1",
        api_key="lm-studio",
    )

def generate_response(prompt: str) -> Generator[str, None, None]:
    client = get_client()

    response = client.chat.completions.create(
        model="qwen2.5-vl-7b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        stream=True
    )

    logger.info(response)

    for chunk in response: 
        if not chunk.choices:
            continue
        content = chunk.choices[0].delta.content

        if content:
            yield json.dumps({
                "id": chunk.id,
                "content": content,
            }) + "\n"