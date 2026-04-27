import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { signUpUser } from '../../database/auth';
import { updateUserProfile } from '../../database/users';
import { createListing } from '../../database/listings';
import { addListingPhoto } from '../../database/photos';
import { upload } from '../../database/storage';
import { createOrGetChat } from '../../database/chats';
import { createMessage } from '../../database/messages';

const LISTING_TEMPLATES = [
    { name: 'CS 250 Textbook', desc: 'Slightly used, no highlighting. Essential for Discrete Math.', price: 45, cond: 'good' },
    { name: 'IKEA Desk Lamp', desc: 'Bright LED lamp, perfect for Southwest dorm desks.', price: 10, cond: 'fair' },
    { name: 'AirPods Pro Gen 2', desc: 'Noise canceling works great. Lost the original box.', price: 120, cond: 'good' },
    { name: 'Micro-fridge', desc: 'UMass approved size. Pickup at Orchard Hill.', price: 80, cond: 'poor' },
    { name: 'Calculus 3 Stewart Edition', desc: 'Hardcover. Like new condition.', price: 60, cond: 'new' },
    { name: 'Electric Kettle', desc: 'Heats up fast. Moving out sale!', price: 15, cond: 'good' },
    { name: 'North Face Backpack', desc: 'Small tear on the bottom but still functional.', price: 30, cond: 'fair' },
];

const CHAT_SCRIPTS = [
    ["Hi! Is this still available?", "Yes it is! Are you interested?", "Yeah, could you do $5 off?", "Sure, meet at Blue Wall tomorrow?"],
    ["Interested in the item. Can we meet at Berkshire DC?", "I'm in Northeast, could we meet at the Library?", "Library works for me. What time?", "How about 2 PM?"],
    ["Is the price negotiable?", "I'd like to stay firm on the price for now.", "No worries, I'll take it for the listed price.", "Awesome, let me know when you want to pick it up."],
];

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// Notice we now pass url and key to spawn individual clients
export async function populateMockData(url: string, key: string, userCount: number = 10) {
    console.log(`--- Initializing Mock Data Generation for ${userCount} Users ---`);
    
    // Store both the profile data AND the authenticated client for each user
    const activeUsers: { profile: any, client: SupabaseClient }[] = [];
    
    const firstNames = ['Aditya', 'Sarah', 'Kevin', 'Chloe', 'Marcus', 'Elena', 'Ryan', 'Maya', 'Justin', 'Zoe'];
    const lastNames = ['S.', 'M.', 'L.', 'K.', 'W.', 'P.', 'B.', 'T.', 'R.', 'H.'];

    // 1. Create Users & Authenticated Clients
    for (let i = 0; i < userCount; i++) {
        const userClient = createClient(url, key); // Spawn a fresh client

        const name = `${firstNames[i]} ${lastNames[i]}`;
        const email = `${firstNames[i]?.toLowerCase()}.${Date.now()}@umass.edu`;
        const password = 'Password123!';

        // Signing up authenticates userClient as this specific user
        const auth = await signUpUser(userClient, email, password, name);
        if (!auth.success || !auth.user) continue;

        // Use updateUserProfile to bypass the PK constraint from Auth triggers
        const profile = await updateUserProfile(userClient, auth.user.id, {
            name,
            address: `${Math.floor(random(1, 500))} North Pleasant St, Amherst, MA`,
            profile_picture_url: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
            profile_picture_path: null,
            latitude: random(42.365, 42.395),
            longitude: random(-72.535, -72.515),
        });
        
        if (profile) activeUsers.push({ profile, client: userClient });
    }

    console.log(`Created ${activeUsers.length} authenticated user profiles.`);

    // 2. Create Listings & Photos (Using the Seller's Client)
    const allListings: { listing: any, ownerClient: SupabaseClient }[] = [];
    
    for (const u of activeUsers) {
        const numListings = Math.floor(random(1, 3));
        
        for (let j = 0; j < numListings; j++) {
            const template = pick(LISTING_TEMPLATES);
            
            // Execute as the listing owner
            const listing = await createListing(u.client, {
                user_id: u.profile.user_id,
                product_name: template.name,
                product_desc: template.desc,
                item_condition: template.cond,
                price: template.price,
            });

            if (listing) {
                allListings.push({ listing, ownerClient: u.client });
                
                const photoRes = await fetch("https://picsum.photos/400/400");
                const buffer = await photoRes.arrayBuffer();
                
                // Upload and attach as the owner
                const uploadData = await upload(u.client, 'listings', buffer, `item-${listing.listing_id}.jpg`, 'image/jpeg');
                if (uploadData) {
                    await addListingPhoto(u.client, listing.listing_id, uploadData.publicUrl, uploadData.filePath);
                }
            }
        }
    }

    console.log(`Created ${allListings.length} listings with photos.`);

    // 3. Create Chats and Messages (Swapping Clients Contextually)
    for (let k = 0; k < 5; k++) {
        const target = pick(allListings);
        const seller = activeUsers.find(u => u.profile.user_id === target.listing.user_id)!;
        const buyer = pick(activeUsers.filter(u => u.profile.user_id !== seller.profile.user_id));

        // Buyer initiates the chat
        const chat = await createOrGetChat(buyer.client, seller.profile.user_id, buyer.profile.user_id);
        if (!chat) continue;

        const script = pick(CHAT_SCRIPTS);
        
        for (let m = 0; m < script.length; m++) {
            // Even indexes = Buyer, Odd indexes = Seller
            const isBuyerMsg = m % 2 === 0;
            const activeClient = isBuyerMsg ? buyer.client : seller.client;
            const activeSenderId = isBuyerMsg ? buyer.profile.user_id : seller.profile.user_id;

            // Execute insert strictly as the user sending the message
            await createMessage(activeClient, {
                message: script[m]!,
                sender_id: activeSenderId,
                chat_id: chat.chat_id
            });
        }
    }

    console.log("Mock data generation complete.");
    return true;
}