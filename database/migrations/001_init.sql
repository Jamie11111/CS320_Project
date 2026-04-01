Create table users (
	user_id uuid primary key references auth.users(id) on delete cascade,
	email text not null unique,
	name text not null,
	address text,
    profile_picture_url text,
    profile_picture_path text,
	latitude double precision,
    longitude double precision
);

Create table listings (
	listing_id serial primary key,
	user_id uuid references users(user_id) on delete cascade not null,
	product_name text not null,
    product_desc text,
	item_condition text not null,
	price numeric(10, 2) not null check (price >= 0),
    date_posted timestamp default current_timestamp,
	sold boolean not null default false
);

Create table photos (
	photo_id serial primary key,
	listing_id integer references listings(listing_id) on delete cascade not null,
	photo_url text not null,
    photo_path text not null
);

Create table chats (
	chat_id serial primary key,
	seller_id uuid references users(user_id) on delete cascade not null,
	customer_id uuid references users(user_id) on delete cascade not null,
    CHECK(seller_id <> customer_id),
	UNIQUE(seller_id, customer_id)
);

Create table messages (
	message_id serial primary key,
	message text not null,
	time timestamp default current_timestamp,
	chat_id integer references chats(chat_id) on delete cascade not null,
	sender_id uuid references users(user_id) on delete set null
);

Create table attachments (
	attachment_id serial primary key,
	message_id integer references messages(message_id) on delete cascade not null,
	attachment_url text not null,
    attachment_path text not null
);
