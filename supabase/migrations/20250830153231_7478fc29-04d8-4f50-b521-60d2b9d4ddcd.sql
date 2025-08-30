-- Add RLS policy to scan_summaries to ensure users can only view their own data
CREATE POLICY "Users can view their own scan summaries" 
ON public.scan_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Optionally restrict categories access to authenticated users only (remove public access)
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;

-- Ensure categories remain accessible to authenticated users
CREATE POLICY "Authenticated users can view categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);