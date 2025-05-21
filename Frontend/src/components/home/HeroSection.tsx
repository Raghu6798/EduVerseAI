import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden pt-32 md:pt-40 pb-16">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto"> {/* Changed from max-w-5xl to max-w-7xl */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="text-slate-900 dark:text-white">Your Smart </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                Study Companion
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              AI that understands your textbooks, lectures, diagrams, and notes — and helps you learn faster.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="px-6 py-3 font-medium">
                  Try It Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" className="px-6 py-3 font-medium">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 mx-auto"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
              <img 
                src="https://media.istockphoto.com/id/1757344400/photo/smiling-college-student-writing-during-a-class-at-the-university.jpg?s=612x612&w=0&k=20&c=_o2ZaJedvI0VfuH2rjGjMpYqXlBm_0BUv9Qxy2tHqK0="
                alt="Student using ScholarAI" 
                className="w-full h-auto object-cover min-h-[400px] md:min-h-[500px]" 
                style={{ width: '100%', maxWidth: 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6 md:p-8 text-white">
                  <p className="text-lg md:text-xl font-medium">
                    Get contextual answers to your questions from any learning material
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;