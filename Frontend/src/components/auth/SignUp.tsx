import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import Navbar from '../layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraGradientBackground } from '../ui/ParticlesBackground';

// Enhanced animation variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.98
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.4
    }
  },
};

const formVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      delay: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Track if the component is mounted to prevent state updates after unmounting
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      
      if (isMounted) {
        setSuccess(true);
        setTimeout(() => {
          if (isMounted) {
            navigate('/', { 
              state: { 
                from: location.pathname,
                newUser: true 
              } 
            });
          }
        }, 2000);
      }
    } catch (error: any) {
      if (isMounted) {
        setError(error.message || 'Failed to sign up');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      if (isMounted) {
        setError(error.message || 'Failed to sign in with Google');
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100">
        {/* Aurora Gradient Background with absolute positioning */}
        <AuroraGradientBackground className="pointer-events-none absolute inset-0 -z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key="signup-page"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10"
          >
            <motion.div 
              className="sm:mx-auto sm:w-full sm:max-w-md"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                Create a new account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link to="/signin" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                  sign in to your existing account
                </Link>
              </p>
            </motion.div>

            <motion.div 
              className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <AnimatePresence>
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
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 p-3 rounded bg-green-50 text-green-700"
                    >
                      Account created successfully! Redirecting to Home Page
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.form 
                  className="space-y-6" 
                  onSubmit={handleSignUp}
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
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
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-all duration-200"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full flex justify-center"
                      disabled={loading || success}
                    >
                      {loading ? (
                        <Loader className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Sign up
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
                
                <motion.div 
                  className="mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
  onClick={handleGoogleSignIn}
  className="w-full flex justify-center items-center gap-2 border border-gray-300 hover:bg-gray-100"
  disabled={loading}
>
  {loading ? (
    <Loader className="w-5 h-5 animate-spin" />
  ) : (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="20"
        height="20"
        viewBox="0 0 48 48"
        className="w-5 h-5"
      >
        <path
          fill="#fbc02d"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
          s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20
          s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
        <path
          fill="#e53935"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039
          l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        ></path>
        <path
          fill="#4caf50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
          c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
        ></path>
        <path
          fill="#1565c0"
          d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
          c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        ></path>
      </svg>
      Continue with Google
    </>
  )}
</Button>

                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default SignUp;
