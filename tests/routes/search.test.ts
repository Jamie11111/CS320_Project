import { test, expect, describe } from "bun:test";
import path from "node:path";
import { supabase, supabaseConn, testApp } from "./setup";
import { fullCleanUp } from "../database/test_helpers";
import { createListing } from "../../database/listings";
import { generateUsers } from "./route_helpers";

// Clear tables before running tests
if (await fullCleanUp(supabase) == false)
    throw new Error("Could not clean up supabase for " + path.basename(import.meta.url));

// Generate users
const users = await generateUsers(supabaseConn, 5);

// Initialize some listings
await createListing(supabase, {
    user_id: users[1]?.user.id as string, 
    product_name: "Couch",
    product_desc: "A small couch",
    item_condition: "new", 
    price: 200
});

await createListing(supabase, {
    user_id: users[2]?.user.id as string, 
    product_name: "Sofa",
    product_desc: "A large sofa",
    item_condition: "fair", 
    price: 100
});

await createListing(supabase, {
    user_id: users[3]?.user.id as string, 
    product_name: "TV",
    product_desc: "A large TV",
    item_condition: "good", 
    price: 250
});

await createListing(supabase, {
    user_id: users[4]?.user.id as string, 
    product_name: "Laptop",
    product_desc: "A thinkpad laptop",
    item_condition: "poor", 
    price: 80
});

await createListing(supabase, {
    user_id: users[2]?.user.id as string, 
    product_name: "Toaster",
    product_desc: "A small toaster",
    item_condition: "fair", 
    price: 50
});

describe("Search tests", () => {
    const accessToken = users[0]?.session.access_token;
    const refreshToken = users[0]?.session.refresh_token;
    test("Search by name", async () => {
        const response = await fetch('localhost:3000/api/listings/search?query=couch', {
        method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            }
        });

        expect(response.status).toBe(200);
        const responseJson: {[ key: string ]: any}[] = await response.json() as {[ key: string ]: any}[];
        expect(responseJson.length).toBe(1);
    });

    test("Search by price", async () => {
        const response = await fetch('localhost:3000/api/listings/search?priceLimit=120', {
        method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            }
        });

        expect(response.status).toBe(200);
        const responseJson: {[ key: string ]: any}[] = await response.json() as {[ key: string ]: any}[];
        expect(responseJson.length).toBe(3);
    });

    test("Search by condition", async () => {
        const response = await fetch('localhost:3000/api/listings/search?condition=fair', {
        method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken} ${refreshToken}`
            }
        });

        expect(response.status).toBe(200);
        const responseJson: {[ key: string ]: any}[] = await response.json() as {[ key: string ]: any}[];
        expect(responseJson.length).toBe(2);
    });
});