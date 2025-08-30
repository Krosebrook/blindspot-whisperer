-- Fix Security Definer functions for security compliance
-- Keep handle_new_user as SECURITY DEFINER (needs to bypass RLS for user creation)
-- Convert other functions to SECURITY INVOKER where safe

-- Update update_updated_at_column to SECURITY INVOKER (generic timestamp function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from DEFINER to INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update generate_share_slug to SECURITY INVOKER (can work with user's permissions)
CREATE OR REPLACE FUNCTION public.generate_share_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from DEFINER to INVOKER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$function$;

-- Keep update_scan_stats as SECURITY DEFINER but add comment explaining why
-- This function needs DEFINER because it's called from blind_spots trigger
-- and needs to update the parent scans table
CREATE OR REPLACE FUNCTION public.update_scan_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- Kept as DEFINER - needs to update scans from blind_spots context
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- This function requires SECURITY DEFINER because:
  -- 1. It's triggered by blind_spots table changes
  -- 2. It needs to update the parent scans table
  -- 3. The trigger context may not have direct update permissions on scans
  UPDATE public.scans
  SET
    total_blind_spots = (
      SELECT COUNT(*) FROM public.blind_spots
      WHERE scan_id = NEW.scan_id
    ),
    critical_blind_spots = (
      SELECT COUNT(*) FROM public.blind_spots
      WHERE scan_id = NEW.scan_id AND severity = 'critical'
    )
  WHERE id = NEW.scan_id;
  RETURN NEW;
END;
$function$;

-- Keep handle_new_user as SECURITY DEFINER with comment explaining why
-- This function MUST remain SECURITY DEFINER for user onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- Kept as DEFINER - required for user creation bypass RLS
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- This function requires SECURITY DEFINER because:
  -- 1. It runs during user registration before auth.uid() is fully established
  -- 2. It needs to bypass RLS to create the initial profile record
  -- 3. New users don't have permissions to insert their own profile yet
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;