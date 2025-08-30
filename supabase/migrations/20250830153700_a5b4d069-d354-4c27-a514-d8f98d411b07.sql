-- Drop the existing scan_summaries view
DROP VIEW IF EXISTS public.scan_summaries;

-- Recreate the view with proper user filtering built in
CREATE VIEW public.scan_summaries AS
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
WHERE s.user_id = auth.uid()  -- This ensures users only see their own data
GROUP BY s.id, s.user_id, s.persona, s.business_type, s.status, s.total_blind_spots, s.critical_blind_spots, s.created_at, s.completed_at;

-- Set security barrier on the new view
ALTER VIEW public.scan_summaries SET (security_barrier = true);