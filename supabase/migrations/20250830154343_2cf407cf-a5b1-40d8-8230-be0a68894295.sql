-- Drop the existing scan_summaries view
DROP VIEW IF EXISTS public.scan_summaries;

-- Recreate the view with security_invoker = true to properly respect RLS policies
CREATE VIEW public.scan_summaries 
WITH (security_invoker = true) AS
SELECT 
    s.id,
    s.user_id,
    s.persona,
    s.business_type,
    s.status,
    s.total_blind_spots,
    s.critical_blind_spots,
    s.created_at,
    s.completed_at,
    CASE
        WHEN ((s.completed_at IS NOT NULL) AND (s.created_at IS NOT NULL)) 
        THEN EXTRACT(epoch FROM (s.completed_at - s.created_at))
        ELSE NULL::numeric
    END AS duration_seconds,
    count(DISTINCT bs.category_id) AS categories_affected
FROM (scans s LEFT JOIN blind_spots bs ON ((s.id = bs.scan_id)))
GROUP BY s.id, s.user_id, s.persona, s.business_type, s.status, s.total_blind_spots, s.critical_blind_spots, s.created_at, s.completed_at;