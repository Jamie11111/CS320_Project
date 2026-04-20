import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fullCleanUp, generateUsers } from './test_helpers';
import { loginUser } from '../../database/auth';
import { createListing } from '../../database/listings';
import { searchListingsSimilar, getSearchSuggestion } from '../../database/similarity-search';

const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

describe('similarity search tests', () => {
    
    let user1Client: SupabaseClient;
    let serviceClient: SupabaseClient;
    let profiles: any[];

    beforeAll(async () => {
        // We use serviceClient for cleaning tables
        user1Client = createClient(url, key);
        serviceClient = createClient(url, service_key);

        // 1. Clear tables to remove existing data interference
        const cleared = await fullCleanUp(serviceClient);
        expect(cleared).toBeTruthy(); 

        // 2. Setup testing user
        profiles = await generateUsers(user1Client, 1);
        const login = await loginUser(user1Client, profiles[0].email, "testPassword123");
        expect(login.success).toBeTruthy();

        // 3. Seed typo-prone listings
        const seedItems = [
            { product_name: 'Couch', price: 100 },
            { product_name: 'iClicker 2', price: 30 },
            { product_name: 'Textbook', price: 50 },
            { product_name: 'Mini Fridge', price: 80 }
        ];

        for (const item of seedItems) {
            const created = await createListing(user1Client, {
                user_id: profiles[0].user_id,
                product_name: item.product_name,
                product_desc: `Testing similarity for ${item.product_name}`,
                item_condition: 'good',
                price: item.price,
            });
            expect(created).toBeTruthy();
        }
    }, 20000);

    it('searchListingsSimilar: recognizes "coch" as "Couch"', async () => {
        const results = await searchListingsSimilar(user1Client, 'coch');
        expect(results.length).toBeGreaterThan(0);
        
        // Verify the first result is actually the Couch listing
        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', results[0])
            .single();
        
        expect(data!.product_name).toBe('Couch');
    });

    it('searchListingsSimilar: recognizes "frigde" as "Mini Fridge"', async () => {
        const results = await searchListingsSimilar(user1Client, 'frigde');
        expect(results.length).toBeGreaterThan(0);
        
        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', results[0])
            .single();
        
        expect(data!.product_name).toBe('Mini Fridge');
    });

    it('getSearchSuggestion: suggests "iclicker" for "iclickr"', async () => {
        // getSearchSuggestion processes words in lowercase from the DB
        const suggestion = await getSearchSuggestion(user1Client, 'iclickr');
        
        expect(suggestion).toBe('iclicker');
    });

    it('getSearchSuggestion: returns null for a perfect match', async () => {
        // Should not suggest anything if the user typed it correctly
        const suggestion = await getSearchSuggestion(user1Client, 'textbook');
        expect(suggestion).toBeNull();
    });

    it('searchListingsSimilar: handles multiple relevant results and ranking', async () => {
        // Seed two similar items
        await createListing(user1Client, {
            user_id: profiles[0].user_id,
            product_name: 'Hydroflask Water Bottle',
            product_desc: 'Blue',
            item_condition: 'good',
            price: 20,
        });
        await createListing(user1Client, {
            user_id: profiles[0].user_id,
            product_name: 'Hydration Bottle',
            product_desc: 'Clear',
            item_condition: 'new',
            price: 15,
        });

        // Search for "Hydro"
        const results = await searchListingsSimilar(user1Client, 'Hydro');
        
        // Expect both to be caught by the fuzzy search
        expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('searchListingsSimilar: returns empty array for completely irrelevant queries', async () => {
        const results = await searchListingsSimilar(user1Client, 'xyz789notarealword');
        expect(results.length).toBe(0);
    });

    it('getSearchSuggestion: handles extra whitespace and capitalization', async () => {
        // Input with messy formatting should still map to "couch"
        const suggestion = await getSearchSuggestion(user1Client, '   COUCHH   ');
        expect(suggestion).toBe('couch');
    });

    it('getSearchSuggestion: handles numeric typos (e.g., iClick3r)', async () => {
        const suggestion = await getSearchSuggestion(user1Client, 'iclick3r');
        expect(suggestion).toBe('iclicker');
    });

    it('robustness: handles empty database state', async () => {
        // Temporarily clear everything to test empty state handling
        await fullCleanUp(serviceClient);
        
        const results = await searchListingsSimilar(user1Client, 'anything');
        const suggestion = await getSearchSuggestion(user1Client, 'anything');
        
        expect(results).toEqual([]);
        expect(suggestion).toBeNull();
    });

    afterAll(async () => {
        await user1Client.auth.signOut();
    });
});