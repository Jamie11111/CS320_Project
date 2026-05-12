-- Some AI assistance used
-- pages 12-13 https://docs.google.com/document/d/1TK0iLnH-EV3rvX1j_EgH3SucgBUCP1FOlxMgwF1bwo4/edit?usp=sharing

create extension if not exists pg_trgm;

create index if not exists listings_name_trgm_idx
on listings using gin (product_name gin_trgm_ops);

create index if not exists listings_desc_trgm_idx
on listings using gin (product_desc gin_trgm_ops);