import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest, ServerWebSocket } from "bun";
import { createOrGetChat, getChatsByUserId, getChatByID } from "../database/chats";
import { createMessage, getMessagesByChatId, getMessageById } from "../database/messages";
import { createAttachment } from "../database/attachments";
import { upload } from "../database/storage";

type WsData = {
    chatId: number;
    userId: string;
    supabase: SupabaseClient;
};

// Tracks connected WebSocket clients per chat room for broadcasting
export const chatRooms = new Map<number, Set<ServerWebSocket<WsData>>>();

export const wsHandlers = {
    open(ws: ServerWebSocket<WsData>) {
        const { chatId } = ws.data;
        if (!chatRooms.has(chatId)) chatRooms.set(chatId, new Set());
        chatRooms.get(chatId)!.add(ws);
    },
    async message(ws: ServerWebSocket<WsData>, msg: string | Buffer) {
        const { chatId, userId, supabase } = ws.data;
        let text: string;
        try {
            const parsed = JSON.parse(typeof msg === "string" ? msg : msg.toString());
            text = parsed.message;
        } catch {
            ws.send(JSON.stringify({ error: "Invalid message format" }));
            return;
        }
        if (!text?.trim()) return;

        const saved = await createMessage(supabase, { message: text, sender_id: userId, chat_id: chatId });
        if (!saved) {
            ws.send(JSON.stringify({ error: "Failed to save message" }));
            return;
        }

        // Fetch full message with attachments before broadcasting
        const full = await getMessageById(supabase, saved.message_id) ?? saved;

        // Broadcast to all clients in the room (including sender)
        const room = chatRooms.get(chatId);
        if (room) {
            const payload = JSON.stringify(full);
            for (const client of room) {
                client.send(payload);
            }
        }
    },
    close(ws: ServerWebSocket<WsData>) {
        const { chatId } = ws.data;
        const room = chatRooms.get(chatId);
        if (room) {
            room.delete(ws);
            if (room.size === 0) chatRooms.delete(chatId);
        }
    },
};

export const chatRoutes = {
    // Create a new chat. The authenticated user is the customer; seller_id comes from the body.
    "/api/chats": {
        POST: async (req: BunRequest, supabase: SupabaseClient) => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const body = await req.json() as { seller_id: string };
            if (!body.seller_id) {
                return Response.json({ error: "Missing seller_id" }, { status: 400 });
            }
            if (body.seller_id === user.id) {
                return Response.json({ error: "Cannot create a chat with yourself" }, { status: 400 });
            }
            const chat = await createOrGetChat(supabase, user.id, body.seller_id);
            if (!chat) {
                return Response.json({ error: "Failed to create chat" }, { status: 500 });
            }
            return Response.json(chat, { status: 201 });
        },
        // Get all chats for the authenticated user
        GET: async (req: BunRequest, supabase: SupabaseClient) => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const chats = await getChatsByUserId(supabase, user.id);
            return Response.json(chats, { status: 200 });
        },
    },
    // Get message history for a chat (ordered oldest-first, includes attachments)
    "/api/chats/:id/messages": {
        GET: async (req: BunRequest<"/api/chats/:id/messages">, supabase: SupabaseClient) => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                return Response.json({ error: "Invalid chat ID" }, { status: 400 });
            }
            const messages = await getMessagesByChatId(supabase, chatId);
            return Response.json(messages, { status: 200 });
        },
        // Send a text message via HTTP (alternative to WebSocket)
        POST: async (req: BunRequest<"/api/chats/:id/messages">, supabase: SupabaseClient) => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                return Response.json({ error: "Invalid chat ID" }, { status: 400 });
            }
            const body = await req.json() as { message: string };
            if (!body.message?.trim()) {
                return Response.json({ error: "Missing message" }, { status: 400 });
            }
            const saved = await createMessage(supabase, { message: body.message, sender_id: user.id, chat_id: chatId });
            if (!saved) {
                return Response.json({ error: "Failed to send message" }, { status: 500 });
            }
            const full = await getMessageById(supabase, saved.message_id) ?? saved;

            // Broadcast to any connected WebSocket clients in this room
            const room = chatRooms.get(chatId);
            if (room) {
                const payload = JSON.stringify(full);
                for (const client of room) client.send(payload);
            }

            return Response.json(full, { status: 201 });
        },
    },
    // Upload an image to a chat — creates a message + attachment record
    "/api/chats/:id/attachments": {
        POST: async (req: BunRequest<"/api/chats/:id/attachments">, supabase: SupabaseClient) => {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const chatId = parseInt(req.params.id);
            if (isNaN(chatId)) {
                return Response.json({ error: "Invalid chat ID" }, { status: 400 });
            }

            // Verify the user is a participant in this chat
            const chat = await getChatByID(supabase, chatId);
            if (!chat) {
                return Response.json({ error: "Chat not found" }, { status: 404 });
            }
            if (chat.seller_id !== user.id && chat.customer_id !== user.id) {
                return Response.json({ error: "Forbidden" }, { status: 403 });
            }

            // Parse multipart form data
            let formData: Awaited<ReturnType<typeof req.formData>>;
            try {
                formData = await req.formData();
            } catch {
                return Response.json({ error: "Expected multipart/form-data" }, { status: 400 });
            }

            const file = formData.get("file") as File | null;
            if (!file) {
                return Response.json({ error: "Missing file field" }, { status: 400 });
            }

            // Validate content type (must match what storage.upload() accepts)
            const allowedTypes = ["image/jpeg", "image/png"] as const;
            type AllowedType = typeof allowedTypes[number];
            if (!allowedTypes.includes(file.type as AllowedType)) {
                return Response.json({ error: "Only JPEG and PNG images are supported" }, { status: 415 });
            }

            const caption = (formData.get("caption") as string | null)?.trim() ?? "";

            // Upload to Supabase storage
            const fileBuffer = await file.arrayBuffer();
            const stored = await upload(supabase, "attachments", fileBuffer, file.name, file.type as AllowedType);
            if (!stored) {
                return Response.json({ error: "Failed to upload image" }, { status: 500 });
            }

            // Create the message row (caption or empty string since message is NOT NULL)
            const message = await createMessage(supabase, {
                message: caption,
                sender_id: user.id,
                chat_id: chatId,
            });
            if (!message) {
                return Response.json({ error: "Failed to create message" }, { status: 500 });
            }

            // Create the attachment record
            const attachment = await createAttachment(supabase, message.message_id, stored.publicUrl, stored.filePath);
            if (!attachment) {
                return Response.json({ error: "Failed to save attachment" }, { status: 500 });
            }

            // Fetch full message with attachment for response + broadcast
            const full = await getMessageById(supabase, message.message_id) ?? message;

            // Broadcast to any connected WebSocket clients in this room
            const room = chatRooms.get(chatId);
            if (room) {
                const payload = JSON.stringify(full);
                for (const client of room) client.send(payload);
            }

            return Response.json(full, { status: 201 });
        },
    },
};
