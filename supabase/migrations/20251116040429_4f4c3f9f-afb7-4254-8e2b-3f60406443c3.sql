-- Create table to track authentication attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  email TEXT,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('signin', 'signup', 'reset_password')),
  success BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_agent TEXT
);

-- Create index for efficient querying by IP and time
CREATE INDEX idx_auth_attempts_ip_time ON public.auth_attempts(ip_address, created_at DESC);
CREATE INDEX idx_auth_attempts_email_time ON public.auth_attempts(email, created_at DESC);

-- Enable RLS
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage auth attempts (edge functions)
CREATE POLICY "Service role can manage auth attempts"
ON public.auth_attempts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to clean up old auth attempts (keep last 7 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_auth_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.auth_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.cleanup_old_auth_attempts() TO service_role;