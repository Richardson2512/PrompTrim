-- Create trigger to automatically create profile when user signs up
-- This will run when a new user is created in auth.users

-- Function to create profile for new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, subscription_tier, monthly_token_limit, tokens_used_this_month)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'free',
    10000,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to manually create profile for existing users
CREATE OR REPLACE FUNCTION public.create_profile_for_existing_user(user_uuid uuid)
RETURNS void AS $$
DECLARE
  user_email text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Get user data from auth.users
  SELECT email, 
         COALESCE(raw_user_meta_data->>'first_name', ''),
         COALESCE(raw_user_meta_data->>'last_name', '')
  INTO user_email, user_first_name, user_last_name
  FROM auth.users 
  WHERE id = user_uuid;
  
  -- Create profile if user exists and profile doesn't exist
  IF user_email IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, first_name, last_name, subscription_tier, monthly_token_limit, tokens_used_this_month)
    VALUES (user_uuid, user_email, user_first_name, user_last_name, 'free', 10000, 0)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profile for all existing users who don't have one
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id, email, 
           COALESCE(raw_user_meta_data->>'first_name', '') as first_name,
           COALESCE(raw_user_meta_data->>'last_name', '') as last_name
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  LOOP
    INSERT INTO public.profiles (id, email, first_name, last_name, subscription_tier, monthly_token_limit, tokens_used_this_month)
    VALUES (user_record.id, user_record.email, user_record.first_name, user_record.last_name, 'free', 10000, 0);
  END LOOP;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Profile creation trigger and functions created successfully!';
  RAISE NOTICE 'New users will automatically get profiles created.';
  RAISE NOTICE 'Existing users without profiles have been processed.';
END $$;
