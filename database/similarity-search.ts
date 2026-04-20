// import { SupabaseClient } from '@supabase/supabase-js';
// import Fuse from 'fuse.js';

// /**
//  * Returns listing IDs that closely match the query.
//  * Pulls active listings from DB and performs in-memory fuzzy matching.
//  */
// export async function searchListingsSimilar(supabase: SupabaseClient, query: string) {
//     const { data: listings, error } = await supabase
//         .from('listings')
//         .select('listing_id, product_name')
//         .eq('sold', false);

//     if (error || !listings) {
//         console.error('Error fetching listings for similarity search:', error?.message);
//         return [];
//     }

//     const fuse = new Fuse(listings, {
//         keys: ['product_name'],
//         threshold: 0.35 // Balances precision vs recall
//     });

//     return fuse.search(query).map(res => res.item.listing_id);
// }

// /**
//  * "Did you mean?" feature that dynamically builds its corpus from current listings.
//  * Extracts unique words from all product names to suggest corrections.
//  */
// export async function getSearchSuggestion(supabase: SupabaseClient, query: string): Promise<string | null> {
//     // 1. Fetch all product names currently in the marketplace
//     const { data, error } = await supabase
//         .from('listings')
//         .select('product_name')
//         .eq('sold', false);

//     if (error || !data) return null;

//     // 2. Create a dynamic set of unique words/categories from listings
//     // We split names into words to suggest "Couch" instead of "Big Blue Couch"
//     const words = data.flatMap(item => 
//         item.product_name.toLowerCase().split(/\s+/)
//     );
//     const uniqueCorpus = Array.from(new Set(words));

//     // 3. Run fuzzy search against the dynamic corpus
//     const fuse = new Fuse(uniqueCorpus, {
//         threshold: 0.4
//     });

//     const results = fuse.search(query);

//     // 4. Return the best correction if it exists and isn't identical to input
//     if (results.length > 0 && results[0]!.item !== query.toLowerCase()) {
//         return results[0]!.item;
//     }

//     return null;
// }








import { SupabaseClient } from '@supabase/supabase-js';
import Fuse from 'fuse.js';

export async function searchListingsSimilar(supabase: SupabaseClient, query: string) {
    const { data: listings, error } = await supabase
        .from('listings')
        .select('listing_id, product_name')
        .eq('sold', false);

    if (error || !listings) return [];

    const fuse = new Fuse(listings, {
        keys: ['product_name'],
        threshold: 0.5,       // Increased for better "Mini Fridge" matching
        ignoreLocation: true  // Crucial: matches words regardless of where they are in the string
    });

    return fuse.search(query.trim()).map(res => res.item.listing_id);
}

export async function getSearchSuggestion(supabase: SupabaseClient, query: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('listings')
        .select('product_name')
        .eq('sold', false);

    if (error || !data) return null;

    // Sanitize the input query
    const sanitizedQuery = query.trim().toLowerCase();
    if (!sanitizedQuery) return null;

    const words = data.flatMap(item => 
        item.product_name.toLowerCase().split(/\s+/)
    );
    const uniqueCorpus = Array.from(new Set(words));

    const fuse = new Fuse(uniqueCorpus, {
        threshold: 0.4
    });

    const results = fuse.search(sanitizedQuery);

    if (results.length > 0 && results[0]!.item !== sanitizedQuery) {
        return results[0]!.item;
    }

    return null;
}