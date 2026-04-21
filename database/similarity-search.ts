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