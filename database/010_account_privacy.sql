-- Customer account deletion: retain order/accounting rows but remove customer identifiers.
-- This function is callable only by the trusted server service role after password re-authentication.
create or replace function public.nexora_delete_customer_account(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
 v_private_email text;
 v_original_email text;
begin
 if p_user_id is null then
  raise exception 'Invalid account';
 end if;

 select email into v_original_email from auth.users where id=p_user_id;
 if not found or v_original_email is null then
  raise exception 'Account not found';
 end if;

 if exists(
  select 1 from public.admin_memberships
  where user_id=p_user_id and role='owner' and enabled
 ) then
  raise exception 'Owner accounts must be removed by another owner';
 end if;

 v_private_email:='deleted+'||p_user_id::text||'@privacy.nexora.invalid';

 update public.payment_claims c
 set sender_number=''
 where exists(
  select 1 from public.orders o
  where o.id=c.order_id and (o.customer_id=p_user_id or lower(o.email)=lower(v_original_email))
 );

 update public.outbound_emails e
 set recipient=v_private_email
 from public.orders o
 where e.order_id=o.id and (o.customer_id=p_user_id or lower(o.email)=lower(v_original_email));

 update public.orders
 set customer_id=null,
     full_name='Deleted customer',
     email=v_private_email,
     phone='',
     address='',
     district='',
     area='',
     notes=''
 where customer_id=p_user_id or lower(email)=lower(v_original_email);

 delete from auth.users where id=p_user_id;
 if not found then
  raise exception 'Account not found';
 end if;
end;
$$;

revoke all on function public.nexora_delete_customer_account(uuid) from public,anon,authenticated;
grant execute on function public.nexora_delete_customer_account(uuid) to service_role;
