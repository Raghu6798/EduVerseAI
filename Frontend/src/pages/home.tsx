import React from 'react';
import Navbar from '../components/layout/navbar';
import Footer from '../components/layout/footer';
import HeroSection from '../components/home/HeroSection';
import FeaturesSection from '../components/home/FeaturesSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import { AuroraGradientBackground } from '../components/ui/particles-background';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Navbar />
      <div className="relative flex-grow">
        <AuroraGradientBackground />
        <div className="relative z-10 bg-white dark:bg-slate-900">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <TestimonialsSection />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;