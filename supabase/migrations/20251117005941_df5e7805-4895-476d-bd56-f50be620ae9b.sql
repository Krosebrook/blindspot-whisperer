-- Drop the existing view
DROP VIEW IF EXISTS public.auth_attempts_summary;

-- Recreate with proper security_invoker syntax
CREATE VIEW public.auth_attempts_summary
WITH (security_invoker=on) AS
SELECT 
  id,
  SUBSTRING(ip_address::TEXT, 1, 12) || '...' AS ip_masked,
  SUBSTRING(email, 1, 3) || '***' || SUBSTRING(email FROM '@.*') AS email_masked,
  attempt_type,
  success,
  created_at,
  SUBSTRING(user_agent, 1, 50) AS user_agent_short
FROM public.auth_attempts
ORDER BY created_at DESC;