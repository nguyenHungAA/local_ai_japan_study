
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export async function getConversationHistory(userId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/history/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.history;

    } catch (error) {
        console.error('Error fetching conversation history:', error);
        throw error;
    }
}

export async function getConversationMessages(conversationId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.messages;
    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        throw error;
    }
}
