'use client';

import { motion } from 'framer-motion';
import { Search, Mail, Globe, Zap, Target, BarChart3, Shield, Clock, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { UserMenu } from '@/components/UserMenu';

export default function FeaturesPage() {
  const { user } = useAuth();

  const features = [
    { icon: Search, title: 'Smart Discovery', description: 'AI-powered business discovery using Google Places API and multiple data sources to find relevant leads in your target location.', color: 'text-purple-400' },
    { icon: Mail, title: 'Email Extraction', description: 'Advanced web scraping algorithms extract contact emails from business websites, contact pages, and structured data.', color: 'text-blue-400' },
    { icon: Target, title: 'Lead Scoring', description: 'AI analyzes business quality, website sophistication, and opportunity indicators to score leads 0-100.', color: 'text-green-400' },
    { icon: Globe, title: 'Social Media Integration', description: 'Extract social media profiles and links to understand business online presence and marketing channels.', color: 'text-yellow-400' },
    { icon: BarChart3, title: 'Real-time Processing', description: 'Get results in under 60 seconds with our optimized AI agent pipeline and parallel processing.', color: 'text-pink-400' },
    { icon: Shield, title: 'Data Validation', description: 'Automatic email validation and phone number verification ensures contact information accuracy.', color: 'text-indigo-400' },
    { icon: Clock, title: 'Historical Tracking', description: 'Track lead generation history, export data, and monitor campaign performance over time.', color: 'text-orange-400' },
    { icon: Users, title: 'Team Collaboration', description: 'Share leads with team members, add notes, and collaborate on lead follow-up strategies.', color: 'text-cyan-400' },
  ];

  const agents = [
    { name: 'Business Finder', description: 'Searches Google Places API for businesses matching your niche and location criteria.', estimatedTime: '10-15 seconds' },
    { name: 'Website Scraper', description: 'Visits each business website to extract emails, social links, and contact information.', estimatedTime: '20-30 seconds' },
    { name: 'Email Validator', description: 'Validates extracted emails using pattern matching and deliverability checks.', estimatedTime: '5-10 seconds' },
    { name: 'Lead Enrichment', description: 'Analyzes business data to determine size, tech sophistication, and opportunities.', estimatedTime: '10-15 seconds' },
    { name: 'Lead Scorer', description: 'Calculates final lead scores based on business quality and opportunity indicators.', estimatedTime: '5-10 seconds' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,87,108,0.1)_0%,transparent_50%)]" />

      {/* ✅ flex flex-col items-center is what makes mx-auto work */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Navigation */}
        <nav className="glass m-4 p-4 w-[calc(100%-2rem)]">
          <div className="flex justify-between items-center w-full">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-2xl font-bold gradient-text">SuperScrapperAI</h1>
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <Link href="/features" className="text-purple-400 font-semibold text-sm tracking-wide">Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Pricing</Link>
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

        {/* ✅ Single centered column — same as pricing page */}
        <main className="w-full max-w-5xl mx-auto px-6 py-20">

          {/* Heading */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Powerful Features</span>
              <br />
              <span className="text-white">for Lead Generation</span>
            </h1>
            {/* ✅ max-w-2xl keeps it narrow enough to stay centered */}
            <p className="text-xl md:text-2xl text-gray-300 w-full text-center">
  Discover how our AI-powered agents transform your lead generation process
</p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.07 }}
                className="glass p-6 text-center hover-lift"
              >
                <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Agents Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mb-20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              <span className="gradient-text">AI Agent Pipeline</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.name}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  className="glass p-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-purple-400 font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold">{agent.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3 leading-relaxed">{agent.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{agent.estimatedTime}</span>
                  </div>
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
              Ready to Generate Leads?
            </h2>
            {/* ✅ max-w-xl keeps it narrow enough to stay centered */}
            <p className="text-gray-300 mb-8 w-full text-center">
  Start generating high-quality leads for your business in seconds with our AI-powered platform.
</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-bg text-white font-semibold rounded-lg hover-lift text-lg"
            >
              <Zap className="w-5 h-5" />
              Start Generating Leads
            </Link>
          </motion.div>

        </main>
      </div>
    </div>
  );
}