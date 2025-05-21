import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Message } from './ChatInterface';
import { TypewriterInput } from '../ui/TypewriterPlaceholder';


export const ChatMessage = ({ message }: { message: Message }) => {
  return (
    <>
      {message.sender === 'user' && <TypewriterPlaceholder />}
      <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
        <div
          className={cn(
            "max-w-3/4 rounded-lg px-4 py-2",
            message.sender === "user"
              ? "bg-[#9b87f5] text-white"
              : message.isContext
              ? "bg-[#2D2A33] text-gray-300 border-l-4 border-[#3E3D43] text-sm"
              : "bg-[#2D2A33] text-white"
          )}
        >
          <ReactMarkdown 
            className="prose prose-invert max-w-none"
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
};