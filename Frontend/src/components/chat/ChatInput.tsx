
"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { PaperclipIcon, SendIcon } from "lucide-react"
import { TypewriterEffectCycle } from "../../components/ui/TypewriterPlaceholder"

interface ChatInputProps {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  isLoading: boolean
  documentId?: string | null
  fileInputRef?: React.RefObject<HTMLInputElement>
  handleFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  file?: File | null
  validateAndUpload?: () => Promise<void>
  isUploading?: boolean
  mode?: "document" | "image" | "video"
  allowChatWithoutFile?: boolean
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
  isUploading,
  mode = "document",
  allowChatWithoutFile = false,
}: ChatInputProps) => {
  const [isTypewriterActive, setIsTypewriterActive] = useState(true)

  const canSubmit = () => {
    if (allowChatWithoutFile) {
      return input.trim() && !isLoading
    }
    return input.trim() && !isLoading && (documentId || mode !== "document")
  }

  const handleInputFocus = () => {
    setIsTypewriterActive(false)
  }

  const handleInputBlur = () => {
    if (!input.trim()) {
      setIsTypewriterActive(true)
    }
  }

  return (
    <div className="border-t border-[#3E3D43] p-4 bg-[#2D2A33]">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        {/* File upload button - only show for document mode or when file handling is provided */}
        {(mode === "document" || fileInputRef) && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={mode === "document" ? ".pdf" : mode === "image" ? "image/*" : ".mp4,.mov,.avi,.mkv"}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef?.current?.click()}
              className="p-2 rounded-full text-gray-300 hover:bg-[#3E3D43] transition-colors"
              title={`Attach ${mode}`}
              disabled={isUploading}
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Upload button - only show when file is selected but not uploaded */}
        {file && !documentId && validateAndUpload && (
          <Button
            onClick={validateAndUpload}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}

        {/* Input field with typewriter effect */}
        <div className="flex-1 relative bg-[#333333] border border-[#3E3D43] rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-[#9b87f5]">
          <TypewriterEffectCycle
            mode={mode}
            isActive={isTypewriterActive}
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            disabled={isLoading}
            className="text-white placeholder-gray-500"
          />
        </div>

        {/* Send button */}
        <Button
          type="submit"
          disabled={!canSubmit()}
          className="rounded-full p-2 bg-[#7E69AB] text-white hover:bg-[#9b87f5] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="h-5 w-5" />
        </Button>
      </form>

      {/* Helper text */}
      {!allowChatWithoutFile && !documentId && mode === "document" && (
        <p className="text-xs text-gray-400 mt-2 px-2">
          Upload a document to start chatting, or enable general chat mode
        </p>
      )}
    </div>
  )
}

