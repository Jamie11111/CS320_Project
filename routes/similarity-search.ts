import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest } from "bun";
import { getJsonOrQuery } from "./helpers";
import { getSearchSuggestion } from "../database/similarity-search";

export const similaritySearchRoutes = {
    "/api/listings/search-suggestions": {
        GET: async (req: BunRequest, supabase: SupabaseClient) =>
            await searchSuggestions(supabase, req),
    },
};

async function searchSuggestions(supabase: SupabaseClient, req: BunRequest) {
    const params = await getJsonOrQuery(req);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        return Response.json({ error }, { status: 401 });
    } else if (!user) {
        return Response.json(
            { error: "Must be logged in to search listings" },
            { status: 401 },
        );
    }
    const raw = await getSearchSuggestion(
        supabase,
        String(params.query ?? ""),
    );
    const suggestions = raw ?? [];
    return Response.json({ suggestions }, { status: 200 });
}
