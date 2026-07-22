import json 

from backend.services.ai_service import generate_response
from backend.repositories.conversation_repo import create_conversation, get_conversation
from backend.repositories.message_repo import create_message


def stream_chat_response(request):
    try:
        if request.conversation_id is None:
            conversation_id = create_conversation(request.user_id)
        else:
            conversation_id = request.conversation_id
            conversation = get_conversation(conversation_id)

            if conversation is None:
                raise ValueError("Conversation not found")

        create_message(
            conversation_id=conversation_id,
            role="user",
            content=request.prompt,
        )

        yield json.dumps({
            "type": "conversation",
            "conversation_id": conversation_id,
        }) + "\n"

        assistant_chunks = []

        for chunk in generate_response(request.prompt):
            data = json.loads(chunk)
            content = data["content"]

            assistant_chunks.append(content)

            yield json.dumps({
                "type": "token",
                "content": content,
            }) + "\n"

        full_answer = "".join(assistant_chunks)

        create_message(
            conversation_id=conversation_id,
            role="assistant",
            content=full_answer,
        )

        yield json.dumps({
            "type": "done",
            "conversation_id": conversation_id,
        }) + "\n"
    except Exception as e:
        yield json.dumps({
            "type": "error",
            "message": str(e),
        }) + "\n"
