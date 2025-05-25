"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { motion, stagger, useAnimate, useInView } from "motion/react";

const documentMessages = [
  "Ask me to summarize a complex research paper...",
  "Need help explaining a tough concept? Just ask...",
  "Request an outline for your upcoming essay...",
  "Curious about a topic? Let me clarify it for you...",
  "Help me break down this chapter into key points...",
  "Quiz me on important terms from your notes...",
  "Ask for examples to deepen your understanding...",
  "Let's explore interdisciplinary connections...",
  "Request a detailed explanation or analogy...",
  "Ask DOCA to generate questions for exam prep...",
];

const imageMessages = [
  "Describe what you see in this image...",
  "What objects can you identify here?",
  "Analyze the composition and colors...",
  "What's the mood or atmosphere of this image?",
  "Can you read any text in this image?",
  "What's happening in this scene?",
  "Identify any people or faces...",
  "What's the artistic style of this image?",
  "Describe the lighting and shadows...",
  "What story does this image tell?",
];

const videoMessages = [
  "Summarize the key points from this video...",
  "What are the main topics discussed?",
  "Extract important quotes or statements...",
  "Who are the speakers in this video?",
  "What's the overall message or theme?",
  "Break down the video into chapters...",
  "What questions does this video answer?",
  "Identify key moments or timestamps...",
  "What can I learn from this content?",
  "Generate study notes from this video...",
];

interface TypewriterEffectCycleProps {
  className?: string;
  cursorClassName?: string;
  mode?: 'document' | 'image' | 'video';
  isActive?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const TypewriterEffectCycle = ({
  className,
  cursorClassName,
  mode = 'document',
  isActive = true,
  value,
  onChange,
  disabled,
  onFocus,
  onBlur,
}: TypewriterEffectCycleProps) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Select messages based on mode
  const getMessages = () => {
    switch (mode) {
      case 'image':
        return imageMessages;
      case 'video':
        return videoMessages;
      default:
        return documentMessages;
    }
  };

  const messages = getMessages();
  const currentChars = messages[msgIndex].split("");

  // Animate letters on viewport enter
  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);

  useEffect(() => {
    if (isInView && isActive && !isFocused) {
      animate(
        "span.char",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: 0.3,
          delay: stagger(0.05),
          ease: "easeInOut",
        }
      );
    }
  }, [isInView, msgIndex, animate, isActive, isFocused]);

  // Cycle through messages every 5 seconds
  useEffect(() => {
    if (!isActive || isFocused) return;
    
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length, isActive, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  // If this is being used as an input field
  if (onChange) {
    return (
      <div className="relative flex-1">
        <input
          type="text"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "w-full bg-transparent text-white border-0 outline-none placeholder-transparent",
            className
          )}
        />
        {!isFocused && !value && isActive && (
          <div
            ref={scope}
            className={cn(
              "absolute inset-0 pointer-events-none text-gray-500 flex items-center",
              className
            )}
            style={{ minHeight: "2rem" }}
          >
            {currentChars.map((char, i) => (
              <motion.span
                key={`char-${i}`}
                className={cn("char opacity-0", cursorClassName)}
                aria-hidden="true"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
              className={cn(
                "inline-block rounded-sm w-[2px] h-4 bg-blue-500 ml-1",
                cursorClassName
              )}
            />
          </div>
        )}
      </div>
    );
  }

  // Display-only version
  return (
    <div
      ref={scope}
      className={cn(
        "text-sm sm:text-base md:text-lg lg:text-xl font-bold text-center p-4",
        className
      )}
      style={{ minHeight: "4rem" }}
    >
      {isActive && (
        <>
          {currentChars.map((char, i) => (
            <motion.span
              key={`char-${i}`}
              className={cn("char opacity-0", cursorClassName)}
              aria-hidden="true"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            className={cn(
              "inline-block rounded-sm w-[4px] h-6 bg-blue-500 align-bottom ml-1",
              cursorClassName
            )}
          />
        </>
      )}
    </div>
  );
};
