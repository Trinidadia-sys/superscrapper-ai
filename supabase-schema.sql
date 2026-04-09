-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  plan VARCHAR(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  lead_credits INTEGER DEFAULT 100,
  used_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lead_generations table
CREATE TABLE IF NOT EXISTS public.lead_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  niche VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  leads_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create saved_leads table
CREATE TABLE IF NOT EXISTS public.saved_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  generation_id UUID NOT NULL REFERENCES public.lead_generations(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  website VARCHAR(500),
  emails TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  rating DECIMAL(3, 2),
  review_count INTEGER,
  business_type VARCHAR(100),
  business_size VARCHAR(20) CHECK (business_size IN ('small', 'medium', 'large')),
  tech_sophistication VARCHAR(20) CHECK (tech_sophistication IN ('low', 'medium', 'high')),
  tags TEXT[] DEFAULT '{}',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  location JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_lead_generations_user_id ON public.lead_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_generations_created_at ON public.lead_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_leads_user_id ON public.saved_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_leads_generation_id ON public.saved_leads(generation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Lead generations policies
DROP POLICY IF EXISTS "Users can view own lead generations" ON public.lead_generations;
CREATE POLICY "Users can view own lead generations" ON public.lead_generations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lead generations" ON public.lead_generations;
CREATE POLICY "Users can insert own lead generations" ON public.lead_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lead generations" ON public.lead_generations;
CREATE POLICY "Users can update own lead generations" ON public.lead_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Saved leads policies
DROP POLICY IF EXISTS "Users can view own saved leads" ON public.saved_leads;
CREATE POLICY "Users can view own saved leads" ON public.saved_leads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved leads" ON public.saved_leads;
CREATE POLICY "Users can insert own saved leads" ON public.saved_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved leads" ON public.saved_leads;
CREATE POLICY "Users can update own saved leads" ON public.saved_leads
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan, lead_credits, used_credits)
  VALUES (NEW.id, NEW.email, 'starter', 100, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
