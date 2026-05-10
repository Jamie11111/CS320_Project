import {SupabaseClient} from '@supabase/supabase-js'
import { deleteFromStorage } from './storage'

// add attachment info to attachments table
export async function addAttachment(supabase: SupabaseClient, messageID: number, aURL: string, aPath: string) {
        const {data, error} = await supabase
            .from('attachments')
            .insert({
                message_id: messageID,
                attachment_url: aURL,
                attachment_path: aPath,
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding attachment info', error.message);
            return null;
        }

        return data;
}

// get attachments associated with a message.
export async function getAttachmentByMessageID(supabase: SupabaseClient, messageID: number) {
    const {data, error} = await supabase
        .from('attachments')
        .select('*')
        .eq('message_id', messageID);
    
    if (error) {
        console.error('Error getting attachment for a message', error.message);
        return [];
    }

    return data;
}

// delete an attachment from storage and general database
export async function deleteAttachmentByID(supabase: SupabaseClient, aID: number) {
    const {data, error} = await supabase
        .from('attachments')
        .select('attachment_path')
        .eq('attachment_id', aID)
        .single();
    
    if (error) {
        console.error('Error finding attachment in storage', error.message);
        return false;
    }

    if (data?.attachment_path) {
        const success = await deleteFromStorage(supabase, data.attachment_path);
        if (!success) 
            return false;
    }
    
    const {error: e} = await supabase
        .from('attachments')
        .delete()
        .eq('attachment_id', aID);
    
    if (e) {
        console.error('Error deleting an attachment', e.message);
        return false;
    }

    return true;
}