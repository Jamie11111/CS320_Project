drop index if exists messages_chat_id_time_idx;
create index on messages(chat_id, sent_at);