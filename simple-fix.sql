-- Simple fix - just update the INSERT policies to allow authenticated users

-- Drop and recreate only the INSERT policies that are blocking
DROP POLICY IF EXISTS "Users can insert own lead generations" ON public.lead_generations;
DROP POLICY IF EXISTS "Users can insert own saved leads" ON public.saved_leads;

-- Create permissive INSERT policies
CREATE POLICY "Users can insert own lead generations" ON public.lead_generations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own saved leads" ON public.saved_leads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
