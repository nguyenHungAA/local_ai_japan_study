import { useState } from 'react';
import './App.css'
import Sidebar from './components/Sidebar'
import Input from './components/Input'
import type { Conversation } from './types/IConversation'
import Loading from './components/loading/Loading';

function App() {
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputSubmit = (inputText: string) => {
    const newMessage: Conversation = {
      assistantClientId: crypto.randomUUID(),
      role: 'user',
      content: inputText
    };
    setConversation(prev => [...prev, newMessage]);
    sendMessage(inputText);
  }

  async function sendMessage(prompt: string) {
    const assistantClientId = crypto.randomUUID();
    let fullResponse = "";

    setConversation(prev => [
      ...prev,
      { assistantClientId: assistantClientId, role: 'assistant', content: '' }
    ]);

    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      if (!response.ok) {
        console.error('Error sending message: ' + (await response.json()).error);
      }

      if (!response.body) {
        console.error('No response body');
        return;
      }

      setIsLoading(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        setIsLoading(false);
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          const data = JSON.parse(line);
          fullResponse += data.content;
          setConversation(prev =>
            prev.map(msg => msg.assistantClientId === assistantClientId ? { ...msg, responseId: data.id, content: fullResponse } : msg)
          );
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
      <Sidebar />
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
                <div key={message.assistantClientId} className='message-wrapper'>
                  {message.content}
                </div>
              ) : (
                <div key={message.assistantClientId} className='left'>
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
