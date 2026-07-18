const ConversationContainer = ({ userPrompt, modelResponse }) => {
    return (
        <div className="conversation-container">
            {userPrompt.map((prompt, index) => (
                <div key={index} className="message-wrapper">
                    {prompt}
                </div>
            ))}
            {modelResponse.map((response, index) => (
                <div key={index} className="left">
                    {response}
                </div>
            ))}
        </div>
    );
};

export default ConversationContainer;
