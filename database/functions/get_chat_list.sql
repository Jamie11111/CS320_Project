-- returns a table of chat info for a given user along with the 
-- last message in the chat (or null if chat has no messages). 
-- chats are ordered by timestamp of last message.

create or replace function get_chat_list(uid uuid)
returns table (
    chat_id integer,
    seller_id uuid,
    customer_id uuid,
    message text,
    sent_at timestamp
)
as $$
select c.chat_id, c.seller_id, c.customer_id, m.message, m.sent_at
from chats c left join messages m on c.chat_id = m.chat_id
where (c.seller_id = uid or c.customer_id = uid)
and (
    m.sent_at is null or m.sent_at = (
        select max(sent_at)
        from messages m2
        where m2.chat_id = c.chat_id
    )
)
order by m.sent_at desc nulls last;
$$ language sql;