import { initApp } from "../../init_app";
import { listingRoutes } from "../../routes/listings";
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// This will get replaced with a test supabase database instance that the database team sets up
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseClientKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// At some points, it may be necessary to initialize multiple clients
// For example, when creating fake users
export const supabaseConn = { supabaseURL: supabaseUrl, supabaseKey: supabaseClientKey };

// Use this when initializing / resetting database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

// Use this to test routes
export const testApp = initApp(supabaseConn);