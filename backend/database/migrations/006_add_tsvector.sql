-- search_vector will combine each product's name and description
-- to allow efficient query-based searching later on
-- accounts for null case using coalesce

-- Some AI assistance used
-- pages 8-11 https://docs.google.com/document/d/1TK0iLnH-EV3rvX1j_EgH3SucgBUCP1FOlxMgwF1bwo4/edit?usp=sharing

alter table listings
add column search_vector tsvector;

update listings
set search_vector = to_tsvector(
    'english',
    coalesce(product_name, '') || ' ' || coalesce(product_desc, '')
);

create index search_vector_idx on listings using GIN(search_vector);