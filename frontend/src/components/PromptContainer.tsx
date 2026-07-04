const PromptContainer = ({ userPrompt }) => {
    return (
        <div className="prompt-container">
            {userPrompt.map((prompt, index) => (
                <div key={index} className="prompt">
                    {prompt}
                </div>
            ))}
        </div>
    );
};

export default PromptContainer;
