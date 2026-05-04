-- added offset for pagination, put nulls last, fixed name collision

create or replace function filter_listings(
    viewer_id uuid default null,
    query text default null,
    expanded_query text default null,
    price_limit numeric default null,
    condition text default null,
    sold_filter boolean default null,
    sort_by text default 'date',
    lmt integer default 20,
    offset_count integer default 0,
    lat double precision default null,
    long double precision default null
) returns table (
    listing_id integer,
    user_id uuid,
    product_name text,
    product_desc text,
    item_condition text,
    price numeric,
    date_posted timestamp,
    sold boolean,
    relevance_score real,
    distance double precision
)
language sql
as $$

    select *
    from (
        select

            l.listing_id,
            l.user_id,
            l.product_name,
            l.product_desc,
            l.item_condition,
            l.price,
            l.date_posted,
            l.sold,

            -- compute and select relevance_score. prioritize exact 
            -- matches, then match with synonyms, then match with trigram
            -- trigram matching prioritizes name over description
            (
                case 
                    when query is not null
                    then 1.0 * ts_rank(
                        l.search_vector, 
                        plainto_tsquery('english', query)
                    )
                    else 0
                end
                +
                case 
                    when expanded_query is not null
                    then 0.5 * ts_rank(
                        l.search_vector, 
                        to_tsquery('english', expanded_query)
                    )
                    else 0
                end
                +
                case 
                    when query is not null
                    then 0.2 * greatest(
                        1 * similarity(lower(coalesce(l.product_name, '')), lower(query)),
                        0.5 * similarity(lower(coalesce(l.product_desc, '')), lower(query))
                    )
                    else 0
                end          
            )::real as relevance_score,

            -- compute and select distance
            case 
                when lat is not null and long is not null
                    and u.latitude is not null and u.longitude is not null
                then sqrt(power(lat - u.latitude, 2) + power(long - u.longitude, 2))
                else null
            end as distance
            
            -- needed to make lat and long accessible
            from listings l join users u on l.user_id = u.user_id

            -- apply filters provided
            -- only keep results when either 1. query matches vector. 
            -- 2. query adjusted with synonyms match vector. 3. name / desc 
            -- are deemed "similar" to the query

            where 
                (price_limit is null or l.price <= price_limit)
                and (condition is null or l.item_condition = condition)
                and (sold_filter is null or l.sold = sold_filter)
                and (viewer_id is null or l.user_id != viewer_id)
                and (
                    query is null 
                    or l.search_vector @@ plainto_tsquery('english', query)
                    or (
                        expanded_query is not null
                        and l.search_vector @@ to_tsquery('english', expanded_query)
                    )
                    or lower(coalesce(l.product_name, '')) % lower(query)
                    or lower(coalesce(l.product_desc, '')) % lower(query)
                )
    ) filtered

    -- order as desired, date_posted is always tiebreaker
    order by 
        case when sort_by = 'price' then price end asc nulls last,
        case when sort_by = 'date' then date_posted end desc nulls last,
        case when sort_by = 'relevance' then relevance_score end desc nulls last,
        case when sort_by = 'distance' then distance end asc nulls last,
        date_posted desc

    limit lmt
    offset offset_count;
$$;


