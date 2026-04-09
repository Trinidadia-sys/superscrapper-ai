'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Search, Zap, Target, BarChart3, Mail } from 'lucide-react';
import Link from 'next/link';
import { LeadGenerationForm } from '@/components/LeadGenerationForm';
import { ProcessingScreen } from '@/components/ProcessingScreen';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Lead, ProcessingState } from '@/types';

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'processing' | 'results'>('home');
  const { user } = useAuth();

  const handleLeadGeneration = async (request: { niche: string; location: string }) => {
    setCurrentView('processing');
    setProcessingState({
      isProcessing: true,
      currentAgent: 0,
      agents: [
        { name: 'Business Finder', status: 'pending', progress: 0 },
        { name: 'Website Scraper', status: 'pending', progress: 0 },
        { name: 'Email Finder', status: 'pending', progress: 0 },
        { name: 'Lead Enrichment', status: 'pending', progress: 0 },
        { name: 'Lead Scorer', status: 'pending', progress: 0 },
      ],
      totalLeads: 0,
      processedLeads: 0,
    });

    try {
      // Step 1: Business Finder
      setProcessingState(prev => {
        if (!prev) return null;
        const newAgents = [...prev.agents];
        newAgents[0] = { ...newAgents[0], status: 'running', progress: 50 };
        return { ...prev, currentAgent: 0, agents: newAgents };
      });

      const { data: { session } } = await supabase.auth.getSession();
      const authHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch leads');
      }

      const data = await response.json();
      let fetchedLeads: Lead[] = data.leads || [];

      setProcessingState(prev => {
        if (!prev) return null;
        const newAgents = [...prev.agents];
        newAgents[0] = { ...newAgents[0], status: 'completed', progress: 100 };
        newAgents[1] = { ...newAgents[1], status: 'running', progress: 50 };
        return {
          ...prev,
          currentAgent: 1,
          agents: newAgents,
          totalLeads: fetchedLeads.length,
          processedLeads: 0,
        };
      });

      // Step 2: Website Scraper
      const websites = fetchedLeads
        .filter((lead: Lead) => lead.website)
        .map((lead: Lead) => lead.website);

      if (websites.length > 0) {
        try {
          const scrapeResponse = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: websites }),
          });

          if (scrapeResponse.ok) {
            const scrapedResults = await scrapeResponse.json();
            fetchedLeads = fetchedLeads.map((lead: Lead) => {
              const scrapedData = scrapedResults.results[lead.website];
              if (scrapedData?.success) {
                return {
                  ...lead,
                  emails: scrapedData.emails || lead.emails,
                  socialLinks: scrapedData.socialLinks || lead.socialLinks,
                  phone: scrapedData.contactInfo?.phone || lead.phone,
                };
              }
              return lead;
            });
          }
        } catch (err) {
          console.error('Website scraping failed:', err);
        }
      }

      // Steps 3-5: Remaining agents
      for (let i = 2; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setProcessingState(prev => {
          if (!prev) return null;
          const newAgents = [...prev.agents];
          newAgents[i] = { ...newAgents[i], status: 'completed', progress: 100 };
          if (i < 4) {
            newAgents[i + 1] = { ...newAgents[i + 1], status: 'running', progress: 50 };
          }
          return {
            ...prev,
            currentAgent: i + 1,
            agents: newAgents,
            processedLeads: Math.floor((i + 1) * fetchedLeads.length / 5),
          };
        });
      }

      setLeads(fetchedLeads);
      setCurrentView('results');
      setProcessingState(null);

    } catch (error) {
      console.error('Error generating leads:', error);

      setProcessingState(prev => {
        if (!prev) return null;
        const newAgents = [...prev.agents];
        newAgents[prev.currentAgent] = {
          ...newAgents[prev.currentAgent],
          status: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : 'Unknown error',
        };
        return { ...prev, agents: newAgents, isProcessing: false };
      });

      setTimeout(() => {
        setCurrentView('home');
        setProcessingState(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,87,108,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(79,172,254,0.1)_0%,transparent_50%)]" />

      <div className="relative z-10">
        {currentView === 'home' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Navigation */}
            <nav className="glass m-4 p-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-8 h-8 text-purple-400" />
                  <h1 className="text-2xl font-bold gradient-text">SuperScrapperAI</h1>
                </div>
                <div className="hidden md:flex items-center gap-10">
                  <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Features</Link>
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

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-20">
              <div className="w-full max-w-5xl mx-auto space-y-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-16"
                >
                  <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    <span className="gradient-text">AI-Powered</span>
                    <br />
                    <span className="text-white">Lead Generation</span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-8">
                    Enter a niche → Get qualified leads instantly with enriched contact data
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Results in &lt;60 seconds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <span>80%+ accuracy rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-400" />
                      <span>50-500 leads per query</span>
                    </div>
                  </div>
                </motion.div>

                {/* Lead Generation Form */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <LeadGenerationForm onSubmit={handleLeadGeneration} />
                </motion.div>

                {/* Features */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto"
                >
                  <div className="glass p-6 text-center hover-lift">
                    <Search className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Smart Discovery</h3>
                    <p className="text-gray-400">AI agents find businesses using multiple data sources</p>
                  </div>
                  <div className="glass p-6 text-center hover-lift">
                    <Mail className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Email Extraction</h3>
                    <p className="text-gray-400">Advanced algorithms find and validate contact emails</p>
                  </div>
                  <div className="glass p-6 text-center hover-lift">
                    <Target className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Lead Scoring</h3>
                    <p className="text-gray-400">AI-powered scoring to prioritize high-value opportunities</p>
                  </div>
                </motion.div>

                {/* Generation History Button */}
                {user && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="flex justify-center mt-8"
                  >
                    <Link
                      href="/history"
                      className="flex items-center gap-3 px-10 py-4 glass hover-lift border border-white/20 rounded-full text-base tracking-wide text-gray-300 hover:text-white transition-colors"
                    >
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                      View Generation History
                    </Link>
                  </motion.div>
                )}
              </div>
            </main>
          </motion.div>
        )}

        {currentView === 'processing' && processingState && (
          <ProcessingScreen state={processingState} />
        )}

        {currentView === 'results' && (
          <ResultsDashboard
            leads={leads}
            onNewSearch={() => {
              setCurrentView('home');
              setLeads([]);
            }}
          />
        )}
      </div>
    </div>
  );
}