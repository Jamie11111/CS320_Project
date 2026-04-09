import {SupabaseClient} from '@supabase/supabase-js'
import {deleteFromStorage} from './storage'

// add photo to table, implements logic for display_order 
export async function addListingPhoto(supabase: SupabaseClient, listingID: number, photoURL: string, photoPath: string) {
        
        const {data: curPhotos, error: e} = await supabase
            .from('photos')
            .select('*')
            .eq('listing_id', listingID)
            .order('display_order', {ascending: true});
        
        if (e) {
            console.error('Error getting current photos', e.message);
            return null;
        }

        const nextDisplay = curPhotos.length;

        if (nextDisplay > 4) {
            console.error('Photo limit per listing reached');
            return null;
        }

        const {data, error} = await supabase
            .from('photos')
            .insert({
                listing_id: listingID,
                photo_url: photoURL,
                photo_path: photoPath,
                display_order: nextDisplay,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding photo', error.message);
            return null;
        }

        return data;
}

// get all photo urls associated with a listing ordered properly
export async function getPhotosByListingID(supabase: SupabaseClient, listingID: number) {
    const {data, error} = await supabase
        .from('photos')
        .select('*')
        .eq('listing_id', listingID)
        .order('display_order', {ascending: true});
    
    if (error) {
        console.error('Error getting photos for a listing', error.message);
        return [];
    }

    return data;
}

// delete a photo from storage and general database, update display orders
export async function deletePhotoById(supabase: SupabaseClient, photoID: number) {
    const {data, error} = await supabase
        .from('photos')
        .select('*')
        .eq('photo_id', photoID)
        .single();
    
    if (error) {
        console.error('Error finding photo', error.message);
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

    // need to update display orders of remaining photos in listing
    const {data: photos, error: e2} = await supabase
        .from('photos')
        .select('*')
        .eq('listing_id', data.listing_id)
        .order('display_order', {ascending: true});

    if (e2) {
        console.error('Error getting remaining photos in listing', e2.message);
        return false;
    }

    for (let i = 0; i < photos.length; i++) {
        const {error: e3} = await supabase
            .from('photos')
            .update({display_order: i})
            .eq('photo_id', photos[i].photo_id);

        if (e3) {
            console.error('Error updating display order', e3.message);
            return false;
        }
    }

    return true;
}