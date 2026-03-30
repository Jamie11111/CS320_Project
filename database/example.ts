// This code would go in some main or index file 
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

// This client is accessed by index.ts and passed to routes that need to interact with the database.
export const supabase = createClient(supabaseUrl, supabaseKey)

// Example sign-in function
async function signIn(email: string, password: string) {
  const { data: {user}, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return user;
}

// Example of verifying an auth token from a route
async function verifyAuthToken(request: Request) {
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