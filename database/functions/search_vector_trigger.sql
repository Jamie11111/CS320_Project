-- trigger function and associated trigger to automatically
-- initialize the search_vector for a listing before adding to table.

create or replace function search_vector_update()
returns trigger as $$
begin
    NEW.search_vector := to_tsvector(
        'english',
        coalesce(NEW.product_name, '') || ' ' || coalesce(NEW.product_desc, '')
    );
    return NEW;
end;
$$ language plpgsql;

create trigger search_vector_trigger
before insert or update on listings
for each row
execute function search_vector_update();