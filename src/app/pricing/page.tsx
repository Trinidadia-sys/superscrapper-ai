'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { UserMenu } from '@/components/UserMenu';

export default function PricingPage() {
  const { user } = useAuth();

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      period: '/month',
      description: 'Perfect for small businesses and freelancers',
      features: [
        '100 leads per month',
        'Basic email extraction',
        'Standard lead scoring',
        'CSV export',
        'Email support',
      ],
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$149',
      period: '/month',
      description: 'Ideal for growing businesses and agencies',
      features: [
        '500 leads per month',
        'Advanced email extraction',
        'AI-powered lead scoring',
        'Social media extraction',
        'Real-time validation',
        'Priority email support',
        'API access',
      ],
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: '$399',
      period: '/month',
      description: 'For large teams and high-volume needs',
      features: [
        'Unlimited leads',
        'Premium data enrichment',
        'Custom AI scoring models',
        'Advanced analytics',
        'Dedicated account manager',
        'Phone support',
        'Custom integrations',
        'SLA guarantee',
        'White-label options',
      ],
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: 'How accurate are the email addresses?',
      answer: 'Our email extraction has an 85-90% accuracy rate. We validate emails in real-time and provide confidence scores for each contact.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: "Yes, you can cancel your subscription at any time. No long-term commitments or cancellation fees.",
    },
    {
      question: 'What happens if I exceed my lead limit?',
      answer: "You can purchase additional lead packs or upgrade your plan. We'll notify you when you're approaching your limit.",
    },
    {
      question: 'Do you offer custom integrations?',
      answer: 'Enterprise plans include custom integrations. We also provide API access for Professional and Enterprise plans.',
    },
    {
      question: 'How quickly do I get results?',
      answer: 'Most lead generation requests complete in 30-60 seconds, depending on the number of businesses found.',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,87,108,0.1)_0%,transparent_50%)]" />

      <div className="relative z-10 flex flex-col items-center">

        {/* Navigation */}
        <nav className="glass m-4 p-4 w-[calc(100%-2rem)]">
          <div className="flex justify-between items-center w-full">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold gradient-text">SuperScrapperAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Features</Link>
              <Link href="/pricing" className="text-purple-400 font-semibold text-sm tracking-wide">Pricing</Link>
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <Link href="/auth/signup" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Sign Up</Link>
                  <Link href="/auth/signin" className="glass px-6 py-2 hover-lift text-sm tracking-wide border border-white/20 rounded-full">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="w-full max-w-5xl mx-auto px-6 py-20">

          {/* Heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Simple Pricing</span>
              <br />
              <span className="text-white">for Every Business</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 w-full text-center">
              Choose the perfect plan for your lead generation needs
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-8 mb-24 mt-8"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className={`glass p-8 hover-lift relative flex flex-col ${
  plan.highlighted ? 'border-2 border-purple-400' : ''
}`}
              >

                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-3">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-sm text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-purple-400 text-black hover:bg-purple-300'
                      : 'glass hover-lift border border-white/20'
                  }`}
                  suppressHydrationWarning
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : plan.highlighted ? 'Start Free Trial (Most Popular)' : 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="gradient-text">Frequently Asked Questions</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  className="glass p-6"
                >
                  <h3 className="text-base font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-center"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Not sure which plan to choose?
            </h2>
            <p className="text-gray-300 mb-8 w-full text-center">
              Start with our free trial and upgrade as you grow. No credit card required.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-bg text-white font-semibold rounded-lg hover-lift text-lg"
            >
              <Zap className="w-5 h-5" />
              Start Free Trial
            </Link>
          </motion.div>

        </main>
      </div>
    </div>
  );
}