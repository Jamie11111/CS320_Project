-- search_vector will combine each product's name and description
-- to allow efficient query-based searching later on
-- accounts for null case using coalesce

alter table listings
add column search_vector tsvector;

update listings
set search_vector = to_tsvector(
    'english',
    coalesce(product_name, '') || ' ' || coalesce(product_desc, '')
);

create index search_vector_idx on listings using GIN(search_vector);