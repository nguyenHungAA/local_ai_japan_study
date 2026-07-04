import { useCallback, useEffect, useRef } from "react";

const Input = ({ parentCallback, className }) => {
    const inputRef = useRef<HTMLParagraphElement>(null);

    const handleInputPlaceholder = () => {
        const element = inputRef.current!;
        const isEmpty = element.innerText.trim() === "" && (element.innerHTML === "<br>" || element.innerHTML === "");
        element.classList.toggle("is-empty", isEmpty);
    }

    const handleSubmit = useCallback((e) => {
        parentCallback(inputRef.current!.innerText);
        inputRef.current!.innerText = "";
        handleInputPlaceholder();
        e.preventDefault();
    }, [parentCallback]);

    useEffect(() => {
        handleInputPlaceholder();
    }, []);

    useEffect(() => {
        const listener = event => {
            if (inputRef.current.innerText && (event.code === "Enter" || event.code === "NumpadEnter")) {
                event.preventDefault();
                handleSubmit(event);
            }

        };
        document.addEventListener("keydown", listener);
        return () => {
            document.removeEventListener("keydown", listener);
        };
    }, [handleSubmit]);

    return (
        <p
            ref={inputRef}
            data-placeholder="Ask anything"
            contentEditable="true"
            onInput={handleInputPlaceholder}
            onSubmit={handleSubmit}
            role="textbox"
            inputMode="text"
            spellCheck="true"
            aria-multiline="true"
            className={`input-field ${className}`}
        />
    );
}

export default Input;