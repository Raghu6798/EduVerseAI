import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/home"
import Pricing from "./pages/pricing"
import Features from "./pages/features"
import SignIn from "./components/auth/SignIn"
import SignUp from "./components/auth/SignUp"
import { AuthProvider } from "./context/AuthContext"
import { DocumentChat } from './pages/document-chat'
import { VideoChat } from './pages/video-chat'
import { ImageChat } from './pages/image-chat'
import { Navbar } from "./components/layout/navbar"
import { Footer } from "./components/layout/footer"
import ProfilePage from "./pages/profile" 
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow container mx-auto px-4 py-8">
      {children}
    </main>
    <Footer />
  </div>
)

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Profile route wrapped in layout */}
          <Route
            path="/profile"
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />

          {/* Redirect old paths to new ones */}
          <Route path="/document-qa" element={<Navigate to="/document-chat" replace />} />
          <Route path="/image-qa" element={<Navigate to="/image-chat" replace />} />
          <Route path="/video-qa" element={<Navigate to="/video-chat" replace />} />

          {/* Render feature routes directly */}
          <Route 
            path="/document-chat" 
            element={
              <MainLayout>
                <DocumentChat />
              </MainLayout>
            } 
          />
          <Route 
            path="/video-chat" 
            element={
              <MainLayout>
                <VideoChat />
              </MainLayout>
            } 
          />
          <Route 
            path="/image-chat" 
            element={
              <MainLayout>
                <ImageChat />
              </MainLayout>
            } 
          />
          <Route 
            path="/audio-qa" 
            element={
              <MainLayout>
                <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 w-full max-w-2xl">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
                      Audio Analysis
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                      Audio analysis feature coming soon.
                    </p>
                  </div>
                </div>
              </MainLayout>
            } 
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
