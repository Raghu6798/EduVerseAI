"use client"
import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { z } from "zod"
import { useAuth } from "../../context/AuthContext"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { PaperclipIcon, SendIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "../chat/ChatMessage"
import { WelcomeMessage } from "../chat/WelcomeMessage"
import { ChatHeader } from "../chat/ChatHeader"
import { ChatInput } from "../chat/ChatInput"

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

// Updated schema to match backend response
const TimestampEmbedSchema = z.object({
  timestamp: z.string(),
  start_seconds: z.number(),
  embed_url: z.string(),
})

const YouTubeResponseSchema = z.object({
  response_text: z.string(),
  message: z.string(),
  timestamps: z.array(TimestampEmbedSchema).default([]),
})

type DocumentUploadResponse = z.infer<typeof DocumentUploadResponseSchema>
type DocumentQAResponse = z.infer<typeof DocumentQAResponseSchema>
type TimestampEmbed = z.infer<typeof TimestampEmbedSchema>
type YouTubeResponse = z.infer<typeof YouTubeResponseSchema>

export interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  isContext?: boolean
}

// Utility functions
function extractVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function extractTimestampsFromText(text: string): string[] {
  // Fallback function for text-based timestamp extraction
  const patterns = [
    /(\d{1,2}:\d{2}:\d{2})/g, // HH:MM:SS format
    /(\d{1,2}:\d{2})/g, // MM:SS format
    /^(\d{1,2}:\d{2})/gm, // Timestamps at start of lines
  ]

  const timestamps = new Set<string>()

  patterns.forEach((pattern) => {
    const matches = text.match(pattern) || []
    matches.forEach((match) => {
      const cleanTimestamp = match.trim().replace(/[^\d:]/g, "")
      if (cleanTimestamp.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        timestamps.add(cleanTimestamp)
      }
    })
  })

  return Array.from(timestamps).sort((a, b) => tsToSeconds(a) - tsToSeconds(b))
}

function tsToSeconds(ts: string): number {
  const parts = ts.split(":").map((part) => Number.parseInt(part, 10))

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 1) {
    return parts[0]
  }

  return 0
}

function buildEmbedUrl(youtubeUrl: string, timestamp: string): string {
  const videoId = extractVideoId(youtubeUrl)
  if (!videoId) throw new Error("Invalid YouTube URL")
  const seconds = tsToSeconds(timestamp)
  return `https://www.youtube.com/embed/${videoId}?start=${seconds}&autoplay=1`
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
  const [activeTimestamp, setActiveTimestamp] = useState<TimestampEmbed | null>(null)
  const [processedYoutubeUrl, setProcessedYoutubeUrl] = useState<string>("")
  const [extractedTimestamps, setExtractedTimestamps] = useState<TimestampEmbed[]>([])
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
      const token = supabaseSession?.access_token

      const response = await axios.post("http://localhost:8000/api/v1/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
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
      const token = supabaseSession?.access_token

      const response = await axios.post(
        "http://localhost:8000/api/v1/query",
        {
          question: input,
          document_id: documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    setExtractedTimestamps([])

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

      // Validate the response using Zod schema
      const validatedData = YouTubeResponseSchema.parse(data)

      setVideoResponse(validatedData.response_text)
      setVideoMessage(validatedData.message)
      setProcessedYoutubeUrl(youtubeUrl.trim())
      setExtractedTimestamps(validatedData.timestamps) // Use backend timestamps
      setYoutubeUrl("")

      console.log("Received timestamps from backend:", validatedData.timestamps)
    } catch (err) {
      console.error("YouTube processing error:", err)
      setVideoMessage("Error processing YouTube video.")
    } finally {
      setVideoIsLoading(false)
    }
  }

  const handleTimestampClick = (timestampEmbed: TimestampEmbed) => {
    console.log("Clicking timestamp:", timestampEmbed)
    setActiveTimestamp(timestampEmbed)
  }

  // Custom markdown components for rendering clickable timestamps
  const MarkdownComponents = {
    text: ({ children }: { children: React.ReactNode }) => {
      const value = children as string
      if (typeof value !== "string") return <>{children}</>

      // Only make timestamps clickable if we have processed timestamps from backend
      if (extractedTimestamps.length > 0 && processedYoutubeUrl) {
        const timestampStrings = extractedTimestamps.map((t) => t.timestamp)

        // Split text and make timestamps clickable
        const result: React.ReactNode[] = []
        let lastIndex = 0

        timestampStrings.forEach((timestamp) => {
          const timestampIndex = value.indexOf(timestamp, lastIndex)
          if (timestampIndex !== -1) {
            // Add text before timestamp
            if (timestampIndex > lastIndex) {
              result.push(value.substring(lastIndex, timestampIndex))
            }

            // Find the corresponding TimestampEmbed object
            const timestampEmbed = extractedTimestamps.find((t) => t.timestamp === timestamp)
            if (timestampEmbed) {
              result.push(
                <button
                  key={`${timestamp}-${timestampIndex}`}
                  onClick={() => handleTimestampClick(timestampEmbed)}
                  className="text-blue-400 hover:text-blue-300 underline cursor-pointer mx-1 px-1 py-0.5 rounded hover:bg-blue-900/20 transition-colors font-mono"
                  title={`Jump to ${timestamp} (${timestampEmbed.start_seconds} seconds)`}
                >
                  {timestamp}
                </button>,
              )
            }

            lastIndex = timestampIndex + timestamp.length
          }
        })

        // Add remaining text
        if (lastIndex < value.length) {
          result.push(value.substring(lastIndex))
        }

        return <span>{result}</span>
      }
      return <>{value}</>
    },

    p: ({ children }: { children: React.ReactNode }) => {
      return <p className="mb-2">{children}</p>
    },
  }

  // Render based on mode
  if (mode === "video") {
    const videoId = extractVideoId(processedYoutubeUrl || youtubeUrl)
    const videoSource = videoId ? `https://www.youtube.com/embed/${videoId}` : null

    return (
      <div className="flex flex-col h-[70vh] max-w-4xl mx-auto bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
        <ChatHeader title="Video AI Assistant" subtitle="Process a YouTube video or upload your own" mode="video" />

        {/* YouTube Video Preview Section */}
        <div className="relative">
          {activeTimestamp ? (
            <div className="relative">
              <iframe
                width="100%"
                height="315"
                src={activeTimestamp.embed_url}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
              <button
                onClick={() => setActiveTimestamp(null)}
                className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-black transition-colors"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                Playing from: {activeTimestamp.timestamp}
              </div>
            </div>
          ) : videoSource && !videoFile ? (
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
          ) : null}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-[#221F26]">
          {/* YouTube URL Input Section */}
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

          {/* Video Upload Section */}
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
            {videoFile && <p className="text-sm text-gray-400 mt-2">Selected: {videoFile.name}</p>}
          </div>

          {/* Results Display */}
          <div className="p-4 bg-[#2D2A33] border-[#3E3D43] border rounded shadow-sm min-h-[150px] text-white">
            {videoResponse ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                  {videoResponse}
                </ReactMarkdown>

                {/* Display all available timestamps as clickable buttons */}
                {extractedTimestamps.length > 0 && (
                  <div className="mt-6 p-4 bg-[#3E3D43] rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 text-yellow-300">
                      Jump to Timestamps ({extractedTimestamps.length} found):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extractedTimestamps.map((timestampEmbed, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleTimestampClick(timestampEmbed)}
                          className="px-3 py-2 bg-[#4A4754] text-blue-400 rounded-md text-sm hover:bg-[#5A5764] hover:text-blue-300 transition-colors border border-[#5A5764] font-mono"
                          title={`${timestampEmbed.start_seconds} seconds`}
                        >
                          {timestampEmbed.timestamp}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : videoMessage ? (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{videoMessage}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-gray-400">Results will appear here.</p>
            )}
          </div>

          {/* Debug section */}
          {extractedTimestamps.length > 0 && (
            <div className="mt-4 p-3 bg-gray-800 rounded text-xs">
              <details>
                <summary className="cursor-pointer text-gray-400">Debug: Backend Timestamps</summary>
                <div className="mt-2">
                  <p>Timestamps from backend: {extractedTimestamps.length}</p>
                  <p>Processed URL: {processedYoutubeUrl}</p>
                  <div className="mt-2 space-y-1">
                    {extractedTimestamps.map((ts, idx) => (
                      <div key={idx} className="text-gray-300">
                        {ts.timestamp} → {ts.start_seconds}s → {ts.embed_url}
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (mode === "image") {
    return (
      <div className="flex flex-col h-[80vh] max-w-4xl mx-auto bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
        <ChatHeader
          title="Image Analysis"
          subtitle={imageId ? "Image loaded - Ask anything about it" : "Upload an image to begin"}
          mode="image"
        />

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
                imageDescription.startsWith("Error") ? "bg-red-900/30 text-red-300" : "bg-[#3E3D43] text-blue-200"
              }`}
            >
              <h3 className="font-semibold text-yellow-200">Analysis Results:</h3>

              <div className="prose prose-sm prose-invert text-blue-200">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{imageDescription}</ReactMarkdown>
              </div>
            </div>
          )}

          {imageId && imageDescription && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask a question about the image..."
                  className="flex-1 p-2 bg-[#2D2A33] text-white border border-[#3E3D43] rounded-md focus:outline-none focus:ring-2 focus:ring-[#9b87f5]"
                  value={imageQuestion}
                  onChange={(e) => setImageQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleImageAsk()
                  }}
                />
                <Button
                  onClick={handleImageAsk}
                  disabled={imageIsLoading}
                  className="bg-[#7E69AB] hover:bg-[#9b87f5] text-white"
                >
                  {imageIsLoading ? "Asking..." : <SendIcon size={16} />}
                </Button>
              </div>

              {imageAnswer && (
                <div className="bg-[#3E3D43] text-cyan-200 p-3 rounded-lg">
                  <h4 className="font-medium text-yellow-200 mb-2">Answer:</h4>
                  <div className="prose prose-sm prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{imageAnswer}</ReactMarkdown>
                  </div>

                  {imageContextSnippets.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-semibold text-yellow-200">Context:</h5>
                      <ul className="list-disc pl-5 text-sm text-gray-300">
                        {imageContextSnippets.map((snippet, idx) => (
                          <li key={idx}>{snippet}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
