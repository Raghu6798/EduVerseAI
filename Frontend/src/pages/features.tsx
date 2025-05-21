import type React from "react"
import { Link } from "react-router-dom"
import { FileText, ImageIcon, Video, Headphones } from "lucide-react"
import Navbar from "../components/layout/Navbar"
import Footer from "../components/layout/Footer"

const Features: React.FC = () => {
  // Features with their details
  const features = [
    {
      id: "document-qa",
      name: "Document Analysis",
      description:
        "Upload PDFs and documents to extract insights, answer questions, and summarize content. Our AI analyzes text structure, identifies key concepts, and provides intelligent responses to your queries.",
      icon: FileText,
      path: "/document-qa",
      requiredPlan: "basic",
      color: "bg-purple-500",
      examples: [
        "Extract key information from research papers",
        "Ask questions about technical documentation",
        "Summarize lengthy reports and articles",
      ],
    },
    {
      id: "image-qa",
      name: "Image Analysis",
      description:
        "Upload images or provide URLs to analyze visual content. Our AI can identify objects, interpret diagrams, analyze charts, and answer questions about the visual elements in your images.",
      icon: ImageIcon,
      path: "/image-qa",
      requiredPlan: "standard",
      color: "bg-green-500",
      examples: [
        "Analyze scientific diagrams and illustrations",
        "Extract data from charts and graphs",
        "Identify objects and elements in photographs",
      ],
    },
    {
      id: "video-qa",
      name: "Video Analysis",
      description:
        "Upload video files or provide YouTube URLs to transcribe and analyze video content. Our AI extracts insights from lectures, presentations, and educational videos to help you learn more effectively.",
      icon: Video,
      path: "/video-qa",
      requiredPlan: "standard",
      color: "bg-blue-500",
      examples: [
        "Transcribe and analyze lecture videos",
        "Extract key points from educational content",
        "Ask questions about video presentations",
      ],
    },
    {
      id: "audio-qa",
      name: "Audio Analysis",
      description:
        "Upload audio files to transcribe and analyze spoken content. Our premium audio analysis tool converts speech to text and provides insights from podcasts, interviews, and recorded lectures.",
      icon: Headphones,
      path: "/audio-qa",
      requiredPlan: "premium",
      color: "bg-orange-500",
      examples: [
        "Transcribe podcast episodes and interviews",
        "Extract insights from recorded lectures",
        "Convert speech to searchable text",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              AI-Powered Learning Tools
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Unlock the power of AI to enhance your learning experience with our suite of analysis tools.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-700 transition-transform hover:scale-[1.02]"
              >
                <div className={`h-2 ${feature.color}`}></div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-2 rounded-lg ${feature.color} bg-opacity-10 mr-4`}>
                      <feature.icon className={`h-6 w-6 ${feature.color.replace("bg-", "text-")}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{feature.name}</h2>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {feature.requiredPlan}+ plan
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 mb-4">{feature.description}</p>

                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Example Use Cases:</h3>
                    <ul className="space-y-1">
                      {feature.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={feature.path}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    Try {feature.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Features
