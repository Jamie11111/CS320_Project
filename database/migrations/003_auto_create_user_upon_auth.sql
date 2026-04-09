-- Step 1: Create the Function (The Logic)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, name)
  VALUES (
    new.id,    -- Takes the ID from the Auth signup
    new.email, -- Takes the Email from the Auth signup
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Student') -- Takes 'name' from your app's signup form
  );
  RETURN new;
END;
$$;

-- Step 2: Create the Trigger (The Event)
-- This tells the database: "Every time a row is added to auth.users, run the function above."
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 3: Fix Permissions
-- This allows the background 'auth' service to write into your 'public' table.
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON TABLE public.users TO supabase_auth_admin;