import { initApp } from "../..";
import { listingRoutes } from "../../routes/listings";
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// This will get replaced with a test supabase database instance that the database team sets up
const supabaseUrl = process.env.SUPABASE_URL || 'your-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-key';
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export const testApp = initApp({ supabaseURL: supabaseUrl, supabaseKey: supabaseKey });