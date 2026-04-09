import {SupabaseClient} from '@supabase/supabase-js'


/* Get all information about a listing based on the listing's id.
   Returns json object corresponding to listing or null if error */
export async function getListingByID(supabase: SupabaseClient, listingID: number) {
    const {data, error} = await supabase
        .from('listings')
        .select('*')
        .eq('listing_id', listingID)
        .single();
    
    if (error) {
        console.error('Error fetching listing', error.message);
        return null;
    }

    return data;
}

/* Get all info about all listings for a given user. 
   UserID should be UUID from auth.users 
   Returns array of json objects, each one representing a listing,
   ordered by date posted. Empty array if error */
export async function getListingsByUserID(supabase: SupabaseClient, userID: string) {
    const {data, error} = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userID)
        .order('date_posted', {ascending: false});
    
    if (error) {
        console.error('Error fetching listings', error.message);
        return [];
    }

    return data;
}

/* Get all info about the most recent listings that are still available. 
   Can specify the number of listings desired, default value is 100. */
export async function getAvailableListings(supabase: SupabaseClient, limit: number = 100) {
    const {data, error} = await supabase
        .from('listings')
        .select('*')
        .eq('sold', false)
        .order('date_posted', {ascending: false})
        .limit(limit);
    
    if (error) {
        console.error('Error fetching listings', error);
        return [];
    }

    return data;
}

/* Add a listing to the database and get all info about the listing, 
   including listing_id, date posted, and sold which are automatically set. */
export async function createListing(supabase: SupabaseClient, 
    listing: {
        user_id: string;
        product_name: string;
        product_desc: string | null;
        item_condition: string;
        price: number;
    }
) {
    const {data, error} = await supabase
        .from('listings')
        .insert({
            user_id: listing.user_id,
            product_name: listing.product_name,
            product_desc: listing.product_desc,
            item_condition: listing.item_condition,
            price: listing.price,
        })
        .select()
        .single();

        if (error) {
            console.error('Error creating listings', error.message);
            return null;
        }

        return data;
}

// Marks a listing as sold and returns all its information
export async function markListingAsSold(supabase: SupabaseClient, listingID: number) {
    const {data, error} = await supabase
        .from('listings')
        .update({sold: true})
        .eq('listing_id', listingID)
        .select()
        .single();

    if (error) {
        console.error('Error marking as sold', error.message);
        return null;
    }

    return data;
}

// Updates a listing's primary attributes and returns all its information
export async function updateListing(supabase: SupabaseClient, listingID: number, 
    updates: {
        product_name?: string;
        product_desc?: string | null;
        item_condition?: string;
        price?: number
    }
) {
    const {data, error} = await supabase
        .from('listings')
        .update(updates)
        .eq('listing_id', listingID)
        .select()
        .single();

    if (error) {
        console.error('Error updating listing', error.message)
        return null;
    }

    return data;
}

// Deletes a listing given its ID.
export async function deleteListing(supabase: SupabaseClient, listingID: number) {
    const {error} = await supabase
        .from('listings')
        .delete()
        .eq('listing_id', listingID);

    if (error) {
        console.error('Error deleting listing', error.message);
        return false;
    }

    return true;
}

/* Sample filtering function. Need to add more complexity like
   sorting by price / date / distance / combinations and better
   query matching - compare to product_desc or use full text search*/
export async function filterListings(supabase: SupabaseClient, 
    filters: {
        query?: string;
        priceLimit?: number;
        condition?: 'new' | 'good' | 'fair' | 'poor';
        sold?: boolean;
        sort_by?: 'price' | 'distance' | 'relevance' | 'date';
    }) {
        let query = supabase.from('listings').select('*');

        if (filters.query !== undefined) {
            query = query.ilike('product_name', `%${filters.query}%`);
        }

        if (filters.priceLimit !== undefined) {
            query = query.lte('price', filters.priceLimit);
        }

        if (filters.condition !== undefined) {
            query = query.eq('item_condition', filters.condition);
        }

        if (filters.sold !== undefined) {
            query = query.eq('sold', filters.sold);
        }

        const {data, error} = await query.order('date_posted', {ascending: false});

        if (error) {
            console.error('Error applying filters', error.message)
            return [];
        }

        return data;
}