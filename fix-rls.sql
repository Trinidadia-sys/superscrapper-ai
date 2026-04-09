-- Fix RLS policies to allow authenticated users to insert their own data

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own lead generations" ON public.lead_generations;
DROP POLICY IF EXISTS "Users can insert own saved leads" ON public.saved_leads;

-- Create simpler policies that allow any authenticated user to insert
CREATE POLICY "Users can insert own lead generations" ON public.lead_generations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own saved leads" ON public.saved_leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Recreate the other policies
DROP POLICY IF EXISTS "Users can view own lead generations" ON public.lead_generations;
CREATE POLICY "Users can view own lead generations" ON public.lead_generations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lead generations" ON public.lead_generations;
CREATE POLICY "Users can update own lead generations" ON public.lead_generations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own saved leads" ON public.saved_leads;
CREATE POLICY "Users can view own saved leads" ON public.saved_leads
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved leads" ON public.saved_leads;
CREATE POLICY "Users can update own saved leads" ON public.saved_leads
  FOR UPDATE USING (auth.uid() = user_id);
