create extension if not exists pg_trgm;

create index if not exists listings_name_trgm_idx
on listings using gin (product_name gin_trgm_ops);

create index if not exists listings_desc_trgm_idx
on listings using gin (product_desc gin_trgm_ops);