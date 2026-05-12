import { SupabaseClient } from '@supabase/supabase-js';
import { readableStreamToArray } from 'bun';
import Fuse from 'fuse.js';

// Aditya - this file contains AI generated code detailed in this document
// the prompt and response is provided for auditing, see below for more info
// https://docs.google.com/document/d/1bpbdUMpZ3FlGMj25krBomSHK2ttscMBSKxnH5exiFac/edit?usp=sharing

export async function getSearchSuggestion(supabase: SupabaseClient, query: string): Promise<string[] | null> {
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
        threshold: 0.6
    });

    const results = fuse.search(sanitizedQuery);
    console.log(results);

    if (results.length > 0 && results[0]!.item !== sanitizedQuery) {
        if(results.length <= 3) return results.map((element: any) => element.item as string);
        else{
            return results.slice(0, 3).map((element: any) => element.item as string);
        }
    }

    return [];
}