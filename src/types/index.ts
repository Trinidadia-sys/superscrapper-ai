export interface Lead {
  id: string;
  businessName: string;
  address: string;
  phone?: string;
  website: string;
  rating?: number;
  reviewCount?: number;
  emails: string[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  businessType: string;
  businessSize: 'small' | 'medium' | 'large';
  techSophistication: 'low' | 'medium' | 'high';
  tags: string[];
  score: number;
  location: {
    city: string;
    state?: string;
    country?: string;
  };
  createdAt: Date;
}

export interface LeadGenerationRequest {
  niche: string;
  location: string;
  filters?: {
    minRating?: number;
    minReviews?: number;
    businessSize?: 'small' | 'medium' | 'large';
  };
}

export interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  message?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  currentAgent: number;
  agents: AgentStatus[];
  totalLeads: number;
  processedLeads: number;
}

export interface ExportOptions {
  format: 'csv' | 'json';
  includeScores: boolean;
  includeTags: boolean;
}
