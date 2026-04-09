import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are not configured');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  plan: 'starter' | 'professional' | 'enterprise';
  lead_credits: number;
  used_credits: number;
}

export interface LeadGeneration {
  id: string;
  user_id: string;
  niche: string;
  location: string;
  leads_count: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface SavedLead {
  id: string;
  user_id: string;
  generation_id: string;
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
  location: {
    city: string;
    state: string;
    country: string;
  };
  created_at: string;
}
