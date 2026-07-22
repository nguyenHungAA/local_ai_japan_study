import { useCallback, useEffect, useRef } from "react";
import type { FormEvent } from "react";

type InputProps = {
    parentCallback: (inputText: string) => void;
    className?: string;
};

const Input = ({ parentCallback, className = "" }: InputProps) => {
    const inputRef = useRef<HTMLParagraphElement>(null);

    const handleInputPlaceholder = () => {
        const element = inputRef.current;

        if (!element) {
            return;
        }

        const isEmpty = element.innerText.trim() === "" && (element.innerHTML === "<br>" || element.innerHTML === "");
        element.classList.toggle("is-empty", isEmpty);
    }

    const handleSubmit = useCallback((e: FormEvent | KeyboardEvent) => {
        e.preventDefault();
        const element = inputRef.current;

        if (!element) {
            return;
        }

        parentCallback(element.innerText);
        element.innerText = "";
    }, [parentCallback]);

    useEffect(() => {
        handleInputPlaceholder();
    });

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            const element = inputRef.current;

            if (element?.innerText && (event.code === "Enter" || event.code === "NumpadEnter")) {
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
