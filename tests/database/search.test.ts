import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { fullCleanUp, generateUsers } from './test_helpers';
import { loginUser } from '../../database/auth';
import { createListing, filterListings } from '../../database/listings';

const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

type Listing = {
    listing_id: number;
    user_id: string;
    product_name: string
    product_desc: string;
    item_condition: 'new' | 'good' | 'fair' | 'poor';
    price: number;
    date_posted: string;
    sold: boolean;
    relevance_score: number;
    distance: number | null;
};

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
            { product_name: 'Couch', product_desc: 'Blue couch for dorm', item_condition: 'good', price: 100 },
            { product_name: 'Leather Sofa', product_desc: 'Brown sofa with minor wear', item_condition: 'fair', price: 60 },
            { product_name: 'iClicker 2', product_desc: 'Works well for class', item_condition: 'good', price: 30 },
            { product_name: 'Textbook', product_desc: 'Calculus textbook for school', item_condition: 'good', price: 50 },
            { product_name: 'Mini Fridge', product_desc: 'Compact refrigerator for dorm room', item_condition: 'good', price: 80 },
            { product_name: 'Calculator', product_desc: 'TI-84 for math classes', item_condition: 'good', price: 70 },
            { product_name: 'Desk Chair', product_desc: 'Black office chair', item_condition: 'good', price: 35 },
            { product_name: 'Television', product_desc: '32 inch smart tv', item_condition: 'good', price: 120 },
            { product_name: 'Mountain Bike', product_desc: 'Used bicycle in solid condition', item_condition: 'good', price: 140 },
            { product_name: 'Winter Jacket', product_desc: 'Warm coat for cold weather', item_condition: 'good', price: 45 },
        ];

        for (const item of seedItems) {
            const created = await createListing(user1Client, {
                user_id: profiles[0].user_id,
                product_name: item.product_name,
                product_desc: item.product_desc,
                item_condition: item.item_condition,
                price: item.price,
            });
            expect(created).toBeTruthy();
        }
    }, 20000);

    it('recognizes "coch" as "Couch"', async () => {
        const results = await filterListings(user1Client, {query: 'coch'});
        expect(results.length).toBeGreaterThan(0);
        
        // Verify the first result is actually the Couch listing
        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', results[0].listing_id)
            .single();
        
        expect(data!.product_name).toBe('Couch');
    });

    it('recognizes "mini frigde" as "Mini Fridge"', async () => {
        const results = await filterListings(user1Client, {query: 'mini frigde'});
        expect(results.length).toBeGreaterThan(0);
        
        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', results[0].listing_id)
            .single();
        
        expect(data!.product_name).toBe('Mini Fridge');
    });

    it('recognizes synonym "couch" and finds "Leather Sofa"', async () => {
        const result: Listing[] = await filterListings(user1Client, { query: 'couch' });
        const listingIds = result.map(l => l.listing_id);

        expect(listingIds.length).toBeGreaterThan(0);

        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .in('listing_id', listingIds);

        const names = data!.map(x => x.product_name);
        expect(names).toContain('Leather Sofa');
        expect(names).toContain('Couch');
    });

    it('recognizes synonym "bike" and finds "Mountain Bike"', async () => {
        const result: Listing[] = await filterListings(user1Client, { query: 'bicycle' });
        const listingIds = result.map(l => l.listing_id);

        expect(listingIds.length).toBeGreaterThan(0);

        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', listingIds[0])
            .single();

        expect(data!.product_name).toBe('Mountain Bike');
    });

    it('recognizes phrase "graphing calculator"', async () => {
        const results = await filterListings(user1Client, { query: 'graphing calculator' });
        expect(results.length).toBeGreaterThan(0);

        const { data } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', results[0].listing_id)
            .single();

        expect(data!.product_name).toBe('Calculator');
    });

    it('handles multiple relevant results and ranking', async () => {
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

        // Search for "Hydro Bottle"
        const results = await filterListings(user1Client, {query: 'Hydro Bottle'});
        
        // Expect both to be caught by the fuzzy search
        expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('exact match ranks above synonym match', async () => {
        const result: Listing[] = await filterListings(user1Client, {
            query: 'couch',
            sort_by: 'relevance'
        });
        const listingIds = result.map(l => l.listing_id);

        expect(listingIds.length).toBeGreaterThan(0);

        const { data: first } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', listingIds[0])
            .single();

        const { data: second } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', listingIds[1])
            .single();

        expect(first!.product_name).toBe('Couch');
        expect(second!.product_name).toBe('Leather Sofa');
    });

    it('product_name match prioritized over product_desc', async () => {

        await createListing(user1Client, {
            user_id: profiles[0].user_id,
            product_name: 'Desk Lamp',
            product_desc: 'Not too bright',
            item_condition: 'good',
            price: 25,
        });

        await createListing(user1Client, {
            user_id: profiles[0].user_id,
            product_name: 'Dorm item',
            product_desc: 'Great desk lamp for studying at night',
            item_condition: 'good',
            price: 20,
        });

        const result: Listing[] = await filterListings(user1Client, {
            query: 'desk lamp',
            sort_by: 'relevance'
        });
        const listingIds = result.map(l => l.listing_id);

        expect(listingIds.length).toBeGreaterThan(0);

        const { data: first } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', listingIds[0])
            .single();

        const { data: second } = await user1Client
            .from('listings')
            .select('product_name')
            .eq('listing_id', listingIds[1])
            .single();

        expect(first!.product_name).toBe('Desk Lamp');
        expect(second!.product_name).toBe('Dorm item');
    });

    it('returns empty array for completely irrelevant queries', async () => {
        const results = await filterListings(user1Client, {query: 'xyz789notarealword'});
        expect(results.length).toBe(0);
    });

    it('robustness: handles empty database state', async () => {
        // Temporarily clear everything to test empty state handling
        await fullCleanUp(serviceClient);
        
        const results = await filterListings(user1Client, {query: 'anything'});
        
        expect(results).toEqual([]);
    });

    afterAll(async () => {
        await user1Client.auth.signOut();
    });
});