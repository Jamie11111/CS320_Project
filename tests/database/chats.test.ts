import {describe, it, expect, beforeAll, afterAll} from 'vitest';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {resetDatabase, generateUsers, fullCleanUp} from './test_helpers';
import {loginUser} from '../../database/auth';
import {createOrGetChat, getChatsByUserId, getChatsByUserId2} from '../../database/chats';
import {createMessage, getMessagesByChatId, deleteMessageById} from '../../database/messages';
import {addAttachment, getAttachmentByMessageID, deleteAttachmentByID} from '../../database/attachments';
import {upload} from '../../database/storage';

// run using bun test tests/database/chats.test.ts

const url: string = process.env.SUPABASE_URL!;
const key: string = process.env.SUPABASE_ANON_KEY!;
const service_key: string = process.env.SUPABASE_KEY!;

describe('chat and messaging tests', () => {
    
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
        serviceClient = createClient(url, service_key);
        const userClients = [user1Client, user2Client, user3Client];

        // Wipe the database using the service key
        const cleared = await fullCleanUp(serviceClient);
        expect(cleared).toBeTruthy(); 

        profiles = await generateUsers(generalClient, 3);
        const password = "testPassword123";
        expect(profiles.length).toBe(3);

        for (let i = 0; i < 3; i++) { 
            const result = await loginUser(userClients[i]!, profiles[i].email, password);
            expect(result.success).toBeTruthy();
        }        
    }, 15000);

    it('chat and message flow works', async() => {
        
        // 1. Check that a chat can be created between user 1 and user 2
        const chat = await createOrGetChat(user1Client, profiles[0].user_id, profiles[1].user_id);
        expect(chat).toBeTruthy();
        expect(chat.chat_id).toBeDefined();

        // 2. Check that getting the chat again doesn't create a duplicate
        const duplicateChat = await createOrGetChat(user2Client, profiles[1].user_id, profiles[0].user_id);
        expect(duplicateChat.chat_id).toBe(chat.chat_id);

        // 3. Verify user's chat list populates correctly
        const user1Chats = await getChatsByUserId(user1Client, profiles[0].user_id);
        expect(user1Chats.length).toBe(1);
        expect(user1Chats[0].chat_id).toBe(chat.chat_id);

        const user3Chats = await getChatsByUserId(user3Client, profiles[2].user_id);
        expect(user3Chats.length).toBe(0);

        // 4. Send messages
        const msg1 = await createMessage(user1Client, {
            message: 'Is this item still available?',
            sender_id: profiles[0].user_id,
            chat_id: chat.chat_id
        });
        expect(msg1).toBeTruthy();
        expect(msg1.message).toBe('Is this item still available?');

        const msg2 = await createMessage(user2Client, {
            message: 'Yes it is!',
            sender_id: profiles[1].user_id,
            chat_id: chat.chat_id
        });
        expect(msg2).toBeTruthy();

        // 5. Retrieve messages and check order (first sent should be first)
        const messages = await getMessagesByChatId(user1Client, chat.chat_id);
        expect(messages.length).toBe(2);
        expect(messages[0].message_id).toBe(msg1.message_id);
        expect(messages[1].message_id).toBe(msg2.message_id);

        // 6. Test RPC chat list retrieval
        const advancedChats = await getChatsByUserId2(user1Client, profiles[0].user_id);
        expect(advancedChats).toBeDefined();

        // 7. Delete a message
        const deleted = await deleteMessageById(user1Client, msg1.message_id);
        expect(deleted).toBeTruthy();
        
        const updatedMessages = await getMessagesByChatId(user1Client, chat.chat_id);
        expect(updatedMessages.length).toBe(1);
        expect(updatedMessages[0].message_id).toBe(msg2.message_id);

    }, 10000);

    it('message attachment upload and deletion works', async () => {
        // Create a new chat and message for attachment testing
        const chat = await createOrGetChat(user3Client, profiles[2].user_id, profiles[0].user_id);
        
        const msg = await createMessage(user3Client, {
            message: 'Here is a photo of the condition',
            sender_id: profiles[2].user_id,
            chat_id: chat.chat_id
        });

        // 1. Upload an image to storage
        const response = await fetch("https://picsum.photos/400/400");
        expect(response.ok).toBeTruthy();
        const buffer = await response.arrayBuffer();

        const uploaded = await upload(user3Client, 'attachments', buffer, 'test_attachment_1', 'image/jpeg');
        expect(uploaded).toBeTruthy();
        if (!uploaded) throw new Error();

        expect(uploaded.filePath).toBeTruthy();
        expect(uploaded.publicUrl).toBeTruthy();

        // 2. Link attachment to the message
        const attachment = await addAttachment(user3Client, msg.message_id, uploaded.publicUrl, uploaded.filePath);
        expect(attachment).toBeTruthy();
        expect(attachment.message_id).toBe(msg.message_id);

        // 3. Retrieve attachments by message ID
        const attachments = await getAttachmentByMessageID(user1Client, msg.message_id);
        expect(attachments.length).toBe(1);
        expect(attachments[0].attachment_id).toBe(attachment.attachment_id);

        // 4. Verify the file exists in the storage bucket
        const checkExists = async () => {
            const {data, error} = await serviceClient.storage.from('uploads').list('attachments');
            expect(error).toBeNull();
            const fileName = attachment.attachment_path.split('/').pop();
            return data?.some(file => file.name === fileName);
        }
        
        expect(await checkExists()).toBeTruthy();

        // 5. Delete the attachment and verify storage cleanup
        const success = await deleteAttachmentByID(user3Client, attachment.attachment_id);
        expect(success).toBeTruthy();

        // Verify it was removed from the database
        const remaining = await getAttachmentByMessageID(user1Client, msg.message_id);
        expect(remaining.length).toBe(0);

        // Verify it was actually removed from the Supabase storage bucket
        expect(await checkExists()).toBeFalsy();

    }, 10000);

    it('enforces RLS policies for chats and messages', async () => {
        const chat = await createOrGetChat(user1Client, profiles[0].user_id, profiles[1].user_id);
        expect(chat).toBeTruthy();

        // Setup a valid message from User 1
        const validMsg = await createMessage(user1Client, {
            message: 'Private message between 1 and 2',
            sender_id: profiles[0].user_id,
            chat_id: chat.chat_id
        });
        expect(validMsg).toBeTruthy();

        // 1. RLS SELECT: User 3 cannot read messages in User 1 & 2's chat
        const unauthorizedMessages = await getMessagesByChatId(user3Client, chat.chat_id);
        expect(unauthorizedMessages.length).toBe(0);

        // 2. RLS INSERT: User 3 cannot send messages to User 1 & 2's chat
        const outsiderMsg = await createMessage(user3Client, {
            message: 'Infiltrator message',
            sender_id: profiles[2].user_id,
            chat_id: chat.chat_id
        });
        expect(outsiderMsg).toBeNull();

        // 3. RLS INSERT: User 1 cannot spoof sender_id to be User 2
        const spoofedMsg = await createMessage(user1Client, {
            message: 'I am totally User 2',
            sender_id: profiles[1].user_id, // Spoofing attempt
            chat_id: chat.chat_id
        });
        expect(spoofedMsg).toBeNull();

        // 4. RLS DELETE: User 2 cannot delete User 1's message
        // User 2 attempts to delete, wrapper returns true if no hard error is thrown,
        // but RLS silently blocks the row deletion. We must verify it still exists.
        await deleteMessageById(user2Client, validMsg.message_id); 
        
        const checkMessages = await getMessagesByChatId(user1Client, chat.chat_id);
        const messageStillExists = checkMessages.some(m => m.message_id === validMsg.message_id);
        expect(messageStillExists).toBeTruthy(); 

        // Cleanup: Let User 1 actually delete their own message
        const properDelete = await deleteMessageById(user1Client, validMsg.message_id);
        expect(properDelete).toBeTruthy();
        
        const verifyEmpty = await getMessagesByChatId(user1Client, chat.chat_id);
        // Instead of checking length === 0, check that our specific message is gone
        const isActuallyDeleted = verifyEmpty.some(m => m.message_id === validMsg.message_id);
        expect(isActuallyDeleted).toBeFalsy();
    }, 10000);

    it('enforces RLS policies for attachments', async () => {
        const chat = await createOrGetChat(user1Client, profiles[0].user_id, profiles[1].user_id);
        
        const msg = await createMessage(user1Client, {
            message: 'Message with restricted attachment',
            sender_id: profiles[0].user_id,
            chat_id: chat.chat_id
        });

        // 1. RLS INSERT: User 2 cannot add an attachment to User 1's message
        const badAttachment = await addAttachment(
            user2Client, 
            msg.message_id, 
            'https://fake-url.com/img.jpg', 
            'attachments/fake.jpg'
        );
        expect(badAttachment).toBeNull();

        // 2. RLS INSERT: User 1 correctly adds attachment to their own message
        const goodAttachment = await addAttachment(
            user1Client,
            msg.message_id,
            'https://fake-url.com/img.jpg', 
            'attachments/fake.jpg'
        );
        expect(goodAttachment).toBeTruthy();

        // 3. RLS SELECT: User 3 cannot see the attachment
        const unauthorizedAttachments = await getAttachmentByMessageID(user3Client, msg.message_id);
        expect(unauthorizedAttachments.length).toBe(0);

        // 4. RLS DELETE: User 2 cannot delete User 1's attachment
        // This expects the wrapper to ultimately fail or the DB row to remain.
        await deleteAttachmentByID(user2Client, goodAttachment.attachment_id);
        
        const verifyAttachments = await getAttachmentByMessageID(user1Client, msg.message_id);
        const attachmentStillExists = verifyAttachments.some(a => a.attachment_id === goodAttachment.attachment_id);
        expect(attachmentStillExists).toBeTruthy();
    }, 10000);

    afterAll(async () => {
        const clients = [user1Client, user2Client, user3Client];
        for (const client of clients) await client.auth.signOut();
    }, 10000);
});