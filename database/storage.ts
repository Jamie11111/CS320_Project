import {SupabaseClient} from '@supabase/supabase-js'

/* uploads file to supabase storage and returns file path and url address.
to use - call this function with appropriate parameters, store returned info
into database. when needed, use url from the separate database to display from frontend.
can use file path to remove from storage in the future. */

// Some AI assistance used
// Page 1-8 https://docs.google.com/document/d/1TK0iLnH-EV3rvX1j_EgH3SucgBUCP1FOlxMgwF1bwo4/edit?usp=sharing


export async function upload(
    supabase: SupabaseClient,
    folder: 'listings' | 'attachments' | 'profile_photos',
    fileBuffer: ArrayBuffer, // binary contents of file
    fileName: string,
    contentType: 'image/jpeg' | 'image/png' | 'video/mp4'
) {
    // uses timestamp to ensure filepath is unique
    const filePath = `${folder}/${Date.now()}-${fileName}`; 
    
    const {error} = await supabase.storage
        .from('uploads')
        .upload(filePath, fileBuffer, {contentType});
    
    if (error) {
        console.error('Error uploading to external storage', error.message);
        return null;
    }

    const {data} = supabase.storage.from('uploads').getPublicUrl(filePath);

    return {filePath: filePath, publicUrl: data.publicUrl};
}

export async function deleteFromStorage(supabase: SupabaseClient, filePath: string) {

    const {data, error} = await supabase.storage.from('uploads').remove([filePath]);

    if (error) {
        console.error('Error deleting from storage', error.message);
        return false;
    }

    if (!data || data.length === 0) {
        return false;
    }

    return true;
}