alter table photos
add column display_order integer not null default 0
check (display_order between 0 and 4);