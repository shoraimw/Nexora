-- Shipping fees and delivery ETA: atomically included in every checkout.
-- Without an active district or "*" fallback price, checkout fails closed.
create table if not exists public.delivery_zones (
 district text primary key,
 fee_paisa bigint not null check(fee_paisa between 0 and 10000000),
 eta_text text not null check(length(eta_text) between 4 and 250),
 active boolean not null default true,
 updated_at timestamptz not null default now()
);
alter table public.delivery_zones enable row level security;
revoke all on public.delivery_zones from anon,authenticated;

create or replace function public.nexora_apply_delivery_fee()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_fee bigint;
begin
 select fee_paisa into v_fee from public.delivery_zones
 where active and (lower(district)=lower(btrim(NEW.district)) or district='*')
 order by case when lower(district)=lower(btrim(NEW.district)) then 0 else 1 end
 limit 1;
 if not found then raise exception 'Delivery fee not configured for this district'; end if;
 NEW.delivery_paisa:=v_fee;
 return NEW;
end $$;
drop trigger if exists trig_nexora_delivery_fee on public.orders;
create trigger trig_nexora_delivery_fee before insert on public.orders
 for each row execute function public.nexora_apply_delivery_fee();

-- The initial manual payment claim is the expected total including shipping.
-- Subsequent supplemental claims retain the customer's explicitly submitted amount.
create or replace function public.nexora_initial_claim_total()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_total bigint;
begin
 if not exists(select 1 from public.payment_claims where order_id=NEW.order_id) then
  select total_paisa into v_total from public.orders where id=NEW.order_id;
  if v_total is not null then NEW.claimed_paisa:=greatest(v_total,1); end if;
 end if;
 return NEW;
end $$;
drop trigger if exists trig_nexora_initial_claim_total on public.payment_claims;
create trigger trig_nexora_initial_claim_total before insert on public.payment_claims
 for each row execute function public.nexora_initial_claim_total();

-- A dedicated atomic stock edit remains in database/003_stock_and_avatar.sql.
