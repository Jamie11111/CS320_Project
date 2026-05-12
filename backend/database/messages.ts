import {SupabaseClient} from '@supabase/supabase-js'
import {getAttachmentByMessageID} from './attachments';

// Create a message by passing the message as well as sender and chat
export async function createMessage(supabase: SupabaseClient, 
    messageInfo: {
        message: string;
        sender_id: string;
        chat_id: number;
    }
) {
    const {data, error} = await supabase
        .from('messages')
        .insert({
            message: messageInfo.message,
            sender_id: messageInfo.sender_id,
            chat_id: messageInfo.chat_id,
        })
        .select()
        .single()
    
    if (error) {
        console.error('Error creating message', error.message);
        return null;
    }

    return data;
}

// Returns array of messages from a chat, with first message first
// Adds associated attachments to each message (with property attachments) 
export async function getMessagesByChatId(supabase: SupabaseClient, chatID: number) {
    const {data, error} = await supabase
        .from('messages')
        .select('*, attachments(*)')
        .eq('chat_id', chatID)
        .order('sent_at', {ascending: true});

    if (error) {
        console.error('Error getting messages', error.message);
        return [];
    }

    return data;
}

// Fetch a single message with its attachments (used after insert to get full object for broadcast)
export async function getMessageById(supabase: SupabaseClient, messageId: number) {
    const {data, error} = await supabase
        .from('messages')
        .select('*, attachments(*)')
        .eq('message_id', messageId)
        .single();

    if (error) {
        console.error('Error getting message', error.message);
        return null;
    }

    return data;
}

// Delete a message given its id 
export async function deleteMessageById(supabase: SupabaseClient, message_id: number) {
    const {error} = await supabase
        .from('messages')
        .delete()
        .eq('message_id', message_id);
    
    if (error) {
        console.error('Error deleting message', error.message);
        return false;
    }

    return true;
}