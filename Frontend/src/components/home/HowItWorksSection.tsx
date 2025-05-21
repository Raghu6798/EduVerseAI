import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, MessageSquare, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="h-10 w-10 text-purple-600" />,
    title: "Upload Material",
    description: "Upload any academic content - PDFs, videos, images, or audio files directly to our secure platform.",
    color: "bg-purple-50 dark:bg-slate-800 border-purple-100 dark:border-purple-900",
    number: "1",
    image: "https://images.pexels.com/photos/5905885/pexels-photo-5905885.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    icon: <Search className="h-10 w-10 text-blue-600" />,
    title: "Ask Any Academic Question",
    description: "Type your question in natural language about specific content, concepts, or for clarification on any topic.",
    color: "bg-blue-50 dark:bg-slate-800 border-blue-100 dark:border-blue-900",
    number: "2",
    image: "https://www.factsmostly.com/wp-content/uploads/2024/06/Group-Discussion.webp"
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-pink-600" />,
    title: "Get Contextual Answers",
    description: "Receive accurate, cited responses that draw directly from your uploaded materials with relevant context.",
    color: "bg-pink-50 dark:bg-slate-800 border-pink-100 dark:border-pink-900",
    number: "3",
    image: "https://media.istockphoto.com/id/1403897241/photo/university-students-studying-together-in-the-library.jpg?s=612x612&w=0&k=20&c=Pz2irLkgzJ6ShZceFFp4oZ7i242SXBSyAUIBNzEaMNs="
  },
  {
    icon: <Sparkles className="h-10 w-10 text-amber-600" />,
    title: "Enhance Your Learning",
    description: "Save answers for later, generate study materials, and improve your understanding with related concepts.",
    color: "bg-amber-50 dark:bg-slate-800 border-amber-100 dark:border-amber-900",
    number: "4",
    image: "https://images.pexels.com/photos/5905925/pexels-photo-5905925.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

const HowItWorksSection: React.FC = () => {
  return (
    <motion.section
      className="py-20 bg-slate-50 dark:bg-slate-800"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Our intuitive process makes it easy to get the academic help you need in just a few simple steps.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-purple-200 dark:bg-purple-900/30 -ml-0.5"></div>
            
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="relative mb-12"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className={`md:flex items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                  <div className="md:w-1/2 p-6">
                    <div className="flex items-center mb-4">
                      <div className={`flex items-center justify-center h-14 w-14 rounded-full ${step.color} border-2 mr-4 relative z-10`}>
                        {step.icon}
                      </div>
                      <span className="bg-purple-600 text-white text-xl font-bold h-8 w-8 rounded-full flex items-center justify-center">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">{step.description}</p>
                  </div>

                  <div className="md:w-1/2 mt-6 md:mt-0">
                    <div className={`bg-white dark:bg-slate-700 rounded-lg shadow-md p-2 border border-slate-200 dark:border-slate-600 ${index % 2 === 0 ? 'md:ml-6' : 'md:mr-6'}`}>
                      <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                        <img 
                          src={step.image}
                          alt={`Step ${index + 1}: ${step.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default HowItWorksSection;