// This code would go in some main or index file 
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

// This client is accessed by index.ts and passed to routes that need to interact with the database.
export const supabase = createClient(supabaseUrl, supabaseKey)

// All the functions below would be implemented in their own separate file
// Hence why `supabase` is passed in as an argument
// I've done this because we need to be able to easily swap out the supabase client to use a test database

// Example sign-in function
async function signIn(supabase: SupabaseClient, email: string, password: string) {
  const { data: {user}, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return user;
}

// Example of verifying an auth token from a route
async function verifyAuthToken(supabase: SupabaseClient, request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null; // No token provided
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    return null;
  }

  // This validates the token against the Supabase Auth server
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('Token validation failed:', error.message);
    return null;
  }

  return user;
}

// Example of getting a listing from the database
async function getListingById(supabase: SupabaseClient, listingId: number) {
    // Inside of the route, we can call 'verifyAuthToken' prior to calling this function for auth verification
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .single();  
    if (error) {
        console.error('Error fetching listing:', error.message);
        return null;
    }
    return data;
}