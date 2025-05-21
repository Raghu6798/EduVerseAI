import React, { useEffect, useState } from 'react';

const messages = [
  "Ask me to summarize a complex research paper...",
"Need help explaining a tough concept? Just ask...",
"Request an outline for your upcoming essay...",
"Curious about a topic? Let me clarify it for you...",
"Help me break down this chapter into key points...",
"Quiz me on important terms from your notes...",
"Ask for examples to deepen your understanding...",
"Let’s explore interdisciplinary connections...",
"Request a detailed explanation or analogy...",
"Ask DOCA to generate questions for exam prep..."
];

interface TypewriterInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
  disabled?: boolean;
}

export const TypewriterInput = ({ onChange, value, className, disabled }: TypewriterInputProps) => {
  const [text, setText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (value) {
      setText('');
      return;
    }

    const currentMessage = messages[msgIndex];
    let typingSpeed = deleting ? 50 : 100;

    const handleTyping = () => {
      if (!deleting && charIndex < currentMessage.length) {
        setText(currentMessage.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      } else if (deleting && charIndex > 0) {
        setText(currentMessage.slice(0, charIndex - 1));
        setCharIndex((prev) => prev - 1);
      } else if (!deleting && charIndex === currentMessage.length) {
        setTimeout(() => setDeleting(true), 1000);
        return;
      } else if (deleting && charIndex === 0) {
        setDeleting(false);
        setMsgIndex((prev) => (prev + 1) % messages.length);
        return;
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [charIndex, deleting, msgIndex, value]);

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={text}
      className={className}
      disabled={disabled}
      autoComplete="off"
    />
  );
};
