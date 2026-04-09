'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles } from 'lucide-react';

interface LeadGenerationFormProps {
  onSubmit: (data: { niche: string; location: string }) => void;
}

export function LeadGenerationForm({ onSubmit }: LeadGenerationFormProps) {
  const [niche, setNiche] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debug: Log when component renders
  console.log('LeadGenerationForm rendering...');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche || !location) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ niche, location });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const popularNiches = [
    'Restaurants', 'Dentists', 'Real Estate Agents', 
    'Lawyers', 'Gyms', 'Salons', 'Contractors', 'Consultants'
  ];

  const popularLocations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL',
    'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA'
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="glass p-8 mobile-spacing"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6 mobile-grid">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Search className="w-4 h-4" />
              Business Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., restaurants, dentists, lawyers"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <div className="flex flex-wrap gap-2">
              {popularNiches.map((popularNiche) => (
                <button
                  key={popularNiche}
                  type="button"
                  onClick={() => setNiche(popularNiche)}
                  className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full hover:bg-purple-500/30 transition-colors"
                >
                  {popularNiche}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., New York, NY; Los Angeles, CA"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <div className="flex flex-wrap gap-2">
              {popularLocations.map((popularLocation) => (
                <button
                  key={popularLocation}
                  type="button"
                  onClick={() => setLocation(popularLocation)}
                  className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500/30 transition-colors"
                >
                  {popularLocation}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !niche || !location}
          className="w-full md:w-auto px-8 py-4 gradient-bg text-white font-semibold rounded-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Leads...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Leads</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}