import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { populateMockData } from './populate-db'; //
import {resetDatabase, fullCleanUp} from './test_helpers';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

const supabase = createClient(url, key);
let serviceClient: SupabaseClient = createClient(url, service_key);

if (!url || !key) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

async function runSeed() {
    try {
        const cleared = await fullCleanUp(serviceClient);

        console.log("Starting database population...");
        // Pass credentials so the generator can spawn individual auth clients
        await populateMockData(url, key, 10);
        console.log("Database successfully populated.");
    } catch (error) {
        console.error("Seeding failed:", error);
    }
}

runSeed();