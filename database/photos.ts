import {SupabaseClient} from '@supabase/supabase-js'

// add photo url to listings table
export async function addListingPhoto(supabase: SupabaseClient, listingID: number, photoURL: string, photoPath: string) {
        const {data, error} = await supabase
            .from('photos')
            .insert({
                listing_id: listingID,
                photo_url: photoURL,
                photo_path: photoPath
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding photo url', error.message);
            return null;
        }

        return data;
}

// get all photo urls associated with a listing
export async function getPhotosByListingID(supabase: SupabaseClient, listingID: number) {
    const {data, error} = await supabase
        .from('photos')
        .select('*')
        .eq('listing_id', listingID)
    
    if (error) {
        console.error('Error getting photos for a listing', error.message);
        return [];
    }

    return data;
}

// delete one photo url
export async function deletePhotoById(supabase: SupabaseClient, photoID: number) {
    const {error} = await supabase
        .from('photos')
        .delete()
        .eq('photo_id', photoID)
    
    if (error) {
        console.error('Error deleting a photo', error.message);
    }
}