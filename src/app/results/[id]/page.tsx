'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Globe, Star, Copy, Check, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { UserMenu } from '@/components/UserMenu';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

interface SavedLead {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  website: string;
  emails: string[];
  social_links: Record<string, string>;
  rating: number;
  review_count: number;
  business_type: string;
  business_size: 'small' | 'medium' | 'large';
  tech_sophistication: 'low' | 'medium' | 'high';
  tags: string[];
  score: number;
  location: { city: string; state?: string; country?: string };
}

interface Generation {
  id: string;
  niche: string;
  location: string;
  leads_count: number;
  status: string;
  created_at: string;
}

export default function ResultsPage() {
  const params = useParams();
  const generationId = params?.id as string;
  const { user } = useAuth();

  const [generation, setGeneration] = useState<Generation | null>(null);
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && generationId) fetchResults();
  }, [user, generationId]);

  const fetchResults = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const token = session.access_token;

      // Use authenticated client so RLS recognizes the user
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );

      // Fetch generation details
      const { data: gen, error: genError } = await authClient
        .from('lead_generations')
        .select('*')
        .eq('id', generationId)
        .eq('user_id', user?.id)
        .single();

      if (genError) {
        console.error('Generation fetch error:', JSON.stringify(genError, null, 2));
        setError('Generation not found');
        setLoading(false);
        return;
      }

      setGeneration(gen);

      // Fetch saved leads for this generation
      const { data: savedLeads, error: leadsError } = await authClient
        .from('saved_leads')
        .select('*')
        .eq('generation_id', generationId)
        .eq('user_id', user?.id)
        .order('score', { ascending: false });

      if (leadsError) {
        console.error('Leads fetch error:', JSON.stringify(leadsError, null, 2));
        setError('Failed to load leads');
      } else {
        console.log(`Fetched ${savedLeads?.length ?? 0} leads for generation ${generationId}`);
        setLeads(savedLeads || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Business Name', 'Address', 'Phone', 'Website', 'Email', 'Rating', 'Reviews', 'Size', 'Score', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.business_name}"`,
        `"${lead.address || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.website || ''}"`,
        `"${lead.emails?.join('; ') || ''}"`,
        lead.rating || '',
        lead.review_count || '',
        lead.business_size,
        lead.score,
        `"${lead.tags?.join('; ') || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${generation?.niche}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CopyButton = ({ text, fieldKey }: { text: string; fieldKey: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldKey)}
      disabled={!text}
      className="text-gray-400 hover:text-white shrink-0 transition-colors disabled:opacity-30"
    >
      {copiedId === fieldKey
        ? <Check className="w-3 h-3 text-green-400" />
        : <Copy className="w-3 h-3" />}
    </button>
  );

  const filteredLeads = leads.filter(lead =>
    lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.location?.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <Link href="/history" className="text-purple-400 hover:text-purple-300">← Back to History</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(102,126,234,0.1)_0%,transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,87,108,0.1)_0%,transparent_50%)]" />

      <div className="relative z-10 flex flex-col flex-1">

        {/* Navigation */}
        <nav className="glass m-4 p-4 shrink-0">
          <div className="flex justify-between items-center w-full">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold gradient-text">SuperScrapperAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-10">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Features</Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Pricing</Link>
              {user ? <UserMenu /> : (
                <>
                  <Link href="/auth/signup" className="text-gray-300 hover:text-white transition-colors text-sm tracking-wide">Sign Up</Link>
                  <Link href="/auth/signin" className="glass px-6 py-2 hover-lift text-sm tracking-wide border border-white/20 rounded-full">Sign In</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Header */}
        <div className="glass mx-4 mb-4 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/history" className="flex items-center gap-2 px-4 py-2 glass hover-lift text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to History
              </Link>
              <div>
                <h1 className="text-2xl font-bold gradient-text">
                  {filteredLeads.length} Leads — {generation?.niche}
                </h1>
                <p className="text-gray-400 text-sm">
                  {generation?.location} · {generation?.created_at ? new Date(generation.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                suppressHydrationWarning
              />
              <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 gradient-bg hover-lift text-sm font-medium rounded-lg">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 mx-4 mb-4 min-h-0">
          <div className="glass w-full h-full overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto h-full">
              {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <p className="mb-4">No leads found for this generation.</p>
                  <Link href="/" className="text-purple-400 hover:text-purple-300">Run a new search →</Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-white/5 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredLeads.map((lead, index) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">{lead.business_name}</div>
                          <div className="text-sm text-gray-400">{lead.business_type}</div>
                          <div className="text-sm text-gray-500">{lead.location?.city}, {lead.location?.state}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {lead.emails?.[0] ? (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-purple-400 shrink-0" />
                                <span className="text-sm truncate max-w-[200px]">{lead.emails[0]}</span>
                                <CopyButton text={lead.emails[0]} fieldKey={`${lead.id}:email`} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="text-xs italic">No email found</span>
                              </div>
                            )}
                            {lead.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-green-400 shrink-0" />
                                <span className="text-sm">{lead.phone}</span>
                                <CopyButton text={lead.phone} fieldKey={`${lead.id}:phone`} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span className="text-xs italic">No phone found</span>
                              </div>
                            )}
                            {lead.website ? (
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                                <a href={lead.website} target="_blank" rel="noopener noreferrer"
                                  className="text-sm text-blue-400 hover:underline truncate max-w-[200px]">
                                  {lead.website}
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Globe className="w-3 h-3 shrink-0" />
                                <span className="text-xs italic">No website found</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {lead.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{lead.rating}</span>
                              <span className="text-gray-400 text-sm">({lead.review_count})</span>
                            </div>
                          ) : <span className="text-gray-500 text-sm">N/A</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            lead.business_size === 'large' ? 'bg-green-500/20 text-green-400' :
                            lead.business_size === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {lead.business_size}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg font-bold gradient-text">{lead.score}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {lead.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}