import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { signUpUser } from './auth';
import { createUserProfile } from './users';

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
            user_id: authResult.user.id,
            email: email,
            name: fullName,
            address: `${Math.floor(Math.random() * 500)} North Pleasant St, Amherst, MA`,
            profile_picture_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${authResult.user.id}`,
            profile_picture_path: null,
            latitude: Math.random() * (latMax - latMin) + latMin,
            longitude: Math.random() * (lonMax - lonMin) + lonMin,
        };

        const profile = await createUserProfile(supabase, profileInfo);
        
        if (profile) {
            generatedProfiles.push(profile);
            console.log(`Generated: ${fullName} (${authResult.user.id})`);
        }
    }

    return generatedProfiles;
}