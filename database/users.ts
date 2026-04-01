import {SupabaseClient} from '@supabase/supabase-js'

/* Add a user to own users table and returns all info. 
   Only call after auth signup complete and UUID retrieved. */
export async function createUserProfile(
    supabase: SupabaseClient,
    userInfo: {
        user_id: string // UUID 
        email: string;
        name: string;
        address: string | null;
        profile_picture_url: string | null;
        profile_picture_path: string | null;
        latitude: number | null;
        longitude: number | null;
    }) {
        const {data, error} = await supabase
            .from('users')
            .insert({
                user_id: userInfo.user_id,
                email: userInfo.email,
                name: userInfo.name,
                address: userInfo.address,
                profile_picture_url: userInfo.profile_picture_url,
                profile_picture_path: userInfo.profile_picture_path,
                latitude: userInfo.latitude,
                longitude: userInfo.longitude,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user profile', error.message);
            return null;
        }

        return data;
}

// Gets all info about a user given their id
export async function getUserProfileById(supabase: SupabaseClient, userID: string) {
    const {data, error} = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userID)
        .single();
    
    if (error) {
        console.error('Error getting user profile', error.message);
        return null;
    }

    return data;
}

// Updates user profile given their id and list of updates, returns all info
export async function updateUserProfile(supabase: SupabaseClient, userID: string,
    updates: {
        name?: string;
        address?: string | null;
        profile_picture_url?: string | null;
        profile_picture_path?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    }
) {
    const {data, error} = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userID)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating user profile', error.message);
        return null;
    }

    return data;
}

// Deletes a user profile given their id
export async function deleteUserProfile(supabase: SupabaseClient, userID: string) {
    const {error} = await supabase
        .from('users')
        .delete()
        .eq('user_id', userID)
    
    if (error) {
        console.error('Error deleting user profile', error.message);
    }
}