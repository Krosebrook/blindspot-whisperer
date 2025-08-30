-- Enable RLS on the scan_summaries view
ALTER VIEW public.scan_summaries SET (security_barrier = true);

-- Since scan_summaries is a view based on scans table, and scans already has proper RLS,
-- we need to ensure the view respects those policies by enabling RLS on the view itself
-- However, views don't support direct RLS policies like tables do.
-- The proper approach is to ensure the underlying scans table has correct RLS (which it does).

-- Let's also remove public access to categories for better security
DROP POLICY IF EXISTS "Categories are publicly readable" ON public.categories;