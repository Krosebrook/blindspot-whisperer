-- Create public view for share cards with limited data exposure
CREATE OR REPLACE VIEW public.public_share_cards AS
SELECT 
  id,
  slug,
  LEFT(title, 50) as title,
  blind_spot_count,
  critical_count,
  view_count,
  created_at,
  scan_id
FROM public.share_cards
WHERE is_public = true AND (expires_at IS NULL OR expires_at > NOW());

-- Grant select permission to anonymous users
GRANT SELECT ON public.public_share_cards TO anon;
GRANT SELECT ON public.public_share_cards TO authenticated;