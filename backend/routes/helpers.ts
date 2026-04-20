import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest } from "bun";

export async function getJsonOrQuery(req: Request): Promise<{[ key: string ]: any}> {
    if (req.headers.get("Content-Type") === "application/json") {
        return req.body?.json();
    } else {
        const url = new URL(req.url);
        const params = new URLSearchParams(url.searchParams);
        const result: any = {};
        for (const [key, value] of params.entries()) {
            result[key] = value;
        }
        return result;
    }
}

export async function setSession(supabase: SupabaseClient, req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        return null; // No token provided
    }

    const [token, refreshToken] = authHeader.split('Bearer ')[1]?.split(' ') || [null, null];
    if (!token || !refreshToken) {
        return null;
    }

    // This validates the token against the Supabase Auth server
    const { data: { session }, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
    });

    if (error) {
        console.error('Token validation failed:', error.message);
        return null;
    }

    return session;
}