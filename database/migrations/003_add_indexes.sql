-- for listings 
create index on listings(user_id);
create index on listings(date_posted);
create index on listings(price);
create index on listings(sold, date_posted);
create index on listings(sold, price);

-- for photos
create index on photos(listing_id, display_order);

-- for chats
create index on chats(seller_id, customer_id);
create index on chats(customer_id);

-- for messages
create index on messages(chat_id, time);

-- for attachments
create index on attachments(message_id);