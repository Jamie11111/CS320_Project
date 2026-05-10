import { initApp } from "./init_app";

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Hello via Bun!");

const app = initApp({ supabaseURL: supabaseUrl, supabaseKey: supabaseKey });

console.log("App is running on port " + app.port);