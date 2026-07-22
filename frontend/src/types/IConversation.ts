export interface Conversation {
    clientId: string;
    responseId?: string;
    role: 'user' | 'assistant';
    content: string;
}

export interface Chat {
    prompt: string;
    userId: string;
    conversationId: string;
}