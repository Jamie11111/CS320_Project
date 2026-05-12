-- trigger function and associated trigger to automatically
-- initialize the search_vector for a listing before adding to table.

-- Some AI assistance used
-- pages 8-11 https://docs.google.com/document/d/1TK0iLnH-EV3rvX1j_EgH3SucgBUCP1FOlxMgwF1bwo4/edit?usp=sharing

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