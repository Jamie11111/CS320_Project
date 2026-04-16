import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import { signUpUser } from "../../database/auth";
import { updateUserProfile } from "../../database/users";


// Copy pasted from test_helpers.ts, but returns the auth Users instead of profiles because we need session tokens for endpoint testing
export async function generateUsers(supabaseConn: {supabaseURL: string, supabaseKey: string}, count: number, verbose: boolean = false) {
    const vlog = verbose ? console.log : (..._args: any[]) => {};
    const verr = verbose ? console.error : (..._args: any[]) => {};

    const generatedProfiles: { user: User, profile: {[ key: string ]: any}, session: Session }[] = [];

    const firstNames = ['Sam', 'Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Jamie'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];

    // UMass Amherst / Amherst area bounds for proximity testing
    const latMin = 42.365, latMax = 42.395;
    const lonMin = -72.535, lonMax = -72.515;

    vlog(`--- Generating ${count} Users ---`);

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]!;
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]!;
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Date.now()}${i}@umass.edu`;
        const password = 'testPassword123';

        // 1. Create Auth Entry
        const supabase: SupabaseClient = createClient(supabaseConn.supabaseURL, supabaseConn.supabaseKey);
        const authResult = await signUpUser(supabase, email, password, fullName);

        if (!authResult.success || !authResult.user) {
            verr(`Failed to sign up ${email}:`, authResult.message);
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
        
        if (profile && authResult.session) {
            generatedProfiles.push({ user: authResult.user, profile: profile, session: authResult.session });
            vlog(`Generated: ${fullName} (${authResult.user.id})`);
        }
    }

    return generatedProfiles;
}