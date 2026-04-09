import { SupabaseClient } from '@supabase/supabase-js';

/* Create a new chat between a seller and a customer.
   Returns the chat object or null on error. */
export async function createChat(supabase: SupabaseClient, sellerId: string, customerId: string) {
    const { data, error } = await supabase
        .from('chats')
        .insert({ seller_id: sellerId, customer_id: customerId })
        .select()
        .single();

    if (error) {
        console.error('Error creating chat', error.message);
        return null;
    }
    return data;
}

/* Get all chats that a user is a participant in (as seller or customer). */
export async function getChatsByUser(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`seller_id.eq.${userId},customer_id.eq.${userId}`);

    if (error) {
        console.error('Error fetching chats', error.message);
        return [];
    }
    return data;
}

/* Get a single chat by its ID. */
export async function getChatByID(supabase: SupabaseClient, chatId: number) {
    const { data, error } = await supabase
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

/* Get messages for a chat, ordered oldest to newest. */
export async function getMessages(supabase: SupabaseClient, chatId: number, limit: number = 50) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('time', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching messages', error.message);
        return [];
    }
    return data;
}

/* Save a message to the database and return it. */
export async function saveMessage(supabase: SupabaseClient, chatId: number, senderId: string, message: string) {
    const { data, error } = await supabase
        .from('messages')
        .insert({ chat_id: chatId, sender_id: senderId, message })
        .select()
        .single();

    if (error) {
        console.error('Error saving message', error.message);
        return null;
    }
    return data;
}
