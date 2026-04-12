import { SupabaseClient } from '@supabase/supabase-js'

// Save an attachment record linked to a message
export async function createAttachment(
    supabase: SupabaseClient,
    messageId: number,
    attachmentUrl: string,
    attachmentPath: string
) {
    const { data, error } = await supabase
        .from('attachments')
        .insert({
            message_id: messageId,
            attachment_url: attachmentUrl,
            attachment_path: attachmentPath,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating attachment', error.message);
        return null;
    }

    return data;
}

// Get all attachments for a message
export async function getAttachmentsByMessageId(supabase: SupabaseClient, messageId: number) {
    const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('message_id', messageId);

    if (error) {
        console.error('Error getting attachments', error.message);
        return [];
    }

    return data;
}
