import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar'
import Input from './components/Input'
import './App.css'
import PromptContainer from './components/PromptContainer';

function App() {
  const [userPrompt, setUserPrompt] = useState<string[]>([]);
  // const [modelResponse, setModelResponse] = useState<string[]>([]);

  const handleInputSubmit = (inputText: string) => {
    setUserPrompt(prev => [...prev, inputText]);
  }

  useEffect(() => {
    if (userPrompt.length > 0) {
      fetch('http://localhost:8000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ prompt: userPrompt.slice(-1)[0] }),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }, [userPrompt]);

  return (
    <section id="root">
      <Sidebar />
      <section id="main" style={userPrompt.length > 0 ? { justifyContent: "flex-start" } : { justifyContent: "center" }}>
        {!userPrompt.length && (
          <div className='app-title-container'>
            <h1 className='app-title'>なにかごようでしょうか？</h1>
          </div>
        )}
        <Input parentCallback={handleInputSubmit} className={userPrompt.length > 0 ? "has-prompt" : ""} />
        {userPrompt.length > 0 && (
          <PromptContainer userPrompt={userPrompt} />
        )}
      </section>
    </section>
  )
}

export default App
