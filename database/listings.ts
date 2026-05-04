import {SupabaseClient} from '@supabase/supabase-js'
import {getPhotosByListingID} from './photos';
import {expandQuery} from './search_helpers';

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
export async function getAvailableListings(supabase: SupabaseClient, userID?: string, limit: number = 100, offset: number = 0) {
    
    let query = supabase
        .from('listings')
        .select('*')
        .eq('sold', false)
        .order('date_posted', {ascending: false})
        .range(offset, offset + limit);
    
    if (userID !== undefined) {
        query = query.neq('user_id', userID);
    }
    
    const {data, error} = await query;

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

// Updates a listing's primary attributes and returns all its information
export async function updateListing(supabase: SupabaseClient, listingID: number, 
    updates: {
        product_name?: string;
        product_desc?: string | null;
        item_condition?: string;
        price?: number;
        sold?: boolean;
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

/* For a given array of listings, adds a photos property to each listing with 
   up to photoLimit photos associated with that listing, sorted by display_order */
export async function attachPhotosToListings(supabase: SupabaseClient, listings: any[], photoLimit: number = 1) {
    return Promise.all(listings.map(listing => 
        getPhotosByListingID(supabase, listing.listing_id, photoLimit).then(photos => ({
            ...listing, photos: !photoLimit ? photos : photos.slice(0, photoLimit)
        })).catch(_err => ({...listing, photos: []}))
    ));
}

export async function attachPhotosAndLocationToListings(supabase: SupabaseClient, listings: any[], photoLimit: number = 1) {
    return Promise.all(listings.map(listing => Promise.all([
        getPhotosByListingID(supabase, listing.listing_id, photoLimit),
        supabase.from('users').select('address').eq('user_id', listing.user_id).single()
    ]).then(([photos, locationData]) => ({
            ...listing, photos: !photoLimit ? photos : photos.slice(0, photoLimit), location: locationData.data?.address
        })).catch(_err => ({...listing, photos: []}))
    ));
}

/* Filtering function - takes in set of optional filters, user_id of user 
   making request required in order to sort by distance. */
export async function filterListings(supabase: SupabaseClient,
    filters: {
        query?: string;
        priceLimit?: number;
        condition?: 'new' | 'good' | 'fair' | 'poor';
        sold?: boolean;
        sort_by?: 'price' | 'distance' | 'relevance' | 'date';
        lmt?: number;
        offset?: number;
    }, user_id?: string) {
        
        const query = filters.query?.toLowerCase().trim();
        let originalQuery: string | null = null;
        let expandedQuery: string | null = null;
    
        if (query) {
            originalQuery = query;
            expandedQuery = expandQuery(query);
        }

        let lat: number | null = null;
        let long: number | null = null;
        
        if (filters.sort_by === 'distance') {
            
            if (user_id === undefined) {
                console.error('Need user info to filter by distance');
                return [];
            }

            const {data, error} = await supabase
                .from('users')
                .select('latitude, longitude')
                .eq('user_id', user_id)
                .single();
            
            if (error) {
                console.error('Error getting location info for user', error.message);
                return [];
            }

            lat = data.latitude;
            long = data.longitude;
        }

        const {data, error} = await supabase.rpc('filter_listings', {
            viewer_id: user_id ?? null,
            query: originalQuery,
            expanded_query: expandedQuery,
            price_limit: filters.priceLimit,
            condition: filters.condition,
            sold_filter: filters.sold,
            sort_by: filters.sort_by ?? 'date',
            lmt: filters.lmt ?? 20,
            offset_count: filters.offset ?? 0,
            lat: lat,
            long: long, 
        });

        if (error) {
            console.error('Error applying filters', error.message)
            return [];
        }

        return data;
}