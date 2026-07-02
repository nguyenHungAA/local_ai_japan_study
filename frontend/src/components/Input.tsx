const Input = () => {
    return (
        <p
            data-placeholder="Ask anything"
            contentEditable="true"
            role="textbox"
            inputMode="text"
            spellCheck="true"
            aria-multiline="true"
            className="input-field"
        />
    );
}

export default Input;