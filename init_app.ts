import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { setSession } from "./routes/helpers";
import type { BunRequest } from "bun";
import { listingRoutes } from "./routes/listings";
import { userRoutes } from "./routes/users";
import { accountRoutes } from "./routes/account";
import { chatRoutes } from "./routes/chats";
import { searchRoutes } from "./routes/search";
import { photoRoutes } from "./routes/photos";

// Creates a client for every request and appends session info to the response
function convertRoutes(conn: {supabaseURL: string, supabaseKey: string}, routes: {[K: string]: {[R: string]: (req: BunRequest<any>, client: SupabaseClient) => Promise<Response>}}) {
    return Object.fromEntries(Object.entries(routes).map(([path, methods]) => [path, Object.fromEntries(Object.entries(methods).map(([method, func]) => [method, async (req: BunRequest) => {
        const supabase = createClient(conn.supabaseURL, conn.supabaseKey);
        const session = await setSession(supabase, req);
        if (!session){
            return func(req, supabase);
        }
        const resp = await func(req, supabase);
        // idk whether to put session tokens in header or body
        return new Response(resp.body, {status: resp.status, headers: { ...resp.headers, "Set-Session-Tokens": `${session.access_token} ${session.refresh_token}` }});
    }]))]));
}

export const initApp = (supabaseConn: {supabaseURL: string, supabaseKey: string}) => Bun.serve({
    port: 3000,
    routes: {
        ...convertRoutes(supabaseConn, listingRoutes),
        ...convertRoutes(supabaseConn, userRoutes),
        ...convertRoutes(supabaseConn, accountRoutes),
        ...convertRoutes(supabaseConn, chatRoutes),
        ...convertRoutes(supabaseConn, searchRoutes),
        ...convertRoutes(supabaseConn, photoRoutes),
        "/*": () => new Response("Not Found", {status: 404})
    }
});