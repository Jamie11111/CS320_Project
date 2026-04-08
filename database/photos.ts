import {SupabaseClient} from '@supabase/supabase-js'
import {deleteFromStorage} from './storage'

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
        .eq('listing_id', listingID);
    
    if (error) {
        console.error('Error getting photos for a listing', error.message);
        return [];
    }

    return data;
}

// delete a photo from storage and general database
export async function deletePhotoById(supabase: SupabaseClient, photoID: number) {
    const {data, error} = await supabase
        .from('photos')
        .select('photo_path')
        .eq('photo_id', photoID)
        .single();
    
    if (error) {
        console.error('Error finding photo in storage', error.message);
        return false;
    }

    if (data?.photo_path) {
        const success = await deleteFromStorage(supabase, data.photo_path);
        if (!success) 
            return false;
    }
    
    const {error: e} = await supabase
        .from('photos')
        .delete()
        .eq('photo_id', photoID);
    
    if (e) {
        console.error('Error deleting a photo', e.message);
        return false;
    }

    return true;
}