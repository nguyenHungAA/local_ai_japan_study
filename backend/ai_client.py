from openai import OpenAI

def get_client():
    return OpenAI(
        base_url="http://localhost:1234/v1",
        api_key="lm-studio",
    )

def prompt_local_ai(prompt):
    client = get_client()

    response = client.chat.completions.create(
        model="qwen2.5-vl-7b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    return response.choices[0].message.content