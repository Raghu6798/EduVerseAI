import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
              <GraduationCap className="h-6 w-6 text-purple-600" />
              <span>Scholar<span className="text-purple-600">AI</span></span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Your AI-powered academic assistant that revolutionizes the way students learn.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Raghu6798/ScholarAI/tree/main" className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/about" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 text-sm">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            &copy; {currentYear} ScholarAI. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;