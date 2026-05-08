import { createClient } from "@supabase/supabase-js";
import { basicCategoryMapping, generateListings, generateUsers } from "./tests/routes/route_helpers";
import { fullCleanUp } from "./tests/database/test_helpers";
import { signUpUser } from "./database/auth";


const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseClientKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseConn = { supabaseURL: supabaseUrl, supabaseKey: supabaseClientKey };

if (await fullCleanUp(createClient(supabaseUrl, supabaseServiceKey)) == false)
    throw new Error("Could not clean up supabase");

const users = await generateUsers(supabaseConn, 15, true);

const listings = await generateListings(supabaseConn, users, 10, basicCategoryMapping, true);

if (process.env.MY_TEST_EMAIL && process.env.MY_TEST_PASSWORD) {
    const myUser = await signUpUser(createClient(supabaseUrl, supabaseServiceKey), process.env.MY_TEST_EMAIL, process.env.MY_TEST_PASSWORD, "Test User");

    if (!myUser.success) {
        console.error("Failed to create test user:", myUser.message);
    } else {
        console.log("Test user created successfully:", myUser.user);
    }
}

