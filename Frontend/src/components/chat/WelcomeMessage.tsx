import React from 'react';
import Button from '../ui/Button';
import { BookUp, BrainCircuit, Sparkles, GraduationCap } from 'lucide-react';

interface WelcomeMessageProps {
  onSelectFile: () => void;
}

export const WelcomeMessage = ({ onSelectFile }: WelcomeMessageProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12 bg-gradient-to-b from-[#1E1B2A] to-[#2D2A33]">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#9b87f5] to-[#7E69AB]">
          Scholarly Insight Engine
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Unlock profound understanding from your academic materials. 
          Our cognitive tutor helps you discover hidden connections 
          and articulate concepts with crystal clarity.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full mb-12">
        <div className="flex flex-col items-center text-center p-6 bg-[#2D2A33]/50 rounded-xl border border-[#3E3D43]/50">
          <div className="bg-[#7E69AB]/20 p-4 rounded-full mb-4">
            <BookUp className="h-8 w-8 text-[#9b87f5]" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Upload Academic Materials</h3>
          <p className="text-gray-400">
            Submit research papers, textbooks, or lecture notes (PDF, up to 50MB)
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 bg-[#2D2A33]/50 rounded-xl border border-[#3E3D43]/50">
          <div className="bg-[#7E69AB]/20 p-4 rounded-full mb-4">
            <BrainCircuit className="h-8 w-8 text-[#9b87f5]" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Probe Deep Understanding</h3>
          <p className="text-gray-400">
            Challenge complex concepts with Socratic questioning
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 bg-[#2D2A33]/50 rounded-xl border border-[#3E3D43]/50">
          <div className="bg-[#7E69AB]/20 p-4 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-[#9b87f5]" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Achieve Mastery</h3>
          <p className="text-gray-400">
            Receive explanations refined through pedagogical research
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onSelectFile}
        className="bg-gradient-to-r from-[#7E69AB] to-[#9b87f5] hover:from-[#9b87f5] hover:to-[#7E69AB] text-white px-10 py-7 text-xl font-medium flex items-center gap-3 rounded-xl transition-all duration-300 hover:scale-105"
      >
        <GraduationCap className="h-6 w-6" />
        Begin Intellectual Exploration
      </Button>

      <p className="mt-6 text-gray-400 text-sm max-w-lg text-center">
        Our cognitive tutor employs evidence-based learning techniques to help you 
        not just memorize, but truly comprehend and articulate academic concepts.
      </p>
    </div>
  );
};
