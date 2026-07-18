export interface Conversation {
    assistantClientId: string;
    responseId?: string;
    role: 'user' | 'assistant';
    content: string;
}