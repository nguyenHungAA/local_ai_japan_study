import { useEffect, useState } from 'react';
import './App.css'
import Sidebar from './components/Sidebar'
import Input from './components/Input'
import type { Conversation } from './types/IConversation'
import Loading from './components/loading/Loading';
import { createChatStream } from './api/Chat';

const USER_ID_STORAGE_KEY = "local-ai-user-id";

type ChatStreamEvent =
  | { type: "conversation"; conversation_id: string }
  | { type: "token"; content: string }
  | { type: "done"; conversation_id: string }
  | { type: "error"; message: string };

function getUserId() {
  const existingUserId = localStorage.getItem(USER_ID_STORAGE_KEY);

  if (existingUserId) {
    return existingUserId;
  }

  const newUserId = crypto.randomUUID();
  localStorage.setItem(USER_ID_STORAGE_KEY, newUserId);
  return newUserId;
}


function App() {
  const [conversationHistoryVersion, setConversationHistoryVersion] = useState(0);
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(USER_ID_STORAGE_KEY, "local-ai-first-user");
  }, [])

  const handleInputSubmit = (inputText: string) => {
    const newMessage: Conversation = {
      clientId: crypto.randomUUID(),
      role: 'user',
      content: inputText
    };
    setConversation(prev => [...prev, newMessage]);
    sendMessage(inputText);
  }

  async function sendMessage(prompt: string) {
    const clientId = crypto.randomUUID();
    let fullResponse = "";

    setConversation(prev => [
      ...prev,
      { clientId: clientId, role: 'assistant', content: '' }
    ]);

    try {
      setIsLoading(true);
      const response = await createChatStream({
        prompt,
        userId: getUserId(),
        conversationId: conversationId ?? undefined
      })

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        setIsLoading(false);

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const data = JSON.parse(line) as ChatStreamEvent;

          if (data.type === "conversation" && !conversationId) {
            setConversationHistoryVersion(prev => prev + 1);
          }

          if (data.type === "conversation" || data.type === "done") {
            setConversationId(data.conversation_id);
            continue;
          }

          if (data.type === "error") {
            console.error('Error sending message: ' + data.message);
            continue;
          }

          fullResponse += data.content;

          setConversation(prev =>
            prev.map(msg => msg.clientId === clientId ? { ...msg, content: fullResponse } : msg)
          );
        }
      }

      if (buffer.trim()) {
        const data = JSON.parse(buffer) as ChatStreamEvent;

        if (data.type === "done" || data.type === "conversation") {
          setConversationId(data.conversation_id);
        }
      }
    } catch (e) {
      console.error('Error sending message: ' + e);
    }

    finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="root">
      <Sidebar conversationHistoryVersion={conversationHistoryVersion} />
      <section id="main" style={conversation.length > 0 ? { justifyContent: "flex-start" } : { justifyContent: "center" }}>
        {!conversation.length && (
          <div className='app-title-container'>
            <h1 className='app-title'>なにかごようでしょうか？</h1>
          </div>
        )}
        <div className="conversation-container">
          {conversation.length > 0 && (
            conversation.map((message) => (
              message.role === 'user' ? (
                <div key={message.clientId} className='message-wrapper'>
                  {message.content}
                </div>
              ) : (
                <div key={message.clientId} className='left'>
                  {message.content}
                </div>
              )
            ))
          )}
          {isLoading && <div className='loading'>
            <Loading />
          </div>}
        </div>
        <Input
          parentCallback={handleInputSubmit}
          className={conversation.length > 0 ? "has-prompt" : ""}
        />
      </section>
    </section>
  )
}

export default App
