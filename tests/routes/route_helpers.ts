import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";
import { signUpUser } from "../../database/auth";
import { updateUserProfile } from "../../database/users";
import { supabase } from "./setup";
import { createListing } from "../../database/listings";
import { addListingPhoto } from "../../database/photos";
import { upload } from "../../database/storage";


/**
 * Shuffles an array in-place using the Fisher-Yates algorithm.
 * @param array The array to be shuffled.
 */
function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap elements using array destructuring
    [array[i], array[j]] = [array[j]!, array[i]!];
  }
  return array;
}

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

type CategoryOptions = {
    priceRange?: [number, number];
    names?: string[];
    photos?: string[];
    descriptions?: string[];
}

export const basicCategoryMapping: {[key: string]: CategoryOptions} = {
    "phone": {
        priceRange: [10, 1000],
        names: ["iPhone 10", "iPhone 15", "Samsung Galaxy S20", "Google Pixel 5"],
        photos: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", 
            "https://media.wired.com/photos/692519679e17ba7d83580e45/master/w_1600%2Cc_limit/Samsung%2520Galaxy%2520S25%2520FE%2520SOURCE%2520Julian%2520Chokkattu11.png",
            "https://cdn.thewirecutter.com/wp-content/media/2026/02/BEST-BUDGET-ANDROID-PHONES-2048px-09461.jpg",
            "https://i.pcmag.com/imagery/roundups/07ml3nh3QrzTLZ9UycfQQB2-68.fit_lim.size_1050x.jpg"],
        descriptions: ["Used phone in good condition", "Minor scratches on screen", "Barely used phone", "Phone with cracked screen but works perfectly"]
    },
    "laptop": {
        priceRange: [50, 2000],
        names: ["MacBook Pro 2019", "Dell XPS 13", "Lenovo ThinkPad X1 Carbon", "HP Spectre x360"],
        photos: ["https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/13-laptop-platinum-right-render-fy25:VP4-1260x795?fmt=png-alpha",
            "https://cdn.mos.cms.futurecdn.net/FUi2wwNdyFSwShZZ7LaqWf.jpg",
            "https://png.pngtree.com/png-vector/20250522/ourmid/pngtree-modern-laptop-computer-with-screen-open-technology-digital-device-png-image_16345445.png",
            "https://img.freepik.com/free-photo/laptop-with-sun-background_1232-429.jpg?semt=ais_hybrid&w=740&q=80",
            "https://png.pngtree.com/png-vector/20250304/ourmid/pngtree-sleek-modern-laptop-with-high-resolution-display-png-image_15711292.png"],
        descriptions: ["Used laptop in good condition", "Minor scratches on body", "Barely used laptop", "Laptop with battery issues but works when plugged in"]
    },
    "couch": {
        priceRange: [20, 1500],
        names: ["Ikea Sofa", "Leather Couch", "Sectional Sofa", "Recliner Couch"],
        photos: ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQb0DPb_CRGFf104f384IFIQQpJp33Je6JhPQ&s",
            "https://images.unsplash.com/photo-1512212621149-107ffe572d2f?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y291Y2h8ZW58MHx8MHx8fDA%3D",
            "https://t3.ftcdn.net/jpg/17/98/74/38/360_F_1798743891_xwdQkSql0wUuTKW9j6DLnWizGEnsc5Fq.jpg",
            "https://i5.walmartimages.com/seo/Aukfa-78-Sofa-Couch-3-Seater-Living-Room-Sofa-Set-Boucle-Fabric-Wine-Red_c6ce122a-e5f1-4c53-b786-5dbb47f1c0b2.3f44f743ada91ae4e579a4250d96a0aa.jpeg"],
        descriptions: ["Used couch in good condition", "Minor stains on fabric", "Barely used couch", "Couch with a broken leg but still functional"]
    },
    "table": {
        priceRange: [10, 1000],
        names: ["Dining Table", "Coffee Table", "Bedside Table", "Office Desk"],
        photos: [
            "https://www.simpli-home.com/cdn/shop/files/AXCDNT-003-OAK_Silo_Detail_1.jpg?v=1765468260&width=2560",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCAW49-8bxtn232thtrvvLz_PMHSWgP6PKEw&s",
            "https://www.ikea.com/us/en/images/products/lagkapten-adils-desk-white__0977229_pe813472_s5.jpg?f=s",
            "https://www.ikea.com/us/en/images/products/sandsberg-table-black__1540633_pe1017814_s5.jpg?f=s",
            "https://www.ikea.com/ext/ingkadam/m/79bf0648126e4e79/original/PH205041.jpg",
            "https://www.ikea.com/ext/ingkadam/m/603c4bb9bff341cd/original/PE996936.jpg"
        ],
        descriptions: ["Used table in good condition", "Minor scratches on surface", "Barely used table", "Table with a chipped corner but still sturdy"]
    },
    "book": {
        priceRange: [5, 100],
        names: ["The Great Gatsby", "To Kill a Mockingbird", "1984 by George Orwell", "The Catcher in the Rye", "A Mathematical Foundation for Computer Science", "Introduction to Algorithms", "Computer Networking: A Top-Down Approach"],
        photos: ["https://images.unsplash.com/photo-1541963463532-d68292c34b19?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D",
            "https://m.media-amazon.com/images/I/81ewUnANZPL._AC_UF350,350_QL50_.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3nt7e_CsjoHIEee__QZ2eqmIS5rTi0sPY_Q&s",
            "https://m.media-amazon.com/images/I/81T4dS6IkaL._AC_UF1000,1000_QL80_.jpg"
        ],
        descriptions: ["Used book in good condition", "Highlighting on some pages", "Barely used book", "Book with torn cover but all pages intact"]
    }
};

export function generateListing(categoryMapping: {[key: string]: CategoryOptions}, category: string, verbose: boolean = false) {
    const vlog = verbose ? console.log : (..._args: any[]) => {};
    const verr = verbose ? console.error : (..._args: any[]) => {};

    const options = categoryMapping[category];

    if (!options) {
        verr(`Category ${category} not found in mapping`);
        return null;
    }

    const name = options.names ? options.names[Math.floor(Math.random() * options.names.length)] : `Sample ${category}`;
    const description = options.descriptions ? options.descriptions[Math.floor(Math.random() * options.descriptions.length)] : `This is a ${category} in good condition.`;
    const price = options.priceRange ? Math.floor(Math.random() * (options.priceRange[1] - options.priceRange[0] + 1)) + options.priceRange[0] : 100;
    let photoURLs: string[] | null = options.photos ? [] : null;
    if (options.photos) {
        const numPhotos = Math.floor(Math.random() * 5) + 1;
        photoURLs = [];
        for (let i = 0; i < numPhotos; i++) {
            photoURLs.push(options.photos[Math.floor(Math.random() * options.photos.length)]!);
        }
    }

    const listing = {
        product_name: name,
        description: description,
        price: price,
        photo_urls: photoURLs
    };

    return listing;
}

export async function generateListings(supabaseConn: {supabaseURL: string, supabaseKey: string}, 
    userSessions: { user: User, profile: {[ key: string ]: any}, session: Session }[], 
    categoryCounts: number[] | number, 
    categoryMappings: {[key: string]: CategoryOptions}, 
    verbose: boolean = false) {

    if (typeof categoryCounts === 'number') {
        categoryCounts = new Array(Object.keys(categoryMappings).length).fill(categoryCounts);
    }
    if (categoryCounts.length !== Object.keys(categoryMappings).length) {
        throw new Error("Mismatch between category counts and mappings");
    }
    const vlog = verbose ? console.log : (..._args: any[]) => {};
    const verr = verbose ? console.error : (..._args: any[]) => {};

    const clients = userSessions.map(sessionInfo => {
        const supabase = createClient(supabaseConn.supabaseURL, supabaseConn.supabaseKey)
        supabase.auth.setSession(sessionInfo.session);
        return {supabase: supabase, user: sessionInfo.user};
    });

    const categories = Object.keys(categoryMappings);
    let generatedListings: {[key: string]: any}[] = [];

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i]!;
        const count = categoryCounts[i]!;
        for (let j = 0; j < count; j++) {
            const {supabase, user} = clients[Math.floor(Math.random() * clients.length)]!;

            const generated = generateListing(categoryMappings, category, verbose);
            if(!generated) {
                verr(`Failed to generate listing for category ${category}`);
                continue;
            }
            const listing = {
                user_id: user.id,
                product_name: generated.product_name!,
                product_desc: generated.description!,
                item_condition: ["new", "good", "fair", "poor"][Math.floor(Math.random() * 4)]!,
                price: generated.price,
            };
            
            const res = await createListing(supabase, listing);

            if(!res) {
                verr(`Failed to create listing for category ${category}`);
                continue;
            }
            vlog(`Created listing: ${listing.product_name} for user ${user.id}`);


            if (generated.photo_urls) {
                let uploadResults = []
                for(const url of generated.photo_urls) {
                    uploadResults.push(addListingPhoto(supabase, res.listing_id, url, 'external url'));
                }
                const photoRes = await Promise.all(uploadResults);
                if (!photoRes) {
                    verr(`Failed to add photo for listing ${res.listing_id}`);
                } else {
                    vlog(`Added photo for listing ${res.listing_id}`);
                }
                generatedListings.push({
                ...res,
                photos: photoRes
            });
            } else {
                generatedListings.push(res);
            }
        }
    }
    
    return shuffle(generatedListings);
}