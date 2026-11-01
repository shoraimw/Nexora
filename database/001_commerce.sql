-- Nexora commerce schema v1. Application-facing writes happen ONLY through
-- server routes. Apply once in a fresh Supabase PostgreSQL project.
create extension if not exists pgcrypto;

create table if not exists public.categories (
 id uuid primary key default gen_random_uuid(), slug text not null unique,
 name text not null, description text, sort_order integer not null default 0,
 active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 category_id uuid references public.categories(id) on delete set null,
 slug text not null unique, title text not null, description text not null default '',
 specs jsonb not null default '{}'::jsonb, warranty text not null default 'Contact Nexora for warranty details',
 brand text not null default '', featured boolean not null default false,
 active boolean not null default false, deleted_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.variants (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete restrict,
 sku text not null unique, name text not null default 'Default', color text,
 price_paisa bigint not null check(price_paisa>=0),
 compare_at_paisa bigint check(compare_at_paisa is null or compare_at_paisa>=price_paisa),
 active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.inventory (
 variant_id uuid primary key references public.variants(id) on delete restrict,
 on_hand integer not null default 0 check(on_hand>=0),
 reserved integer not null default 0 check(reserved>=0 and reserved<=on_hand),
 updated_at timestamptz not null default now()
);
create table if not exists public.product_images (
 id uuid primary key default gen_random_uuid(),
 product_id uuid not null references public.products(id) on delete cascade,
 url text not null check(length(url)<=1000), alt text not null default '',
 sort_order integer not null default 0
);
create table if not exists public.coupons (
 id uuid primary key default gen_random_uuid(), code text not null unique,
 type text not null check(type in ('flat','percent')), amount integer not null check(amount>0),
 min_subtotal_paisa bigint not null default 0,
 max_uses integer check(max_uses is null or max_uses>=1),
 uses integer not null default 0 check(uses>=0), active boolean not null default true,
 starts_at timestamptz, ends_at timestamptz
);
create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', phone text not null default '',
 address text not null default '', district text not null default '',
 avatar_url text, chat_history_opt_in boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.admin_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','manager')),
 enabled boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.orders (
 id uuid primary key default gen_random_uuid(),
 order_no text not null unique, idempotency_key uuid not null unique,
 tracking_token_hash text not null,
 customer_id uuid references auth.users(id) on delete set null,
 full_name text not null, email text not null, phone text not null,
 address text not null, district text not null, area text not null default '',
 notes text not null default '',
 payment_method text not null check(payment_method in ('bkash','nagad','cod')),
 payment_status text not null check(payment_status in ('unpaid','pending_verification','verified','rejected','refunded')) default 'unpaid',
 order_status text not null check(order_status in ('received','confirmed','packing','shipped','delivered','cancelled','returned')) default 'received',
 subtotal_paisa bigint not null check(subtotal_paisa>=0),
 delivery_paisa bigint not null default 0 check(delivery_paisa>=0),
 discount_paisa bigint not null default 0 check(discount_paisa>=0),
 total_paisa bigint generated always as (subtotal_paisa+delivery_paisa-discount_paisa) stored,
 coupon_id uuid references public.coupons(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(subtotal_paisa+delivery_paisa>=discount_paisa)
);
create table if not exists public.order_items (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete restrict,
 variant_id uuid not null references public.variants(id),
 title text not null, sku text not null, variant_name text not null,
 warranty text not null, quantity integer not null check(quantity between 1 and 20),
 unit_price_paisa bigint not null check(unit_price_paisa>=0),
 status text not null default 'held' check(status in ('held','committed','released'))
);
create table if not exists public.payment_claims (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete restrict,
 provider text not null check(provider in ('bkash','nagad')),
 transaction_id text not null check(length(btrim(transaction_id)) between 5 and 90),
 sender_number text not null default '',
 claimed_paisa bigint not null check(claimed_paisa>0),
 status text not null default 'pending' check(status in ('pending','verified','rejected','refunded')),
 reviewed_by uuid references auth.users(id), reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 unique(provider,transaction_id)
);
create table if not exists public.shipments (
 order_id uuid primary key references public.orders(id) on delete cascade,
 provider text not null default 'steadfast',
 consignment_id text, tracking_url text,
 dispatched_at timestamptz, delivered_at timestamptz
);
create table if not exists public.order_events (
 id bigint generated by default as identity primary key,
 order_id uuid not null references public.orders(id) on delete cascade,
 event text not null, actor_id uuid references auth.users(id),
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.outbound_emails (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete cascade,
 kind text not null check(kind in ('order_received','payment_confirmed','shipped','delivered','cancelled')),
 recipient text not null,
 status text not null default 'queued' check(status in ('queued','sent','failed')),
 attempts integer not null default 0,
 last_error text,
 created_at timestamptz not null default now(), sent_at timestamptz,
 unique(order_id,kind)
);
create table if not exists public.audit_logs (
 id bigint generated by default as identity primary key,
 actor_id uuid references auth.users(id), action text not null,
 object_type text not null, object_id text not null,
 details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.chat_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'Shopping chat',
 created_at timestamptz not null default now()
);
create table if not exists public.chat_messages (
 id bigint generated by default as identity primary key,
 session_id uuid not null references public.chat_sessions(id) on delete cascade,
 role text not null check(role in ('user','assistant')),
 body text not null check(length(body)<=2000),
 created_at timestamptz not null default now()
);
create table if not exists public.faq_entries (
 id uuid primary key default gen_random_uuid(), question text not null,
 answer text not null, active boolean not null default true, sort_order integer not null default 0
);
create table if not exists public.site_settings (
 key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on public.products(category_id,active);
create index if not exists idx_variants_product on public.variants(product_id,active);
create index if not exists idx_orders_customer on public.orders(customer_id,created_at desc);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_claims_order on public.payment_claims(order_id);
create index if not exists idx_chat_sessions_user on public.chat_sessions(user_id,created_at desc);

-- Deny direct Data API writes/reads except a customer's own profile.
-- All other operations go through server routes; service_role never leaves server.
do $$
declare tbl text;
begin
 for tbl in select unnest(array['categories','products','variants','inventory','product_images','coupons','profiles','admin_memberships','orders','order_items','payment_claims','shipments','order_events','outbound_emails','audit_logs','chat_sessions','chat_messages','faq_entries','site_settings'])
 loop
  execute format('alter table public.%I enable row level security',tbl);
  execute format('revoke all on public.%I from anon, authenticated',tbl);
 end loop;
end $$;
grant select,insert,update on public.profiles to authenticated;
create policy "profile owner may read" on public.profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "profile owner may create" on public.profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "profile owner may edit" on public.profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

-- Strict transactional checkout. Client price and status fields are ignored.
create or replace function public.place_nexora_order(
 p_key uuid, p_track_hash text, p_customer_id uuid,
 p_details jsonb, p_lines jsonb, p_method text,
 p_transaction text default null, p_sender text default null,
 p_coupon text default null
) returns jsonb language plpgsql security definer
set search_path = '' as $$
declare
 v_order uuid; v_no text; v_subtotal bigint:=0; v_discount bigint:=0; v_delivery bigint:=0;
 v_variant record; v_qty integer; v_row record; v_count integer:=0;
 v_coupon public.coupons%rowtype; v_claim text; v_customer public.orders%rowtype;
 v_line jsonb;
begin
 if p_key is null or length(coalesce(p_track_hash,''))<>64 then raise exception 'Invalid order key'; end if;
 select id,order_no into v_order,v_no from public.orders where idempotency_key=p_key;
 if v_order is not null then return jsonb_build_object('id',v_order,'order_no',v_no,'duplicate',true); end if;
 if p_method not in ('bkash','nagad','cod') then raise exception 'Invalid payment method'; end if;
 if jsonb_typeof(p_lines)<>'array' or jsonb_array_length(p_lines) not between 1 and 20 then raise exception 'Invalid cart'; end if;
 if length(btrim(coalesce(p_details->>'name',''))) not between 2 and 120
    or length(btrim(coalesce(p_details->>'email',''))) not between 5 and 200
    or length(btrim(coalesce(p_details->>'phone',''))) not between 10 and 18
    or length(btrim(coalesce(p_details->>'address',''))) not between 8 and 300
    or length(btrim(coalesce(p_details->>'district',''))) not between 2 and 100 then
    raise exception 'Invalid customer details';
 end if;
 if p_method<>'cod' and length(btrim(coalesce(p_transaction,''))) not between 5 and 90 then
    raise exception 'Transaction ID required';
 end if;
 -- Lock in a stable ordering to avoid oversells and cross-order deadlocks.
 for v_row in
   select (x->>'variant_id')::uuid as variant_id, sum((x->>'quantity')::integer)::integer as quantity, count(*) as copies
   from jsonb_array_elements(p_lines) x
   group by (x->>'variant_id')::uuid order by (x->>'variant_id')::uuid
 loop
   if v_row.copies<>1 or v_row.quantity not between 1 and 20 then raise exception 'Invalid or duplicate cart lines'; end if;
   select v.id,v.sku,v.name,v.price_paisa,p.title,p.warranty,i.on_hand,i.reserved
   into v_variant
   from public.variants v join public.products p on p.id=v.product_id
   join public.inventory i on i.variant_id=v.id
   where v.id=v_row.variant_id and v.active and p.active and p.deleted_at is null
   for update of i;
   if not found or v_variant.on_hand-v_variant.reserved<v_row.quantity then raise exception 'Product unavailable or out of stock'; end if;
   v_subtotal:=v_subtotal+v_variant.price_paisa*v_row.quantity;
   v_count:=v_count+1;
 end loop;
 if v_count=0 then raise exception 'Empty cart'; end if;
 if nullif(btrim(coalesce(p_coupon,'')),'') is not null then
   select * into v_coupon from public.coupons
   where code=upper(btrim(p_coupon)) and active and (starts_at is null or starts_at<=now())
   and (ends_at is null or ends_at>now())
   for update;
   if not found or v_subtotal<v_coupon.min_subtotal_paisa
     or (v_coupon.max_uses is not null and v_coupon.uses>=v_coupon.max_uses) then raise exception 'Coupon unavailable'; end if;
   if v_coupon.type='flat' then v_discount:=least(v_coupon.amount::bigint,v_subtotal);
   else v_discount:=floor(v_subtotal*v_coupon.amount/100.0)::bigint; end if;
   v_discount:=least(v_discount,v_subtotal);
   update public.coupons set uses=uses+1 where id=v_coupon.id;
 end if;
 v_order:=gen_random_uuid();
 v_no:='NX-'||to_char(now() at time zone 'UTC','YYYYMMDD')||'-'||upper(substr(replace(v_order::text,'-',''),1,8));
 insert into public.orders(id,order_no,idempotency_key,tracking_token_hash,customer_id,full_name,email,phone,address,district,area,notes,payment_method,payment_status,subtotal_paisa,delivery_paisa,discount_paisa,coupon_id)
 values(v_order,v_no,p_key,p_track_hash,p_customer_id,btrim(p_details->>'name'),
 lower(btrim(p_details->>'email')),btrim(p_details->>'phone'),btrim(p_details->>'address'),
 btrim(p_details->>'district'),left(coalesce(p_details->>'area',''),100),left(coalesce(p_details->>'notes',''),500),
 p_method,case when p_method='cod' then 'unpaid' else 'pending_verification' end,
 v_subtotal,v_delivery,v_discount,v_coupon.id);
 for v_row in
   select (x->>'variant_id')::uuid as variant_id,(x->>'quantity')::integer as quantity
   from jsonb_array_elements(p_lines) x order by (x->>'variant_id')::uuid
 loop
   select v.sku,v.name,v.price_paisa,p.title,p.warranty into v_variant
   from public.variants v join public.products p on p.id=v.product_id where v.id=v_row.variant_id;
   insert into public.order_items(order_id,variant_id,title,sku,variant_name,warranty,quantity,unit_price_paisa)
   values(v_order,v_row.variant_id,v_variant.title,v_variant.sku,v_variant.name,v_variant.warranty,v_row.quantity,v_variant.price_paisa);
   update public.inventory set reserved=reserved+v_row.quantity,updated_at=now() where variant_id=v_row.variant_id;
 end loop;
 if p_method<>'cod' then
   v_claim:=upper(btrim(p_transaction));
   insert into public.payment_claims(order_id,provider,transaction_id,sender_number,claimed_paisa)
   values(v_order,p_method,v_claim,left(btrim(coalesce(p_sender,'')),18),v_subtotal+v_delivery-v_discount);
 end if;
 insert into public.order_events(order_id,event,details) values(v_order,'order_received',jsonb_build_object('payment_method',p_method));
 insert into public.outbound_emails(order_id,kind,recipient) values(v_order,'order_received',lower(btrim(p_details->>'email')));
 return jsonb_build_object('id',v_order,'order_no',v_no,'duplicate',false,'total_paisa',v_subtotal+v_delivery-v_discount);
end $$;
revoke all on function public.place_nexora_order(uuid,text,uuid,jsonb,jsonb,text,text,text,text) from public,anon,authenticated;
grant execute on function public.place_nexora_order(uuid,text,uuid,jsonb,jsonb,text,text,text,text) to service_role;

-- Enforce payment/order transitions and inventory consumption in one transaction.
create or replace function public.admin_change_order(
 p_order uuid,p_actor uuid,p_status text default null,
 p_payment text default null,p_courier text default null,p_consignment text default null,p_tracking_url text default null
) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders%rowtype; next_status text;
begin
 if not exists(select 1 from public.admin_memberships where user_id=p_actor and enabled) then raise exception 'Not an admin'; end if;
 select * into o from public.orders where id=p_order for update;
 if not found then raise exception 'Order not found'; end if;
 if p_payment is not null then
   if p_payment='verified' and o.payment_status='pending_verification' then
     update public.orders set payment_status='verified' where id=p_order;
     update public.payment_claims set status='verified',reviewed_by=p_actor,reviewed_at=now() where order_id=p_order and status='pending';
     insert into public.outbound_emails(order_id,kind,recipient) values(p_order,'payment_confirmed',o.email) on conflict do nothing;
   elsif p_payment='rejected' and o.payment_status='pending_verification' then
     update public.orders set payment_status='rejected' where id=p_order;
     update public.payment_claims set status='rejected',reviewed_by=p_actor,reviewed_at=now() where order_id=p_order and status='pending';
   else raise exception 'Invalid payment transition'; end if;
   insert into public.order_events(order_id,event,actor_id) values(p_order,'payment_'||p_payment,p_actor);
 end if;
 next_status:=coalesce(p_status,o.order_status);
 if next_status<>o.order_status then
  if not ((o.order_status='received' and next_status in ('confirmed','cancelled'))
    or (o.order_status='confirmed' and next_status in ('packing','cancelled'))
    or (o.order_status='packing' and next_status in ('shipped','cancelled'))
    or (o.order_status='shipped' and next_status in ('delivered','returned'))) then
     raise exception 'Invalid order transition';
  end if;
  if next_status in ('confirmed','packing','shipped') and o.payment_method<>'cod'
    and not exists(select 1 from public.orders where id=p_order and payment_status='verified') then
    raise exception 'Payment must be verified first';
  end if;
  if next_status='shipped' then
    update public.inventory i set reserved=i.reserved-oi.quantity,on_hand=i.on_hand-oi.quantity,updated_at=now()
      from public.order_items oi where oi.order_id=p_order and oi.variant_id=i.variant_id and oi.status='held';
    update public.order_items set status='committed' where order_id=p_order and status='held';
    insert into public.shipments(order_id,provider,consignment_id,tracking_url,dispatched_at)
      values(p_order,coalesce(nullif(p_courier,''),'steadfast'),nullif(p_consignment,''),nullif(p_tracking_url,''),now())
      on conflict(order_id) do update set consignment_id=excluded.consignment_id,tracking_url=excluded.tracking_url,dispatched_at=excluded.dispatched_at;
    insert into public.outbound_emails(order_id,kind,recipient) values(p_order,'shipped',o.email) on conflict do nothing;
  elsif next_status='cancelled' then
    update public.inventory i set reserved=i.reserved-oi.quantity,updated_at=now()
      from public.order_items oi where oi.order_id=p_order and oi.variant_id=i.variant_id and oi.status='held';
    update public.order_items set status='released' where order_id=p_order and status='held';
    if o.coupon_id is not null then update public.coupons set uses=greatest(uses-1,0) where id=o.coupon_id; end if;
    insert into public.outbound_emails(order_id,kind,recipient) values(p_order,'cancelled',o.email) on conflict do nothing;
  elsif next_status='delivered' then
    update public.shipments set delivered_at=now() where order_id=p_order;
    insert into public.outbound_emails(order_id,kind,recipient) values(p_order,'delivered',o.email) on conflict do nothing;
  end if;
  update public.orders set order_status=next_status,updated_at=now() where id=p_order;
  insert into public.order_events(order_id,event,actor_id) values(p_order,next_status,p_actor);
 end if;
 insert into public.audit_logs(actor_id,action,object_type,object_id,details)
 values(p_actor,'admin_change_order','order',p_order::text,jsonb_build_object('status',p_status,'payment',p_payment,'courier',p_courier));
end $$;
revoke all on function public.admin_change_order(uuid,uuid,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.admin_change_order(uuid,uuid,text,text,text,text,text) to service_role;

-- An explicit allowlist is required for a public asset bucket; never store personal receipts or NID photos there.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('nexora-products','nexora-products',true,3145728,array['image/jpeg','image/png','image/webp'])
 on conflict(id) do nothing;
create policy "Anyone may view published product images" on storage.objects
 for select to anon, authenticated using(bucket_id='nexora-products');
-- Uploads are only performed by the trusted server service-role after owner checks.
