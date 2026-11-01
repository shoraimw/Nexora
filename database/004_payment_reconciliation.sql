-- Nexora payment reconciliation: separate claims, excess transfers and manual refunds.
alter table public.orders add column if not exists overpaid_paisa bigint not null default 0 check(overpaid_paisa>=0);
create table if not exists public.refunds (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.orders(id) on delete restrict,
 amount_paisa bigint not null check(amount_paisa>0),
 method text not null check(method in ('bkash','nagad','cash','bank')),
 external_reference text not null,
 note text not null default '',
 recorded_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(method,external_reference)
);
alter table public.refunds enable row level security;
revoke all on public.refunds from anon,authenticated;
create index if not exists idx_refunds_order on public.refunds(order_id);

create or replace function public.nexora_review_payment_claim(
 p_actor uuid,p_claim uuid,p_verdict text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare cl public.payment_claims%rowtype; ord public.orders%rowtype; paid bigint;
begin
 if not exists(select 1 from public.admin_memberships where user_id=p_actor and enabled) then raise exception 'Owner access required'; end if;
 if p_verdict not in ('verified','rejected') then raise exception 'Invalid verdict'; end if;
 select * into cl from public.payment_claims where id=p_claim for update;
 if not found or cl.status<>'pending' then raise exception 'Claim already reviewed or missing'; end if;
 select * into ord from public.orders where id=cl.order_id for update;
 if ord.order_status='cancelled' or ord.payment_method<>cl.provider then raise exception 'Order cannot accept this claim'; end if;
 update public.payment_claims set status=p_verdict,reviewed_by=p_actor,reviewed_at=now() where id=p_claim;
 select coalesce(sum(claimed_paisa),0) into paid from public.payment_claims where order_id=cl.order_id and status='verified';
 update public.orders set payment_status=case when paid>=ord.total_paisa then 'verified' when paid>0 then 'pending_verification' else 'rejected' end,
  overpaid_paisa=greatest(0,paid-ord.total_paisa),updated_at=now()
 where id=cl.order_id;
 insert into public.order_events(order_id,event,actor_id,details) values(cl.order_id,'claim_'||p_verdict,p_actor,jsonb_build_object('claim_id',p_claim,'verified_total_paisa',paid));
 insert into public.audit_logs(actor_id,action,object_type,object_id,details) values(p_actor,'claim_'||p_verdict,'payment_claim',p_claim::text,jsonb_build_object('order_id',cl.order_id));
 if paid>=ord.total_paisa and ord.payment_status<>'verified' then
  insert into public.outbound_emails(order_id,kind,recipient) values(cl.order_id,'payment_confirmed',ord.email) on conflict do nothing;
 end if;
 return jsonb_build_object('order_id',cl.order_id,'verified_paisa',paid,'overpaid_paisa',greatest(0,paid-ord.total_paisa));
end $$;
revoke all on function public.nexora_review_payment_claim(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.nexora_review_payment_claim(uuid,uuid,text) to service_role;

create or replace function public.nexora_record_manual_refund(
 p_actor uuid,p_order uuid,p_amount bigint,p_method text,p_reference text,p_note text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare paid bigint; refunded bigint; current_order public.orders%rowtype; rec uuid;
begin
 if not exists(select 1 from public.admin_memberships where user_id=p_actor and enabled) then raise exception 'Owner access required'; end if;
 if p_amount<=0 or length(btrim(p_reference))<5 or p_method not in ('bkash','nagad','cash','bank') then raise exception 'Invalid refund details'; end if;
 select * into current_order from public.orders where id=p_order for update;
 if not found then raise exception 'Order missing'; end if;
 select coalesce(sum(claimed_paisa),0) into paid from public.payment_claims where order_id=p_order and status='verified';
 select coalesce(sum(amount_paisa),0) into refunded from public.refunds where order_id=p_order;
 if p_amount>paid-refunded then raise exception 'Refund exceeds recorded verified payments'; end if;
 insert into public.refunds(order_id,amount_paisa,method,external_reference,note,recorded_by)
 values(p_order,p_amount,p_method,upper(btrim(p_reference)),left(coalesce(p_note,''),500),p_actor) returning id into rec;
 refunded:=refunded+p_amount;
 update public.orders set overpaid_paisa=greatest(0,paid-refunded-total_paisa),
  payment_status=case when refunded>=paid then 'refunded' else payment_status end,
  updated_at=now() where id=p_order;
 insert into public.order_events(order_id,event,actor_id,details) values(p_order,'refund_recorded',p_actor,jsonb_build_object('amount_paisa',p_amount,'refund_id',rec));
 insert into public.audit_logs(actor_id,action,object_type,object_id,details) values(p_actor,'refund_recorded','order',p_order::text,jsonb_build_object('amount_paisa',p_amount,'refund_id',rec));
 return jsonb_build_object('refund_id',rec,'refunded_paisa',refunded);
end $$;
revoke all on function public.nexora_record_manual_refund(uuid,uuid,bigint,text,text,text) from public,anon,authenticated;
grant execute on function public.nexora_record_manual_refund(uuid,uuid,bigint,text,text,text) to service_role;

-- Prevent legacy bulk-verification API from marking multiple claims verified.
-- Application now passes p_payment=null to admin_change_order and uses the
-- per-claim RPC above. Revoke direct EXECUTE where practical outside service role.
