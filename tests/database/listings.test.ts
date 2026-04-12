import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {clearTables, fullCleanUp, generateUsers} from './test_helpers';
import {loginUser} from '../../database/auth';
import {createListing, updateListing, getAvailableListings, markListingAsSold,
    deleteListing, filterListings, getListingByID, getListingsByUserID} 
    from '../../database/listings';
import {deletePhotoById, addListingPhoto, getPhotosByListingID} from '../../database/photos';
import {upload} from '../../database/storage';
import {updateUserProfile} from '../../database/users';

// run using bun test tests/database/listings.test.ts

const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

describe('listing tests', () => {
    
    let generalClient: SupabaseClient;
    let user1Client: SupabaseClient;
    let user2Client: SupabaseClient;
    let user3Client: SupabaseClient;
    let serviceClient: SupabaseClient;
    let profiles: any[];

    beforeAll(async () => {
        generalClient = createClient(url, key);
        user1Client = createClient(url, key);
        user2Client = createClient(url, key);
        user3Client = createClient(url, key);
        serviceClient = createClient(url, service_key)
        const userClients = [user1Client, user2Client, user3Client];

        // can only clear tables with service_key
        const cleared = await fullCleanUp(serviceClient);
        expect(cleared).toBeTruthy(); 

        profiles = await generateUsers(generalClient, 3);
        const password = "testPassword123";
        expect(profiles.length).toBe(3);

        for (let i = 0; i < 3; i++) { 
            const result = await loginUser(userClients[i]!, profiles[i].email, password);
            expect(result.success).toBeTruthy();
        };        
    }, 10000);

    it('listing flow works', async() => {
        
        // check listings added properly
        const listing1 = await createListing(user1Client, {
            user_id: profiles[0].user_id,
            product_name: 'Bike',
            product_desc: 'Red bike',
            item_condition: 'good',
            price: 50,
        });
        expect(listing1).toBeTruthy();
        expect(listing1.user_id).toBe(profiles[0].user_id);

        const listing2 = await createListing(user2Client, {
            user_id: profiles[1].user_id,
            product_name: 'Mattress',
            product_desc: null,
            item_condition: 'fair',
            price: 20,
        });     
        expect(listing2).toBeTruthy();
        expect(listing2.user_id).toBe(profiles[1].user_id);
    
        // check user can view someone else's listing
        const received = await getListingByID(user2Client, listing1.listing_id);
        expect(received).toBeTruthy();
        expect(received.listing_id).toBe(listing1.listing_id);

        // check user can see all their listings
        const user1Listings = await getListingsByUserID(user1Client, profiles[0].user_id);
        expect(user1Listings.length).toBe(1);
        expect(user1Listings[0].listing_id).toBe(listing1.listing_id);

        // check user can update own listing
        const goodUpdate = await updateListing(user1Client, listing1.listing_id, {price: 40});
        expect(goodUpdate).toBeTruthy();
        expect(goodUpdate.price).toBe(40);

        // check user can't update other's listing
        await updateListing(user2Client, listing1.listing_id, {price: 10});
        const listing1Info = await getListingByID(user2Client, listing1.listing_id);
        expect(listing1Info.price).toBe(40);        

        // all available listings displayed properly
        const allAvailableListings = await getAvailableListings(user3Client, profiles[2].user_id);
        expect(allAvailableListings.length).toBe(2);
        
        // deletion properly removes listing
        const deleted = await deleteListing(user2Client, listing2.listing_id);
        expect(deleted).toBeTruthy();
        const updatedListings = await getAvailableListings(user3Client, profiles[2].user_id);
        expect(updatedListings.length).toBe(1);
        expect(updatedListings[0].listing_id).toBe(listing1.listing_id);

        // add more useful listings

        const listing3 = await createListing(user2Client, {
            user_id: profiles[1].user_id,
            product_name: 'Textbook',
            product_desc: 'Physics 1 required textbook',
            item_condition: 'good',
            price: 25,
        });

        const listing4 = await createListing(user2Client, {
            user_id: profiles[1].user_id,
            product_name: 'Math textbook',
            product_desc: 'Useful for linear algebra',
            item_condition: 'fair',
            price: 20,
        });

        // check product marked as sold
        const soldProduct = await markListingAsSold(user2Client, listing3.listing_id);
        expect(soldProduct).toBeTruthy();
        expect(soldProduct.sold).toBeTruthy();

        // check change in sold reflected, only unsold product
        // not belonging to user making request are listed
        const available = await getAvailableListings(user1Client, profiles[0].user_id);
        expect(available.length).toBe(1);
        expect(available[0].listing_id).toBe(listing4.listing_id);

        // check filter works reasonably well
        const textbooksListed = await filterListings(user3Client, profiles[2].user_id, {
            query: 'textbook',
            priceLimit: 50,
            sort_by: 'relevance',
            lmt: 5
        });
        expect(textbooksListed.length).toBe(2);
        expect(textbooksListed[0].listing_id).toBe(listing3.listing_id);
        expect(textbooksListed[1].listing_id).toBe(listing4.listing_id);

        // check sorting by distance. make user 1 closer to user 2 than user 3 
        const updateUser1 = updateUserProfile(user1Client, profiles[0].user_id, 
            {latitude: 45, longitude: -76});
        expect(updateUser1).toBeTruthy();
        const updateUser2 = updateUserProfile(user2Client, profiles[1].user_id, 
            {latitude: 20, longitude: -90});
        expect(updateUser2).toBeTruthy();

        const closestListings = await filterListings(user3Client, profiles[2].user_id, 
            {sort_by: 'distance'});
        expect(closestListings.length).toBe(3);
        expect(closestListings[0].listing_id).toBe(listing1.listing_id);
        expect(closestListings[1].listing_id).toBe(listing4.listing_id); 
        expect(closestListings[2].listing_id).toBe(listing3.listing_id);
    }, 10000);

    it('photo upload works', async () => {
        const listing = await createListing(user3Client, {
            user_id: profiles[2].user_id,
            product_name: 'Desk lamp',
            product_desc: null,
            item_condition: 'new',
            price: 20,
        });     
        expect(listing).toBeTruthy();

        // upload images to storage and add info to photos
        // make sure at most 5 images allowed.

        for (let i = 0; i < 6; i++) {
            const response = await fetch("https://picsum.photos/400/400");
            expect(response.ok).toBeTruthy();

            const buffer = await response.arrayBuffer();

            const uploaded = await upload(user3Client, 'listings', buffer, 
                `${i}`, 'image/jpeg');
            expect(uploaded).toBeTruthy();
            if (!uploaded) throw new Error();

            expect(uploaded.filePath).toBeTruthy();
            expect(uploaded.publicUrl).toBeTruthy();

            const photo = await addListingPhoto(user3Client, listing.listing_id, 
                uploaded.publicUrl, uploaded.filePath);
            
            if (i < 5) {
                expect(photo).toBeTruthy()
                expect(photo.listing_id).toBe(listing.listing_id);
            }
            else expect(photo).toBeFalsy();
        }

        // check that other users can see photos in the right order
        const photos = await getPhotosByListingID(user1Client, listing.listing_id);
        expect(photos.length).toBe(5);

        for (let i = 0; i < 5; i++) {
            const path = photos[i].photo_path;
            const fileOrder = parseInt(path[path.length - 1]);
            expect(fileOrder).toBe(i);
        }

        const toDelete = 2; 
        const url = photos[toDelete].photo_url;
        const path = photos[toDelete].photo_path;

        // function to check if file exists
        const checkExists = async () => {
            const {data, error} = await serviceClient.storage.from('uploads').list('listings');
            expect(error).toBeNull();
            const fileName = path.split('/').pop();
            return data?.some(file => file.name === fileName);
        }

        // check file exists and url works before deletion
        expect(await checkExists()).toBeTruthy();
        const response = await fetch(url);
        expect(response.ok).toBeTruthy();

        // check only owner can delete 
        const id = photos[toDelete].photo_id;        

        let success = await deletePhotoById(user1Client, id);
        expect(success).toBeFalsy();
        expect(await checkExists()).toBeTruthy();

        success = await deletePhotoById(user3Client, id);
        expect(success).toBeTruthy();
        expect(await checkExists()).toBeFalsy();

        // check display_order updated properly
        const newPhotos = await getPhotosByListingID(user1Client, listing.listing_id);
        expect(newPhotos.length).toBe(4);

        for (let i = 0; i < 4; i++) {
            const displayOrder = newPhotos[i].display_order;
            expect(displayOrder).toBe(i);
        }

    },  10000);

    afterAll(async () => {
        const clients = [user1Client, user2Client, user3Client];
        for (const client of clients) await client.auth.signOut();
    }, 10000);
});