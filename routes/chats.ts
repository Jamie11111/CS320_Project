import type { SupabaseClient } from "@supabase/supabase-js";
import type { BunRequest, ServerWebSocket } from "bun";
import { createOrGetChat, getChatsByUserId } from "../database/chats";
import { createMessage, getMessagesByChatId } from "../database/messages";

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

        // Broadcast to all clients in the room (including sender)
        const room = chatRooms.get(chatId);
        if (room) {
            const payload = JSON.stringify(saved);
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
    // Get message history for a chat
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
    },
};
