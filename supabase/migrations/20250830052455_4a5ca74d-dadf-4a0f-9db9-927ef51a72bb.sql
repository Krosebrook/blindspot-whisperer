-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  persona TEXT CHECK (persona IN ('saas_founder', 'ecommerce', 'content_creator', 'service_business', 'student', 'no_coder', 'enterprise')),
  business_type TEXT,
  business_description TEXT,
  company_size TEXT,
  industry TEXT,
  experience_level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table for blind spot categorization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scans table for user business scans
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  persona TEXT NOT NULL CHECK (persona IN ('saas_founder', 'ecommerce', 'content_creator', 'service_business', 'student', 'no_coder', 'enterprise')),
  business_description TEXT NOT NULL,
  business_type TEXT,
  industry TEXT,
  target_market TEXT,
  current_challenges TEXT[],
  goals TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ai_analysis JSONB,
  total_blind_spots INTEGER DEFAULT 0,
  critical_blind_spots INTEGER DEFAULT 0,
  blind_spot_score INTEGER CHECK (blind_spot_score >= 1 AND blind_spot_score <= 100),
  scan_duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create blind_spots table for scan findings
CREATE TABLE public.blind_spots (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  likelihood INTEGER CHECK (likelihood >= 1 AND likelihood <= 10),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  potential_impact TEXT,
  recommended_actions TEXT[],
  resources TEXT[],
  estimated_effort TEXT,
  estimated_cost TEXT,
  priority_rank INTEGER,
  ai_reasoning TEXT,
  examples TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create share_cards table for viral sharing
CREATE TABLE public.share_cards (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  key_insights TEXT[],
  blind_spot_count INTEGER,
  critical_count INTEGER,
  card_design JSONB,
  is_public BOOLEAN DEFAULT true,
  slug TEXT UNIQUE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create integrations table for third-party connections
CREATE TABLE public.integrations (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  configuration JSONB,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scan_analytics table for tracking and insights
CREATE TABLE public.scan_analytics (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blind_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for scans
CREATE POLICY "Users can view their own scans" ON public.scans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scans" ON public.scans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scans" ON public.scans
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for blind_spots
CREATE POLICY "Users can view blind spots for their scans" ON public.blind_spots
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = blind_spots.scan_id 
    AND scans.user_id = auth.uid()
  ));

CREATE POLICY "System can insert blind spots" ON public.blind_spots
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = blind_spots.scan_id 
    AND scans.user_id = auth.uid()
  ));

-- Create RLS policies for share_cards
CREATE POLICY "Users can view their own share cards" ON public.share_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view public share cards" ON public.share_cards
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own share cards" ON public.share_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own share cards" ON public.share_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for integrations
CREATE POLICY "Users can manage their own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for scan_analytics
CREATE POLICY "System can insert analytics" ON public.scan_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view analytics for their scans" ON public.scan_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.scans 
    WHERE scans.id = scan_analytics.scan_id 
    AND scans.user_id = auth.uid()
  ));

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable" ON public.categories
  FOR SELECT USING (true);

-- Create view for scan summaries
CREATE VIEW public.scan_summaries AS
SELECT 
  s.id,
  s.user_id,
  s.persona,
  s.business_type,
  s.status,
  s.total_blind_spots,
  s.critical_blind_spots,
  s.blind_spot_score,
  s.created_at,
  s.completed_at,
  s.scan_duration_seconds as duration_seconds,
  (SELECT COUNT(DISTINCT category_id) FROM public.blind_spots WHERE scan_id = s.id) as categories_affected
FROM public.scans s;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate share card slug
CREATE OR REPLACE FUNCTION public.generate_share_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || EXTRACT(epoch FROM NEW.created_at)::text;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for share card slug generation
CREATE TRIGGER generate_share_card_slug
  BEFORE INSERT ON public.share_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_share_slug();

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('Operations', 'Business operations and process efficiency', 'Cog', '#3B82F6'),
('Finance', 'Financial management and cash flow', 'DollarSign', '#10B981'),
('Marketing', 'Customer acquisition and retention', 'Target', '#F59E0B'),
('Technology', 'Technical infrastructure and security', 'Code', '#8B5CF6'),
('Legal & Compliance', 'Regulatory and legal requirements', 'Scale', '#EF4444'),
('Human Resources', 'Team management and culture', 'Users', '#06B6D4'),
('Strategy', 'Long-term planning and market positioning', 'TrendingUp', '#F97316'),
('Customer Experience', 'User satisfaction and support', 'Heart', '#EC4899');