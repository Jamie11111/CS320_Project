import { accountRoutes } from "./routes/account";
import { chatRoutes, wsHandlers } from "./routes/chats";
import { listingRoutes } from "./routes/listings";
import { userRoutes } from "./routes/users";
// This will get replaced with the real supabase database instance that the database team sets up
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { type BunRequest } from "bun";
import { setSession } from "./routes/helpers";
import { getChatByID } from "./database/chats"; // used for WebSocket upgrade membership check

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
        const sessionHeader = { "Session-Tokens": `${session.access_token} ${session.refresh_token}` };
        const contentType = resp.headers.get("Content-Type") ?? "";
        if (resp.status === 204 || !contentType.includes("application/json")) {
            return new Response(resp.body, { status: resp.status, headers: { ...Object.fromEntries(resp.headers), ...sessionHeader } });
        }
        const body: any = await resp.json();
        return Response.json(body, { status: resp.status, headers: { ...Object.fromEntries(resp.headers), ...sessionHeader } });
    }]))]));
}


export const initApp = (supabaseConn: {supabaseURL: string, supabaseKey: string}) => {
    let server: ReturnType<typeof Bun.serve>;

    server = Bun.serve({
        port: 3000,
        routes: {
            ...convertRoutes(supabaseConn, listingRoutes),
            ...convertRoutes(supabaseConn, userRoutes),
            ...convertRoutes(supabaseConn, accountRoutes),
            ...convertRoutes(supabaseConn, chatRoutes),
            // WebSocket upgrade — bypasses convertRoutes since it's not a normal HTTP response
            "/api/chat/ws": async (req: Request) => {
                // Support tokens via Authorization header (non-browser) or query params (browser WebSocket API)
                const url = new URL(req.url);
                const authHeader = req.headers.get("Authorization");
                let token: string | null = null;
                let refreshToken: string | null = null;
                if (authHeader) {
                    [token, refreshToken] = authHeader.split("Bearer ")[1]?.split(" ") ?? [null, null];
                } else {
                    token = url.searchParams.get("token");
                    refreshToken = url.searchParams.get("refresh_token");
                }
                if (!token || !refreshToken) return new Response("Unauthorized", { status: 401 });

                const chatId = parseInt(url.searchParams.get("chat_id") ?? "");
                if (isNaN(chatId)) return new Response("Missing or invalid chat_id", { status: 400 });

                const supabase = createClient(supabaseConn.supabaseURL, supabaseConn.supabaseKey);
                const { data: { session }, error } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: refreshToken,
                });
                if (error || !session) return new Response("Unauthorized", { status: 401 });

                // Verify the user is a participant in this chat
                const chat = await getChatByID(supabase, chatId);
                if (!chat) return new Response("Chat not found", { status: 404 });
                if (chat.seller_id !== session.user.id && chat.customer_id !== session.user.id) {
                    return new Response("Forbidden", { status: 403 });
                }

                const upgraded = server.upgrade(req, {
                    data: { chatId, userId: session.user.id, supabase },
                });
                if (upgraded) return undefined as any;
                return new Response("WebSocket upgrade failed", { status: 500 });
            },
            "/*": () => new Response("Not Found", {status: 404})
        },
        websocket: wsHandlers,
    });

    return server;
};

const app = initApp({ supabaseURL: supabaseUrl, supabaseKey: supabaseKey });

console.log("App is running on port " + app.port);