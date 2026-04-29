import fs from 'fs';
import {createClient} from '@supabase/supabase-js';
import {generateUsers} from '../test_helpers';
import {loginUser} from '../../../database/auth';
import {filterListings} from '../../../database/listings';

// run from root using bun run tests/database/scripts/perform_search.ts

const DEMO_SEARCH_QUERIES = [
  'monitor',
  'desk lamp',
  'microwave',
  'printer',
  'bookshelf',
  'vacuum',
  'fan',
  'backpack',
  'hoodie',
  'winter coat',

  'moniter',
  'micorwave',
  'vaccum',
  'backpak',
  'hoodiee',

  'screen',
  'computer',
  'notebook',
  'school bag',
  'sneakers',

  'study chair',
  'storage bin',
  'water bottle',
  'phone charger',
  'bluetooth speaker',

  'cheap printer',
  'black backpack',
  'small fan',
  'used monitor',
  'white desk lamp',

  'mirror stand',
  'shoe rack',
  'office shelf',
  'gaming chair',
  'portable speaker'
];


const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

const user1Client = createClient(url, key);
const serviceClient = createClient(url, service_key);

// create and login user to upload and view listings
const profiles = await generateUsers(user1Client, 1);
await loginUser(user1Client, profiles[0].email, "testPassword123");

// can call these two functions and results will be printed
//await testOnAmazonQueries();
for (const query of DEMO_SEARCH_QUERIES) await testOnQuery(query, false, 3);

// adds listings from ebay_titles_sample to listings table
async function addListings() {

    // clear listings table first
    const {error: deleteError} = await serviceClient.from('listings').delete().neq('listing_id', 0);
    if (deleteError) return false;

    // load ebay titles and store array or product names
    const csv = fs.readFileSync('tests/database/data/ebay_titles_sample.csv', 'utf8');
    const listings_info = csv.split('\n').slice(1)
        .map(line => line.trim()).filter(Boolean).map(line => {
            const splitLoc = line.indexOf(',');
            return {
                product_name: line.slice(0, splitLoc).replace(/^"|"$/g, ''),
                product_desc: line.slice(splitLoc+1).replace(/^"|"$/g, '')
            }; 
        });

    // create listing object for each product
    // should vary fields for later testing
    const listings = listings_info.map(listing => ({
        user_id: profiles[0].user_id,
        product_name: listing.product_name,
        product_desc: listing.product_desc,
        item_condition: 'good',
        price: 10,
        sold: false,
    }));

    const {error: insertError} = await user1Client.from('listings').insert(listings);
    if (insertError) {
        console.error('Error adding listings to database', insertError.message);
        return false;
    } 
    else {
        console.log(`Inserted ${listings.length} listings`);
    }

    return true;
}

// returns array of queries from amazon_queries_sample
async function getQueries() {
    const queries_csv = fs.readFileSync('tests/database/data/amazon_queries_sample.csv', 'utf8');
    const queries = queries_csv.split('\n').slice(1)
        .map(line => line.trim().replace(/^"|"$/g, '')).filter(Boolean);
    return queries;
}

async function testOnAmazonQueries(addFirst: boolean = false) {
    // add listings to DB first if not already added
    if (addFirst) {
        const result = await addListings();
        if (!result) {
            console.log('Error adding listings');
            process.exit(1);
        }
    }

    // try each amazon search query, print results
    const queries = await getQueries();
    for (const query of queries) {
        const results = await filterListings(user1Client, {
            query,
            sort_by: 'relevance',
            lmt: 5,
        });

        console.log('\nQUERY:', query);

        if (results.length === 0) {
            console.log('  No results');
            continue;
        }

        for (const result of results) {
            console.log(
                `  - ${result.product_name} | score=${result.relevance_score}`
            );
        }
    }
}

async function testOnQuery(query: string, addFirst: boolean = false, lmt: number = 10) {
    // add listings to DB first if not already added
    if (addFirst) {
        const result = await addListings();
        if (!result) {
            console.log('Error adding listings');
            process.exit(1);
        }
    }

    const results = await filterListings(user1Client, {
        query,
        sort_by: 'relevance',
        lmt: lmt,
    });

    console.log('\nQUERY:', query);

    if (results.length === 0) {
        console.log('  No results');
        return;
    }

    for (const result of results) {
        console.log(
            `\n  - ${result.product_name} | score=${result.relevance_score} \n ${result.product_desc}`
        );
    }
}
