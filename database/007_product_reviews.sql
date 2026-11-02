-- Verified-purchase product reviews with owner moderation.
-- No direct Data API access: public reads and customer submissions go through server routes.
create table if not exists public.product_reviews (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 order_id uuid not null references public.orders(id) on delete restrict,
 rating smallint not null check(rating between 1 and 5),
 title text not null check(char_length(btrim(title)) between 3 and 100),
 body text not null check(char_length(btrim(body)) between 10 and 1600),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 verified_purchase boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(product_id,user_id)
);
create index if not exists idx_product_reviews_public
 on public.product_reviews(product_id,status,created_at desc);
create index if not exists idx_product_reviews_customer
 on public.product_reviews(user_id,product_id);

alter table public.product_reviews enable row level security;
revoke all on public.product_reviews from anon,authenticated;

-- Even trusted server writes must prove a delivered order containing this product.
create or replace function public.nexora_verify_product_review_purchase()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(
  select 1
  from public.orders o
  join public.order_items oi on oi.order_id=o.id
  join public.variants v on v.id=oi.variant_id
  join auth.users u on u.id=new.user_id
  where o.id=new.order_id
    and o.order_status='delivered'
    and v.product_id=new.product_id
    and u.email_confirmed_at is not null
    and (o.customer_id=new.user_id or lower(o.email)=lower(coalesce(u.email,'')))
 ) then
  raise exception 'A verified delivered purchase is required to review this product';
 end if;
 new.verified_purchase:=true;
 return new;
end $$;
revoke all on function public.nexora_verify_product_review_purchase() from public,anon,authenticated;
drop trigger if exists trg_nexora_verify_product_review_purchase on public.product_reviews;
create trigger trg_nexora_verify_product_review_purchase
 before insert on public.product_reviews
 for each row execute function public.nexora_verify_product_review_purchase();

-- Aggregate only approved reviews; raw review rows remain private to server routes.
create or replace function public.nexora_product_review_summary(p_product_id uuid)
returns table(review_count bigint,average_rating numeric)
language sql stable security definer set search_path='' as $$
 select count(*)::bigint,coalesce(round(avg(r.rating)::numeric,1),0)
 from public.product_reviews r
 where r.product_id=p_product_id and r.status='approved';
$$;
revoke all on function public.nexora_product_review_summary(uuid) from public,anon,authenticated;
grant execute on function public.nexora_product_review_summary(uuid) to service_role;

-- One aggregate query powers product-card ratings without exposing private rows.
create or replace function public.nexora_product_review_summaries(p_product_ids uuid[])
returns table(product_id uuid,review_count bigint,average_rating numeric)
language sql stable security definer set search_path='' as $$
 select requested.product_id,count(r.id)::bigint,coalesce(round(avg(r.rating)::numeric,1),0)
 from unnest(coalesce(p_product_ids,'{}'::uuid[])) as requested(product_id)
 left join public.product_reviews r on r.product_id=requested.product_id and r.status='approved'
 group by requested.product_id;
$$;
revoke all on function public.nexora_product_review_summaries(uuid[]) from public,anon,authenticated;
grant execute on function public.nexora_product_review_summaries(uuid[]) to service_role;
