"use client"

import React, { useState, useRef, useEffect } from "react"
import axios from "axios"
import { z } from "zod"
import { useAuth } from "../../context/AuthContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PaperclipIcon, SendIcon } from "lucide-react"
import Button from "../ui/Button"
import { ChatMessage } from "../chat/ChatMessage"
import { WelcomeMessage } from "../chat/WelcomeMessage"
import { FileUploadButton } from "../chat/FileUploadButton"
import { ChatHeader } from "../chat/ChatHeader"
import { ChatInput } from "../chat/ChatInput"
import { cn } from "@/lib/utils"

// Zod schemas for API validation
const DocumentUploadResponseSchema = z.object({
  document_id: z.string(),
  page_count: z.number(),
  message: z.string(),
})

const DocumentQAResponseSchema = z.object({
  answer: z.string(),
  context: z.array(z.string()).optional(),
})

type DocumentUploadResponse = z.infer<typeof DocumentUploadResponseSchema>
type DocumentQAResponse = z.infer<typeof DocumentQAResponseSchema>

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  isContext?: boolean
}

export const ChatInterface = ({ mode }: { mode: string }) => {
  const { session: supabaseSession } = useAuth()

  // Document QA state
  const [file, setFile] = useState<File | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [input, setInput] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Image QA state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageId, setImageId] = useState<string | null>(null)
  const [imageDescription, setImageDescription] = useState<string>("")
  const [imageQuestion, setImageQuestion] = useState<string>("")
  const [imageAnswer, setImageAnswer] = useState<string>("")
  const [imageContextSnippets, setImageContextSnippets] = useState<string[]>([])
  const [imageIsLoading, setImageIsLoading] = useState<boolean>(false)
  const [imageIsUploading, setImageIsUploading] = useState<boolean>(false)

  // Video QA state
  const [videoResponse, setVideoResponse] = useState<string>("")
  const [videoMessage, setVideoMessage] = useState<string>("")
  const [videoIsLoading, setVideoIsLoading] = useState<boolean>(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState<string>("")
  const [videoFileIsUploading, setVideoFileIsUploading] = useState<boolean>(false)
  const videoFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, imageAnswer, videoResponse])

  // Document QA handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null
    setFile(selectedFile)
    setDocumentId(null)
    setError(null)

    if (selectedFile) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Document selected: ${selectedFile.name}`,
          sender: "assistant",
        },
      ])
    }
  }

  const validateAndUpload = async () => {
    if (!file) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Please select a file first.",
          sender: "assistant",
        },
      ])
      return
    }

    setIsUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append("file", file)

    try {
      // ✅ Get the session token
      const token = supabaseSession?.access_token

      const response = await axios.post("http://localhost:8000/api/v1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // ✅ Add token here
        },
      })

      const validatedData = DocumentUploadResponseSchema.parse(response.data)

      setDocumentId(validatedData.document_id)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: `Document uploaded successfully! ${validatedData.page_count} pages processed. You can now ask questions about this document.`,
          sender: "assistant",
        },
      ])
    } catch (err) {
      handleApiError(err, "upload")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessageId = Date.now().toString()
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setError(null)

    if (!documentId) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Please upload a document first using the attachment button.",
          sender: "assistant",
        },
      ])
      return
    }

    setIsLoading(true)
    try {
      const token = supabaseSession?.access_token // ✅ Get token

      const response = await axios.post(
        "http://localhost:8000/api/v1/ask",
        {
          question: input,
          document_id: documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Include token
          },
        },
      )

      const validatedData = DocumentQAResponseSchema.parse(response.data)

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: validatedData.answer,
          sender: "assistant",
        },
      ])
    } catch (err) {
      handleApiError(err, "question")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiError = (err: unknown, action: string) => {
    console.error(`${action} error:`, err)

    let errorMessage = `Error processing ${action}`

    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.detail || errorMessage
    } else if (err instanceof z.ZodError) {
      errorMessage = "Invalid response format from server"
      console.error("Validation errors:", err.errors)
    }

    setError(errorMessage)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: errorMessage,
        sender: "assistant",
      },
    ])
  }

  // Image QA handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    setImagePreview(file ? URL.createObjectURL(file) : null)
    setImageId(null)
    setImageDescription("")
    setImageAnswer("")
    setImageContextSnippets([])
  }

  const handleImageUpload = async () => {
    if (!imageFile) return
    setImageIsUploading(true)
    setImageDescription("")
    setImageId(null)
    setImageAnswer("")
    setImageContextSnippets([])
    try {
      const token = supabaseSession?.access_token
      const formData = new FormData()
      formData.append("file", imageFile)
      const res = await axios.post("http://127.0.0.1:8000/image-qa/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })
      setImageDescription(res.data.description)
      setImageId(res.data.image_id)
    } catch (err) {
      setImageDescription("Error uploading image.")
      console.error("Image upload error:", err)
    } finally {
      setImageIsUploading(false)
    }
  }

  const handleImageAsk = async () => {
    if (!imageId || !imageQuestion.trim()) return
    setImageIsLoading(true)
    setImageAnswer("")
    setImageContextSnippets([])
    try {
      const token = supabaseSession?.access_token
      const res = await axios.post(
        "http://127.0.0.1:8000/image-qa/ask",
        {
          image_id: imageId,
          question: imageQuestion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setImageAnswer(res.data.answer)
      setImageContextSnippets(res.data.context_snippets || [])
    } catch (err) {
      setImageAnswer("Error getting answer.")
      console.error("Image question error:", err)
    } finally {
      setImageIsLoading(false)
    }
  }

  // Video QA handlers
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setVideoFile(file)
    setVideoResponse("")
    setVideoMessage("")
  }

  const triggerVideoFileInput = () => {
    videoFileInputRef.current?.click()
  }

  const handleVideoFileUpload = async () => {
    if (!videoFile) return

    setVideoFileIsUploading(true)
    setVideoResponse("")
    setVideoMessage("")

    try {
      const token = supabaseSession?.access_token
      const formData = new FormData()
      formData.append("file", videoFile)

      const res = await axios.post("http://127.0.0.1:8000/video-qa/upload-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      setVideoResponse(res.data.response_text)
      setVideoMessage(res.data.message)
    } catch (err: any) {
      console.error("Video upload error:", err)
      setVideoMessage(
        axios.isAxiosError(err) ? err.response?.data?.detail || "Error uploading video" : "Error uploading video",
      )
    } finally {
      setVideoFileIsUploading(false)
    }
  }

  const handleYoutubeUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setVideoIsLoading(true)
    setVideoResponse("")
    setVideoMessage("")

    try {
      const token = supabaseSession?.access_token
      const res = await fetch("http://127.0.0.1:8000/video-qa/process-youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: youtubeUrl.trim() }),
      })

      if (!res.ok) throw new Error("Failed to process YouTube video.")

      const data = await res.json()
      setVideoResponse(data.response_text)
      setVideoMessage(data.message)
      setYoutubeUrl("")
    } catch (err) {
      console.error("YouTube processing error:", err)
      setVideoMessage("Error processing YouTube video.")
    } finally {
      setVideoIsLoading(false)
    }
  }

  const extractVideoId = (url: string) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/
    const match = url.match(regex)
    return match ? match[1] : null
  }

  // Render based on mode
  if (mode === "video") {
    const videoId = extractVideoId(youtubeUrl)
    const videoSource = videoId ? `https://www.youtube.com/embed/${videoId}` : null

    return (
      <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
        <ChatHeader title="Video AI Assistant" subtitle="Process a YouTube video or upload your own" mode="video" />

        {videoSource && !videoFile && (
          <iframe
            width="100%"
            height="315"
            src={videoSource}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg my-4 mx-4"
          />
        )}

        <div className="flex-1 p-4 overflow-y-auto bg-[#221F26]">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-white">Process YouTube Video</h3>
            <form onSubmit={handleYoutubeUrlSubmit} className="flex gap-2">
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="flex-1 bg-[#2D2A33] text-white border border-[#3E3D43] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]"
                disabled={videoIsLoading}
              />
              <Button
                type="submit"
                disabled={videoIsLoading || !youtubeUrl.trim()}
                className="px-4 bg-[#7E69AB] text-white rounded disabled:opacity-50 hover:bg-[#9b87f5]"
              >
                {videoIsLoading ? "Processing..." : "Process"}
              </Button>
            </form>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3E3D43]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#221F26] text-gray-400">OR</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-white">Upload Video File</h3>
            <input
              type="file"
              ref={videoFileInputRef}
              onChange={handleVideoFileChange}
              accept=".mp4,.mov,.avi,.mkv"
              className="hidden"
              disabled={videoFileIsUploading}
            />
            <div className="flex gap-2">
              <Button
                onClick={triggerVideoFileInput}
                className="flex items-center gap-2 bg-[#7E69AB] text-white px-3 py-1 rounded hover:bg-[#9b87f5]"
                disabled={videoFileIsUploading}
              >
                <PaperclipIcon className="h-4 w-4" />
                Select Video
              </Button>
              {videoFile && (
                <Button
                  onClick={handleVideoFileUpload}
                  disabled={videoFileIsUploading}
                  className="bg-[#9b87f5] text-white px-3 py-1 rounded disabled:opacity-50 hover:bg-[#7E69AB]"
                >
                  {videoFileIsUploading ? "Uploading..." : "Upload & Process"}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 bg-[#2D2A33] border-[#3E3D43] border rounded shadow-sm min-h-[150px] text-white">
            {videoResponse ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {videoResponse}
                </ReactMarkdown>
              </div>
            ) : videoMessage ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {videoMessage}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-400">Results will appear here.</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (mode === "image") {
    return (
      <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
        <ChatHeader title="Image Analysis" subtitle={imageId ? "Image loaded - Ask anything about it" : "Upload an image to begin"} mode="image" />
        
        <div className="flex-1 p-4 overflow-y-auto bg-[#221F26]">
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-200">Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-[#2D2A33] file:text-[#D6BCFA]
                hover:file:bg-[#3E3D43]"
            />
            {/* Only show image preview and analyze button if a file is selected */}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Uploaded preview"
                  className="max-w-full h-auto rounded-lg shadow-sm border border-[#3E3D43]"
                />
                <Button 
                  onClick={handleImageUpload} 
                  disabled={imageIsUploading} 
                  className="mt-4 bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
                >
                  {imageIsUploading ? "Analyzing..." : "Analyze Image"}
                </Button>
              </div>
            )}
          </div>
          {imageDescription && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                imageDescription.startsWith("Error") ? "bg-red-900/30 text-red-300" : "bg-[#3E3D43] text-blue-300"
              }`}
            >
              <h3 className="font-semibold">Analysis Results:</h3>
              <p>{imageDescription}</p>
            </div>
          )}
          {imageId && (
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageQuestion}
                  onChange={(e) => setImageQuestion(e.target.value)}
                  placeholder="Ask about this image..."
                  className="flex-1 bg-[#2D2A33] text-white border border-[#3E3D43] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleImageAsk()
                  }}
                />
                <Button 
                  onClick={handleImageAsk} 
                  disabled={imageIsLoading || !imageQuestion.trim()} 
                  className="px-4 bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
                >
                  {imageIsLoading ? "Asking..." : "Ask"}
                </Button>
              </div>
            </div>
          )}
          {imageAnswer && (
            <div className="mb-4 p-3 bg-[#2D2A33] rounded-lg border border-[#3E3D43] text-white">
              <h3 className="font-semibold">Answer:</h3>
              <p>{imageAnswer}</p>
              {imageContextSnippets.length > 0 && (
                <div className="mt-2">
                  <h4 className="font-semibold text-sm">Key Points:</h4>
                  <ul className="list-disc pl-5 mt-1 text-sm">
                    {imageContextSnippets.map((snippet, idx) => (
                      <li key={idx}>{snippet}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default document mode
  return (
    <div className="flex flex-col h-[80vh] max-w-6xl mx-auto bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
      <ChatHeader 
        title="Document Q&A Assistant" 
        subtitle={documentId ? "Document loaded - Ask anything about it" : "Upload a PDF document to begin"}
        mode="document" 
      />

      <div className="flex-1 p-4 overflow-y-auto bg-[#221F26]">
        {messages.length === 0 ? (
          <WelcomeMessage onSelectFile={() => fileInputRef.current?.click()} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (

<ChatMessage key={message.id} message={message} isDocumentUploaded={documentId !== null} />
            ))}
            {(isLoading || isUploading) && (
              <div className="flex justify-start">
                <div className="bg-[#2D2A33] text-gray-300 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="bg-red-900/30 text-red-300 rounded-lg px-4 py-2">{error}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        documentId={documentId}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        file={file}
        validateAndUpload={validateAndUpload}
        isUploading={isUploading}
      />
    </div>
  )
}
