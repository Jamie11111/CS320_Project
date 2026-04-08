import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures a chat exists between two users. 
 * If a chat thread already exists, it returns that record. 
 * Otherwise, it creates a new one.
 */
export async function createOrGetChat(supabase: SupabaseClient, sellerID: string, customerID: string) {
    // 1. Check if a chat already exists between these two users
    const { data: existingChat, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('seller_id', sellerID)
        .eq('customer_id', customerID)
        .maybeSingle();

    if (fetchError) {
        console.error('Error checking for existing chat', fetchError.message);
        return null;
    }

    if (existingChat) {
        return existingChat;
    }

    // 2. If not, create a new one
    const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
            seller_id: sellerID,
            customer_id: customerID
        })
        .select()
        .single();

    if (createError) {
        console.error('Error creating new chat', createError.message);
        return null;
    }

    return newChat;
}

/**
 * Sends a message and optionally handles attachments.
 * NOTE: This uses the 'rpc' method to call the 'send_message_v1' PostgreSQL function 
 * we discussed earlier to ensure the message and attachments are saved together.
 */
export async function sendMessage(
    supabase: SupabaseClient, 
    chatID: number, 
    senderID: string, 
    messageText: string, 
    attachments: { url: string, path: string }[] = []
) {
    const { data, error } = await supabase.rpc('send_message_v1', {
        p_chat_id: chatID,
        p_sender_id: senderID,
        p_message: messageText,
        p_attachments: attachments // Passes as a JSONB array
    });

    if (error) {
        console.error('Error sending message via RPC', error.message);
        return null;
    }

    return data; // Returns the message_id
}

/**
 * Fetches all messages for a specific chat, including nested attachments.
 */
export async function getMessagesByChatID(supabase: SupabaseClient, chatID: number) {
    const { data, error } = await supabase
        .from('messages')
        .select(`
            *,
            attachments (*)
        `)
        .eq('chat_id', chatID)
        .order('time', { ascending: true });

    if (error) {
        console.error('Error fetching chat messages', error.message);
        return [];
    }

    return data;
}

/**
 * Gets all active chats for a specific user (either as seller or customer).
 * Useful for the "Inbox" list view.
 */
export async function getUserChats(supabase: SupabaseClient, userID: string) {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .or(`seller_id.eq.${userID},customer_id.eq.${userID}`);

    if (error) {
        console.error('Error fetching user chats', error.message);
        return [];
    }

    return data;
}