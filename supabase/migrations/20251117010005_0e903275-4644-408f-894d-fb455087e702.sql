-- Fix public_share_cards view
DROP VIEW IF EXISTS public.public_share_cards;
CREATE VIEW public.public_share_cards
WITH (security_invoker=on) AS
SELECT 
  id,
  scan_id,
  title,
  slug,
  blind_spot_count,
  critical_count,
  view_count,
  created_at
FROM public.share_cards
WHERE is_public = true;

-- Fix scan_summaries view
DROP VIEW IF EXISTS public.scan_summaries;
CREATE VIEW public.scan_summaries
WITH (security_invoker=on) AS
SELECT 
  s.id,
  s.user_id,
  s.persona,
  s.business_type,
  s.status,
  s.created_at,
  s.completed_at,
  s.total_blind_spots,
  s.critical_blind_spots,
  s.scan_duration_seconds AS duration_seconds,
  COUNT(DISTINCT b.category_id) AS categories_affected
FROM public.scans s
LEFT JOIN public.blind_spots b ON s.id = b.scan_id
GROUP BY s.id;