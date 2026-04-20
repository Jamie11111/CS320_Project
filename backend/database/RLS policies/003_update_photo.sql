-- needed in order to update display_order in photos table

create policy "users can update photos for own listings"
on photos for update to authenticated
using (
  exists (
    select 1
    from listings l
    where photos.listing_id = l.listing_id
      and l.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from listings l
    where photos.listing_id = l.listing_id
      and l.user_id = auth.uid()
  )
);