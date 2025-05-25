"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
  GraduationCap,
  Moon,
  Sun,
  ChevronDown,
  FileText,
  ImageIcon,
  Video,
  Headphones,
  LogOut,
  User,
  CreditCard
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Avatar from "../ui/Avatar"

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [showLogoutMessage, setShowLogoutMessage] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const featuresDropdownRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  const features = [
    {
      name: "Document Analysis",
      description: "Extract insights from PDFs and documents",
      icon: FileText,
      path: "/document-qa",
      requiredPlan: "basic",
    },
    {
      name: "Image Analysis",
      description: "Analyze images and diagrams with AI",
      icon: ImageIcon,
      path: "/image-qa",
      requiredPlan: "standard",
    },
    {
      name: "Video Analysis",
      description: "Extract insights from videos and lectures",
      icon: Video,
      path: "/video-qa",
      requiredPlan: "standard",
    },
    {
      name: "Audio Analysis",
      description: "Transcribe and analyze audio content",
      icon: Headphones,
      path: "/audio-qa",
      requiredPlan: "premium",
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // setIsDropdownOpen(false)
      }
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target as Node)) {
        setFeaturesOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    setIsOpen(false)
    setFeaturesOpen(false)
    setIsProfileDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(darkMode)
    document.documentElement.classList.toggle("dark", darkMode)
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))
    document.documentElement.classList.toggle("dark", newMode)
  }

  const toggleFeatures = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFeaturesOpen(!featuresOpen)
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleLogout = async () => {
    setShowLogoutMessage(true)
    setIsProfileDropdownOpen(false)
    await signOut()
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <GraduationCap className="h-6 w-6 text-purple-600" />
          <span>
            <span className="text-purple-600">Edu</span>Verse
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
            <div className="relative" ref={featuresDropdownRef}>
              <button
                onClick={toggleFeatures}
                className="flex items-center hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Features
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
              </button>

              {featuresOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden z-50 border border-slate-200 dark:border-slate-700">
                  <div className="p-4 bg-purple-50 dark:bg-slate-700">
                    <h3 className="text-sm font-medium text-purple-800 dark:text-purple-300">
                      AI-Powered Analysis Tools
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Extract insights from various content types
                    </p>
                  </div>

                  <div className="p-2">
                    {features.map((feature) => (
                      <Link
                        key={feature.path}
                        to={feature.path}
                        className="flex items-start p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                      >
                        <feature.icon className="h-6 w-6 text-purple-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white">{feature.name}</h4>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              {feature.requiredPlan}+
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{feature.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/pricing" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              About
            </Link>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Auth Section */}
          {/* Conditional rendering based on user authentication */}
          {!user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/signin"
                className="text-sm font-medium text-slate-700 dark:text-white hover:text-purple-600 dark:hover:text-purple-400"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow transition-colors"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <div className="relative flex items-center gap-4" ref={profileDropdownRef}>
              <button onClick={toggleProfileDropdown} className="focus:outline-none">
                <Avatar src={user.user_metadata?.avatar_url as string} name={user.email} size="md" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg overflow-hidden z-50 border border-slate-200 dark:border-slate-700">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/credits"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <CreditCard size={16} />
                      Credits
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {showLogoutMessage && (
                <span className="text-sm text-slate-600 dark:text-slate-400">Logging out...</span>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden text-slate-700 dark:text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden py-4 px-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col space-y-4">
            <div>
              <button
                onClick={toggleFeatures}
                className="flex items-center w-full py-2 text-slate-700 dark:text-slate-300"
              >
                Features
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
              </button>

              {featuresOpen && (
                <div className="pl-4 pb-2 space-y-2 mt-2 border-l-2 border-slate-200 dark:border-slate-700">
                  {features.map((feature) => (
                    <Link
                      key={feature.path}
                      to={feature.path}
                      className="flex items-center py-2 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      <feature.icon className="h-5 w-5 mr-2" />
                      <span>{feature.name}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {feature.requiredPlan}+
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/pricing" className="text-slate-700 dark:text-slate-300">
              Pricing
            </Link>
            <Link to="/about" className="text-slate-700 dark:text-slate-300">
              About
            </Link>
            {/* Conditional rendering for mobile view as well */}
            {!user ? (
              <>
                <Link to="/signin" className="text-slate-700 dark:text-white">
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md shadow transition-colors"
                >
                  Sign up
                </Link>
              </>
            ) : (
               <button
                onClick={handleLogout}
                className="flex items-center w-full py-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <LogOut size={20} className="mr-2" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
