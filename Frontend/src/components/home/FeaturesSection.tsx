import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Video, ImageIcon, Headphones, 
  Brain, Shield, GraduationCap, Zap 
} from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-purple-600" />,
    title: "Understand PDFs & Research Papers",
    description: "Upload any academic document and ask questions about specific content, citations, or concepts."
  },
  {
    icon: <Video className="h-8 w-8 text-purple-600" />,
    title: "Ask Questions from Lecture Videos",
    description: "Extract insights from video lectures and get timestamped references to important explanations."
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-purple-600" />,
    title: "Image-based Doubt Solving",
    description: "Analyze diagrams, charts, and handwritten notes with our visual understanding system."
  },
  {
    icon: <Headphones className="h-8 w-8 text-purple-600" />,
    title: "Audio Notes to Insights",
    description: "Convert recorded lectures and audio notes into searchable, summarized content."
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-600" />,
    title: "Backed by LLM + Multimodal RAG",
    description: "Leveraging the latest AI technologies to provide accurate, contextual academic assistance."
  },
  {
    icon: <Shield className="h-8 w-8 text-purple-600" />,
    title: "Private, Secure, Student-first Design",
    description: "Your data remains private and secure, with user controls for data retention and deletion."
  },
  {
    icon: <GraduationCap className="h-8 w-8 text-purple-600" />,
    title: "Academic Integrity Focused",
    description: "Designed to enhance understanding, not replace critical thinking or violate academic integrity."
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-600" />,
    title: "Personalized Study Assistance",
    description: "Adapts to your learning style with contextually relevant explanations and examples."
  }
];

const FeaturesSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Comprehensive Learning Support
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Advanced features designed specifically for academic excellence and enhanced learning experiences.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 hover:shadow-md transition-shadow duration-300"
              variants={itemVariants}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;