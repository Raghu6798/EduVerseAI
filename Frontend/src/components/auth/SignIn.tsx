import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Navbar from '../layout/Navbar';
import { AuroraGradientBackground } from '../ui/ParticlesBackground';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

// Form element animation variants
const formVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Handle component mount animation
  useEffect(() => {
    setIsVisible(true);

    // Focus on email input after animation completes
    const timer = setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) emailInput.focus();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle standard email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // Animation out before navigation
      setIsVisible(false);
      setTimeout(() => navigate('/', { state: { from: 'signin' } }), 300);
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  // Handle Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      // For Google OAuth, we should NOT handle navigation here
      // Supabase will redirect to Google's authentication page
      await signInWithGoogle();
      // No animation or navigation needed - Supabase handles it
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  // Custom link handler for smooth navigation
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setIsVisible(false);
    setTimeout(() => navigate(path, { state: { from: 'signin' } }), 300);
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden">
        <AuroraGradientBackground />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate={isVisible ? "in" : "out"}
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8"
          >
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-center text-3xl font-extrabold text-white"
              >
                Sign in to your account
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-center text-sm text-gray-600"
              >
                Or{' '}
                <a
                  href="/signup"
                  onClick={(e) => handleLinkClick(e, '/signup')}
                  className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                >
                  create a new account
                </a>
              </motion.p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded bg-red-50 text-red-700 flex items-center gap-2"
                    >
                      <AlertCircle size={18} />
                      <span>{error}</span>
                    </motion.div>
                  )}
             
                  <motion.form 
                    className="space-y-6" 
                    onSubmit={handleSignIn}
                    variants={formVariants}
                    initial="hidden"
                    animate="show"
                  >
                    <motion.div variants={itemVariants}>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <div className="mt-1">
                        <input
                          id="password"
                          name="password"
                          type="password"
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors duration-200"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <a 
                          href="/reset-password" 
                          onClick={(e) => handleLinkClick(e, '/reset-password')}
                          className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                        >
                          Forgot your password?
                        </a>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit" 
                        className="w-full flex justify-center" 
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 mr-2" />
                            Sign in
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>

                  <motion.div 
                    variants={itemVariants}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6"
                  >
                    <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
            

                    <div className="mt-6">
                      <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        variant="outline"
                        className="w-full justify-center"
                        disabled={loading}
                      >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                            <path
                              fill="#4285F4"
                              d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                            />
                            <path
                              fill="#34A853"
                              d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                            />
                            <path
                              fill="#EA4335"
                              d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                            />
                          </g>
                        </svg>
                        Sign in with Google
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default SignIn;