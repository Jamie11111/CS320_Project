-- place more weight on name than description
-- default should be around 2.5x more weight

update listings
set search_vector = 
    setweight(to_tsvector('english', coalesce(product_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(product_desc, '')), 'B');

create or replace function search_vector_update()
returns trigger as $$
begin
    NEW.search_vector := 
        setweight(to_tsvector('english', coalesce(NEW.product_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.product_desc, '')), 'B');
    return NEW;
end;
$$ language plpgsql;