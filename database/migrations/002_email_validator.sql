-- This function receives the user info and checks the email domain
create or replace function public.validate_umass_email(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text;
begin
  -- Extract the email from the event data sent by Supabase Auth
  email := event->'user'->>'email';

  -- If it doesn't end in @umass.edu, block it with an error message
  if (email not like '%@umass.edu') then
    raise exception 'UMass Amherst email required for registration';
  end if;

  -- If it is valid, return the event so the signup proceeds
  return event;
end;
$$;

-- Give Supabase Auth permission to run this function
grant usage on schema public to supabase_auth_admin;
grant execute on function public.validate_umass_email to supabase_auth_admin;