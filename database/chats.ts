import {SupabaseClient} from '@supabase/supabase-js'

/* Given two uuid's in any order, will either find chat between two users
or create a new chat. Will return the 2 uuid's and chat_id. */
export async function createOrGetChat(supabase: SupabaseClient, user1: string, user2: string) {

    // Since seller vs customer doesn't matter anymore, just make the lower uuid the seller
    // Ensures (user1, user2) = (user2, user1).
    const [seller, customer] = (user1 < user2) ? [user1, user2] : [user2, user1];

    const {data, error} = await supabase
        .from('chats')
        .select('*')
        .eq('seller_id', seller)
        .eq('customer_id', customer)
        .maybeSingle();

    if (error) {
        console.error('Error while searching for chat', error.message);
        return null;
    }

    if (data)
        return data;

    const {data: d, error: e} = await supabase
        .from('chats')
        .insert({seller_id: seller, customer_id: customer})
        .select()
        .single();

    if (e) {
        console.error('Error creating chat', e.message);
        return null;
    }

    return d;
}

// Get a list of all chats a user is involved in
export async function getChatsByUserId(supabase: SupabaseClient, userID: string) {
    const {data, error} = await supabase
        .from('chats')
        .select('*')
        .or(`seller_id.eq.${userID},customer_id.eq.${userID}`);

    if (error) {
        console.error('Error getting chats', error.message);
        return [];
    }

    return data;
}

// Get a single chat by its ID (used by WebSocket upgrade to verify membership)
export async function getChatByID(supabase: SupabaseClient, chatId: number) {
    const {data, error} = await supabase
        .from('chats')
        .select('*')
        .eq('chat_id', chatId)
        .single();

    if (error) {
        console.error('Error fetching chat', error.message);
        return null;
    }

    return data;
}
