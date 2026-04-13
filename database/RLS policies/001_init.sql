-- using determines if access is allowed
-- with check determines if the specific values are allowed  
-- exists just checks if a subquery returns a table with >= 1 row

-- listings

create policy "anyone can read listings" 
on listings for select using (true);

create policy "users can insert own listings"
on listings for insert to authenticated with check (auth.uid() = user_id);

create policy "users can update own listings"
on listings for update to authenticated 
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can delete own listings"
on listings for delete to authenticated using (auth.uid() = user_id);


-- users 

create policy "anyone can read users info"
on users for select using (true);

create policy "users can insert own info"
on users for insert to authenticated with check (auth.uid() = user_id);

create policy "users can update own info"
on users for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "users can delete own profile"
on users for delete to authenticated using (auth.uid() = user_id);


-- photos

create policy "anyone can see photos"
on photos for select using (true);

create policy "users can insert photos for own listings"
on photos for insert to authenticated
with check (
  exists (
    select 1 
    from listings l
    where photos.listing_id = l.listing_id and l.user_id = auth.uid()
  )
);

create policy "users can delete photos for own listings"
on photos for delete to authenticated
using (
  exists (
    select 1 
    from listings l
    where photos.listing_id = l.listing_id and l.user_id = auth.uid()
  )
);


-- chats

create policy "users can access own chats"
on chats for select to authenticated 
using (auth.uid() = seller_id or auth.uid() = customer_id);

create policy "users must belong to chats they create"
on chats for insert to authenticated 
with check (auth.uid() = seller_id or auth.uid() = customer_id);


-- messages

create policy "users can read messages in own chats"
on messages for select to authenticated
using (
  exists (
    select 1
    from chats c
    where messages.chat_id = c.chat_id
      and (c.seller_id = auth.uid() or c.customer_id = auth.uid())
  )
);

create policy "users can send messages in own chats"
on messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from chats c
    where messages.chat_id = c.chat_id
      and (c.seller_id = auth.uid() or c.customer_id = auth.uid())
  )
);

create policy "users can delete own messages"
on messages for delete to authenticated using (auth.uid() = sender_id);


-- attachments

create policy "users can see attachments in own chats"
on attachments for select to authenticated
using (
  exists (
    select 1
    from messages m join chats c on m.chat_id = c.chat_id
    where attachments.message_id = m.message_id
      and (c.seller_id = auth.uid() or c.customer_id = auth.uid())
  )
);

create policy "users can add attachments to own messages"
on attachments for insert to authenticated
with check (
  exists (
    select 1
    from messages m 
    where attachments.message_id = m.message_id and m.sender_id = auth.uid()
  )
);

create policy "users can delete attachments from own messages"
on attachments for delete to authenticated
using (
  exists (
    select 1
    from messages m 
    where attachments.message_id = m.message_id and m.sender_id = auth.uid()
  )
);

