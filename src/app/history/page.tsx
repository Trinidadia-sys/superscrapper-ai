'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Download, BarChart3, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { UserMenu } from '@/components/UserMenu';
import { supabase } from '@/lib/supabase';

interface Generation {
  id: string;
  niche: string;
  location: string;
  leads_count: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export default function HistoryPage() {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      // Pass auth token so RLS recognizes the user
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/user/history?user_id=${user?.id}`, { headers });
      const data = await response.json();
      setGenerations(data.generations || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGenerations = generations.filter(gen => {
    const matchesSearch =
      gen.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gen.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || gen.status === filter;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Niche', 'Location', 'Leads Count', 'Status', 'Completed At'];
    const csvContent = [
      headers.join(','),
      ...filteredGenerations.map(gen => [
        new Date(gen.created_at).toLocaleDateString(),
        gen.niche,
        gen.location,
        gen.leads_count,
        gen.status,
        gen.completed_at ? new Date(gen.completed_at).toLocaleDateString() : 'N/A',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lead-generation-history.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold gradient-text">SuperScrapperAI</h1>
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

        <main className="w-full max-w-6xl mx-auto px-6 py-10">

          {/* Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Lead Generation History</h2>
                <p className="text-gray-400">Track all your lead generation campaigns and results</p>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by niche or location..."
                    className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    suppressHydrationWarning
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
                <button onClick={exportToCSV} className="px-4 py-2 glass hover-lift flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass p-6 text-center">
              <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold">{generations.length}</div>
              <div className="text-gray-400 text-sm">Total Generations</div>
            </div>
            <div className="glass p-6 text-center">
              <BarChart3 className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <div className="text-2xl font-bold">{generations.filter(g => g.status === 'completed').length}</div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="glass p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold">{generations.reduce((sum, g) => sum + g.leads_count, 0)}</div>
              <div className="text-gray-400 text-sm">Total Leads Generated</div>
            </div>
            <div className="glass p-6 text-center">
              <div className="text-2xl font-bold">
                {generations.length > 0
                  ? Math.round(generations.reduce((sum, g) => sum + g.leads_count, 0) / generations.length)
                  : 0}
              </div>
              <div className="text-gray-400 text-sm">Avg Leads per Generation</div>
            </div>
          </motion.div>

          {/* History Table */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass"
          >
            {filteredGenerations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 mb-6">
                  {searchTerm || filter !== 'all' ? 'No matching generations found' : 'No generations yet'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white font-semibold rounded-lg hover-lift"
                >
                  Start Your First Generation
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Niche</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Leads</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-4 px-6 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredGenerations.map((gen) => (
                      <tr key={gen.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 text-sm">{new Date(gen.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          <span className="text-purple-400 font-medium">{gen.niche}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-300">{gen.location}</td>
                        <td className="py-4 px-6 text-sm font-medium">{gen.leads_count}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            gen.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            gen.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {gen.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/results/${gen.id}`}
                            className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
                          >
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

        </main>
      </div>
    </div>
  );
}