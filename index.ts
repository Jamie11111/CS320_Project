import { accountRoutes } from "./routes/account";
import { chatRoutes } from "./routes/chats";
import { listingRoutes } from "./routes/listings";
import { userRoutes } from "./routes/users";
// This will get replaced with the real supabase database instance that the database team sets up
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type BunRequest } from "bun";
import { setSession } from "./routes/helpers";

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Hello via Bun!");

// Creates a client for every request and appends session info to the response
function convertRoutes(conn: {supabaseURL: string, supabaseKey: string}, routes: {[K: string]: {[R: string]: (req: BunRequest<any>, client: SupabaseClient) => Promise<Response>}}) {
    return Object.fromEntries(Object.entries(routes).map(([path, methods]) => [path, Object.fromEntries(Object.entries(methods).map(([method, func]) => [method, async (req: BunRequest) => {
        const supabase = createClient(conn.supabaseURL, conn.supabaseKey);
        const session = await setSession(supabase, req);
        if (!session){
            return func(req, supabase);
        }
        const resp = await func(req, supabase);
        const body: any = await resp.json();
        // idk whether to put session tokens in header or body
        return Response.json(body, {status: resp.status, headers: { ...resp.headers, "Set-Session-Tokens": `${session.access_token} ${session.refresh_token}` }});
    }]))]));
}


export const initApp = (supabaseConn: {supabaseURL: string, supabaseKey: string}) => Bun.serve({
    port: 3000,
    routes: {
        ...convertRoutes(supabaseConn, listingRoutes),
        ...convertRoutes(supabaseConn, userRoutes),
        ...convertRoutes(supabaseConn, accountRoutes),
        ...convertRoutes(supabaseConn, chatRoutes),
        "/*": () => new Response("Not Found", {status: 404})
    }
});

const app = initApp({ supabaseURL: supabaseUrl, supabaseKey: supabaseKey });

console.log("App is running on port " + app.port);