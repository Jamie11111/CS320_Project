import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest } from "bun";
import { getJsonOrQuery } from "./helpers";
import { filterListings } from "../database/listings";

export const searchRoutes = {
    "/api/listings/search": {
        GET: async (req: BunRequest, supabase: SupabaseClient) => await searchListings(supabase, req),
    },
};

/**
 * Search listings using a set of filters/queries
 * @param supabase 
 * Connected database
 * @param req 
 * Request containing search filters as either query parameters, or as json. 
 * Valid keys for filtering are:
 * - `query?: string`
 * - `priceLimit?: number`
 * - `condition?: 'new' | 'good' | 'fair' | 'poor'`
 * - `sold?: boolean`
 * - `sort_by?: 'price' | 'distance' | 'relevance' | 'date'`
 * - `lmt?: number`
 * @returns 
 * Listings matching the provided filters
 */
async function searchListings(supabase: SupabaseClient, req: BunRequest){
    const query = await getJsonOrQuery(req);
    // console.log(query);
    // Do we really want to require a logged in user for searching?
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        return Response.json({error: error}, {status: 401});
    } else if (!user) {
        return Response.json({error: "Must be logged in to search listings"}, {status: 401});
    }
    return Response.json(await filterListings(supabase, query, user.id), {status: 200});
}