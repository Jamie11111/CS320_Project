import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fullCleanUp, generateUsers } from './test_helpers';
import { loginUser } from '../../database/auth';
import { createListing } from '../../database/listings';
import { getSearchSuggestion } from '../../database/similarity-search';

const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_SERVICE_KEY!;

describe('similarity search tests', () => {
    
    let user1Client: SupabaseClient;
    let serviceClient: SupabaseClient;
    let profiles: any[];

    beforeAll(async () => {
        user1Client = createClient(url, key);
        serviceClient = createClient(url, service_key);

        await fullCleanUp(serviceClient); 

        profiles = await generateUsers(user1Client, 1);
        const login = await loginUser(user1Client, profiles[0].email, "testPassword123");
        expect(login.success).toBeTruthy();

        const seedItems = [
            { product_name: 'Couch', price: 100 },
            { product_name: 'iClicker 2', price: 30 },
            { product_name: 'Textbook', price: 50 },
            { product_name: 'Mini Fridge', price: 80 },
            { product_name: 'Hydroflask Water Bottle', price: 20 },
            { product_name: 'Hydration Pack', price: 15 }
        ];

        for (const item of seedItems) {
            await createListing(user1Client, {
                user_id: profiles[0].user_id,
                product_name: item.product_name,
                product_desc: `Testing similarity for ${item.product_name}`,
                item_condition: 'good',
                price: item.price,
            });
        }
    }, 20000);

    // getSearchSuggestion Tests

    it('returns an array containing "iclicker" for "iclickr"', async () => {
        const suggestion = await getSearchSuggestion(user1Client, 'iclickr');
        expect(Array.isArray(suggestion)).toBe(true);
        expect(suggestion).toContain('iclicker');
    });

    it('returns multiple suggestions for ambiguous typos (e.g., "hydra")', async () => {
        // Should suggest both "hydration" and "hydroflask"
        const suggestions = await getSearchSuggestion(user1Client, 'hydra');
        expect(suggestions?.length).toBeGreaterThan(1);
        expect(suggestions).toContain('hydroflask');
        expect(suggestions).toContain('hydration');
    });

    it('returns null for a perfect match (no suggestion needed)', async () => {
        const suggestion = await getSearchSuggestion(user1Client, 'textbook');
        expect(suggestion).toBeNull();
    });

    it('handles extra whitespace and capitalization', async () => {
        const suggestion = await getSearchSuggestion(user1Client, '   COUCHH   ');
        expect(suggestion).toContain('couch');
    });

    it('handles numeric/leet-speak typos', async () => {
        const suggestion = await getSearchSuggestion(user1Client, 'iclick3r');
        expect(suggestion).toContain('iclicker');
    });

    // Edge Cases

    it('returns null for completely irrelevant queries (out of threshold)', async () => {
        const suggestion = await getSearchSuggestion(user1Client, 'xyz789notarealword');
        expect(suggestion).toBeNull();
    });

    it('returns null for empty or whitespace-only strings', async () => {
        const empty = await getSearchSuggestion(user1Client, '');
        const spaces = await getSearchSuggestion(user1Client, '   ');
        expect(empty).toBeNull();
        expect(spaces).toBeNull();
    });

    it('respects the <= 3 length limit', async () => {
        // If many words are similar, the function logic forces it to return 
        // only when results.length <= 3. 
        // If Fuse finds 4+ matches, the current code returns null.
        const suggestion = await getSearchSuggestion(user1Client, 'o'); // very broad
        if (suggestion) {
            expect(suggestion.length).toBeLessThanOrEqual(3);
        }
    });

    it('handles empty database state correctly', async () => {
        await fullCleanUp(serviceClient);
        const suggestion = await getSearchSuggestion(user1Client, 'couch');
        expect(suggestion).toBeNull();
    });

    afterAll(async () => {
        await user1Client.auth.signOut();
    });
});