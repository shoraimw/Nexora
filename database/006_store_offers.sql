-- Nexora storefront offers.
-- Offers are managed only by authenticated owners through server routes.
-- The public storefront reads currently active, in-window offers via /api/offers.
create table if not exists public.store_offers (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(btrim(title)) between 3 and 120),
 description text not null default '' check(length(description)<=500),
 badge text not null default 'SPECIAL OFFER' check(length(btrim(badge)) between 2 and 32),
 coupon_code text references public.coupons(code) on update cascade on delete set null,
 target_url text not null default '/shop' check(target_url like '/%' and target_url not like '//%' and length(target_url)<=300),
 cta_label text not null default 'Shop now' check(length(btrim(cta_label)) between 2 and 32),
 starts_at timestamptz,
 ends_at timestamptz,
 active boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 10000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(starts_at is null or ends_at is null or ends_at>starts_at)
);
create index if not exists idx_store_offers_active_order on public.store_offers(active,sort_order,created_at desc);
create index if not exists idx_store_offers_end on public.store_offers(ends_at) where active=true;
alter table public.store_offers enable row level security;
revoke all on public.store_offers from anon,authenticated;
