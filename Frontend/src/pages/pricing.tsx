import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, HelpCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individual students getting started',
    features: [
      'PDF and document analysis',
      '10 queries per month',
      'Basic text extraction',
      'Email support',
      '1 GB storage',
      'Export to common formats',
      '7-day free trial'
    ],
    button: 'Start Free Plan',
    href: '/signup?plan=basic'
  },
  {
    name: 'Standard',
    price: '$49',
    description: 'Ideal for active students and researchers',
    popular: true,
    features: [
      'Everything in Basic, plus:',
      'Video lecture analysis',
      'Image and diagram analysis',
      '50 queries per month',
      'Priority email support',
      '5 GB storage',
      'Advanced analytics',
      'Collaboration tools'
    ],
    button: 'Start Standard Plan',
    href: '/signup?plan=standard'
  },
  {
    name: 'Premium',
    price: '$99',
    description: 'For power users and academic institutions',
    features: [
      'Everything in Standard, plus:',
      'Unlimited queries',
      'Audio transcription & analysis',
      '24/7 priority support',
      'Unlimited storage',
      'Custom AI models',
      'API access',
      'Early access to features',
      'Dedicated account manager'
    ],
    button: 'Start Premium Plan',
    href: '/signup?plan=premium'
  }
];

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'All plans come with a 7-day free trial. You can explore all features risk-free and cancel anytime during the trial period.'
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and offer special billing options for educational institutions.'
  },
  {
    question: 'Is there a student discount?',
    answer: 'Yes! Students with a valid .edu email address receive 20% off any plan. Contact support to apply the discount.'
  }
];

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Choose the Plan That Works Best for You
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-600 dark:text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Unlock the power of AI-assisted learning with our flexible pricing options.
              All plans include a 7-day free trial.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-4">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">/month</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to={plan.href}>
                    <Button
                      variant={plan.popular ? 'primary' : 'outline'}
                      className="w-full justify-center"
                    >
                      {plan.button}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FAQs */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-slate-800 rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-start">
                    <HelpCircle className="h-6 w-6 text-purple-500 mr-3 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Pricing;
