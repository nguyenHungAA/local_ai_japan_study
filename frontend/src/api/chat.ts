import type { Chat } from "../types/IConversation";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function createChatStream(request: Chat) {
    try {
        const response = await fetch(`${API_BASE_URL}/chat/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: request.prompt,
                user_id: request.userId,
                conversation_id: request.conversationId,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Network response was not ok (${response.status}): ${errorBody}`);
        }

        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

