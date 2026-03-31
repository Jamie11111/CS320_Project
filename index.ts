import { accountRoutes } from "./routes/account";
import { chatRoutes } from "./routes/chats";
import { listingRoutes } from "./routes/listings";
import { userRoutes } from "./routes/users";
// This will get replaced with the real supabase database instance that the database team sets up
import { supabase } from "./database/example";
import type { SupabaseClient } from "@supabase/supabase-js";

console.log("Hello via Bun!");

export const initApp = (supabase: SupabaseClient) => Bun.serve({
    port: 3000,
    routes: {
        ...listingRoutes(supabase),
        ...userRoutes,
        ...accountRoutes,
        ...chatRoutes,
        "/*": () => new Response("Not Found", {status: 404})
    }
});

const app = initApp(supabase);

console.log("App is running on port " + app.port);