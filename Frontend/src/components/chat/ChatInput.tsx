import React from 'react';
import { Button } from '@/components/ui/button';
import { PaperclipIcon, SendIcon } from 'lucide-react';
import { TypewriterInput } from '@/components/ui/TypewriterPlaceholder'; // adjust path if needed

interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  documentId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  validateAndUpload: () => Promise<void>;
  isUploading: boolean;
}

export const ChatInput = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
  documentId,
  fileInputRef,
  handleFileChange,
  file,
  validateAndUpload,
  isUploading
}: ChatInputProps) => {
  return (
    <div className="border-t border-[#3E3D43] p-4 bg-[#2D2A33]">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf" 
          className="hidden" 
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-gray-300 hover:bg-[#3E3D43] transition-colors"
          title="Attach document"
          disabled={isUploading}
        >
          <PaperclipIcon className="h-5 w-5" />
        </button>
        
        {file && !documentId && (
          <Button 
            onClick={validateAndUpload} 
            disabled={isUploading} 
            className="flex items-center gap-2 bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}

        <TypewriterInput
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-[#333333] text-white border border-[#3E3D43] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#9b87f5] placeholder-gray-500"
          disabled={!documentId || isLoading}
        />
        
        <Button
          type="submit"
          disabled={!input.trim() || isLoading || !documentId}
          className="rounded-full p-2 bg-[#7E69AB] text-white hover:bg-[#9b87f5] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};
