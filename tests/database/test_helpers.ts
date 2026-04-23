import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { signUpUser } from '../../database/auth';
import { updateUserProfile } from '../../database/users';

// Simple function to clear tables but leave users, auth.users() and storage.
// Requires service key
export async function clearTables(supabase: SupabaseClient) {
    
    const toDelete: [string, string][] = [
        ['attachments', 'attachment_id'],
        ['messages', 'message_id'],
        ['photos', 'photo_id'],
        ['chats', 'chat_id'],
        ['listings', 'listing_id']];

    for (const [table, col] of toDelete) {
        const {error} = await supabase.from(table).delete().neq(col, 0);
        if (error) {
            console.error('Failed to clear table', error.message);
            return false;
        }
    }

    return true;
}

// FULL clean up function - deletes everything including storage and auth.users()
// Requires service key
export async function fullCleanUp(supabase: SupabaseClient) {
    
    // clean up storage

    async function deleteFolder(supabase: SupabaseClient, folder: string) {
        const {data, error} = await supabase.storage.from('uploads').list(folder);
        if (error) {
            console.error("Error getting folders", error.message);
            return false;
        }
        const files = data.map(file => `${folder}/${file.name}`);
        if (files.length === 0) return true;

        const {error: deleteError} = await supabase.storage.from('uploads').remove(files);
        if (deleteError) {
            console.error("Error deleting files", deleteError.message);
            return false;
        } 
        return true;
    }
    
    const del1 = await deleteFolder(supabase, 'listings');
    const del2 = await deleteFolder(supabase, 'attachments');
    const del3 = await deleteFolder(supabase, 'profile_photos');

    if (!del1 || !del2 || !del3) return false;

    // clear auth.users() - will cascade and delete rest

    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) {
        console.error('Failed to get users', error.message);
        return false;
    }

    for (const u of users) {
        const {error: deleteError} = await supabase.auth.admin.deleteUser(u.id);
        if (deleteError) {
            console.error('Failed to delete from auth user', deleteError.message);
            return false;
        }
    }

    return true;
}

// DOESN'T WORK because don't have permissions required to run complete nuke_db function

// to reset the db so you can add new mock data for your specific testing purposes
export async function resetDatabase(supabase: SupabaseClient) {
    const { error } = await supabase.rpc('nuke_db');

    if (error) {
        console.error('Failed to nuke database:', error.message);
        return false;
    }

    console.log('Database wiped and ID counters reset to 1.');
    return true;
}

export async function generateUsers(supabase: SupabaseClient, count: number) {
    const generatedProfiles = [];

    const firstNames = ['Sam', 'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Jamie'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];

    // UMass Amherst / Amherst area bounds for proximity testing
    const latMin = 42.365, latMax = 42.395;
    const lonMin = -72.535, lonMax = -72.515;

    console.log(`--- Generating ${count} Users ---`);

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!;
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!;
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@umass.edu`;
        const password = 'testPassword123';

        // 1. Create Auth Entry
        const authResult = await signUpUser(supabase, email, password, fullName);

        if (!authResult.success || !authResult.user) {
            console.error(`Failed to sign up ${email}:`, authResult.message);
            continue;
        }

        // 2. Create Public Profile
        const profileInfo = {
            name: fullName,
            address: `${Math.floor(Math.random() * 500)} North Pleasant St, Amherst, MA`,
            profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authResult.user.id}`,
            profile_picture_path: null,
            latitude: Math.random() * (latMax - latMin) + latMin,
            longitude: Math.random() * (lonMax - lonMin) + lonMin,
        };

        const profile = await updateUserProfile(supabase, authResult.user.id, profileInfo);
        
        if (profile) {
            generatedProfiles.push(profile);
            console.log(`Generated: ${fullName} (${authResult.user.id})`);
        }
    }

    return generatedProfiles;
}