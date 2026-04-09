'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lead } from '@/types';
import {
  Search, Filter, Download, ArrowLeft, Mail, Phone, Globe,
  Star, ExternalLink, Copy, Check, ChevronDown
} from 'lucide-react';

interface ResultsDashboardProps {
  leads: Lead[];
  onNewSearch: () => void;
}

export function ResultsDashboard({ leads, onNewSearch }: ResultsDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    scoreRange: [0, 100],
    businessSize: 'all',
    tags: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  // Scoped per field: "leadId:fieldType" e.g. "abc123:email" or "abc123:phone"
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch =
        lead.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.location.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesScore =
        lead.score >= selectedFilters.scoreRange[0] &&
        lead.score <= selectedFilters.scoreRange[1];
      const matchesSize =
        selectedFilters.businessSize === 'all' ||
        lead.businessSize === selectedFilters.businessSize;
      const matchesTags =
        selectedFilters.tags.length === 0 ||
        selectedFilters.tags.some(tag => lead.tags.includes(tag));
      return matchesSearch && matchesScore && matchesSize && matchesTags;
    });
  }, [leads, searchTerm, selectedFilters]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    leads.forEach(lead => lead.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [leads]);

  // Key format: "leadId:field" — ensures only one button highlights at a time
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
    const headers = [
      'Business Name', 'Address', 'Phone', 'Website', 'Email',
      'Rating', 'Reviews', 'Business Type', 'Size', 'Score', 'Tags', 'City', 'State'
    ];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.businessName}"`,
        `"${lead.address}"`,
        `"${lead.phone || ''}"`,
        `"${lead.website}"`,
        `"${lead.emails.join('; ')}"`,
        lead.rating || '',
        lead.reviewCount || '',
        `"${lead.businessType}"`,
        lead.businessSize,
        lead.score,
        `"${lead.tags.join('; ')}"`,
        `"${lead.location.city}"`,
        `"${lead.location.state || ''}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const CopyButton = ({ text, fieldKey }: { text: string; fieldKey: string }) => (
    <button
      onClick={() => copyToClipboard(text, fieldKey)}
      className="text-gray-400 hover:text-white shrink-0 transition-colors"
      title={text || 'Not available'}
      disabled={!text}
    >
      {copiedId === fieldKey
        ? <Check className="w-3 h-3 text-green-400" />
        : <Copy className="w-3 h-3" />}
    </button>
  );

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 hover-lift"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{lead.businessName}</h3>
          <p className="text-gray-400 text-sm">{lead.businessType}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">{lead.score}</div>
          <div className="text-xs text-gray-400">Score</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {lead.website && (
          <div className="flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-blue-400 shrink-0" />
            <a href={lead.website} target="_blank" rel="noopener noreferrer"
               className="text-blue-400 hover:underline flex items-center gap-1 truncate">
              {lead.website}
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-green-400 shrink-0" />
            <span className="truncate">{lead.phone}</span>
            <CopyButton text={lead.phone} fieldKey={`${lead.id}:phone`} />
          </div>
        )}
        {lead.emails[0] && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">{lead.emails[0]}</span>
            <CopyButton text={lead.emails[0]} fieldKey={`${lead.id}:email`} />
          </div>
        )}
        {!lead.phone && !lead.emails[0] && (
          <p className="text-xs text-gray-500 italic">No contact info found</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        {lead.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{lead.rating}</span>
            <span className="text-gray-400">({lead.reviewCount})</span>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {lead.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Header */}
      <div className="glass mx-4 mt-4 p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onNewSearch} className="flex items-center gap-2 px-4 py-2 glass hover-lift">
              <ArrowLeft className="w-4 h-4" />
              New Search
            </button>
            <h1 className="text-2xl font-bold gradient-text">
              {filteredLeads.length} Leads Found
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-4 py-2 glass hover-lift"
            >
              {viewMode === 'table' ? 'Cards' : 'Table'} View
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 gradient-bg hover-lift">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              suppressHydrationWarning
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 glass hover-lift"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 glass"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Score Range</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0" max="100" value={selectedFilters.scoreRange[0]}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, scoreRange: [parseInt(e.target.value) || 0, prev.scoreRange[1]] }))}
                    className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white"
                  />
                  <span>-</span>
                  <input type="number" min="0" max="100" value={selectedFilters.scoreRange[1]}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, scoreRange: [prev.scoreRange[0], parseInt(e.target.value) || 100] }))}
                    className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Business Size</label>
                <select value={selectedFilters.businessSize}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, businessSize: e.target.value }))}
                  className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-white"
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button key={tag}
                      onClick={() => {
                        if (selectedFilters.tags.includes(tag)) {
                          setSelectedFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
                        } else {
                          setSelectedFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }));
                        }
                      }}
                      className={`px-2 py-1 rounded-full text-xs transition-colors ${
                        selectedFilters.tags.includes(tag) ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 mx-4 my-4 min-h-0">
        {viewMode === 'table' ? (
          <div className="glass w-full h-full overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto h-full">
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
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{lead.businessName}</div>
                        <div className="text-sm text-gray-400">{lead.businessType}</div>
                        <div className="text-sm text-gray-500">{lead.location.city}, {lead.location.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.emails[0] ? (
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
                        {lead.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{lead.rating}</span>
                            <span className="text-gray-400 text-sm">({lead.reviewCount})</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          lead.businessSize === 'large' ? 'bg-green-500/20 text-green-400' :
                          lead.businessSize === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lead.businessSize}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold gradient-text">{lead.score}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map(tag => (
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
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}