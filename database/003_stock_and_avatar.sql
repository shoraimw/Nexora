-- Inventory edits are atomic with order placement; never set stock directly from a browser.
create or replace function public.admin_set_nexora_stock(p_admin uuid,p_variant uuid,p_count integer)
returns void language plpgsql security definer set search_path='' as $$
declare held integer;
begin
 if not exists(select 1 from public.admin_memberships where user_id=p_admin and enabled) then
   raise exception 'Unauthorized owner';
 end if;
 if p_count<0 or p_count>100000 then raise exception 'Invalid inventory count'; end if;
 select reserved into held from public.inventory where variant_id=p_variant for update;
 if not found then raise exception 'Variant inventory missing'; end if;
 if held>p_count then raise exception 'Stock cannot be below reserved quantity'; end if;
 update public.inventory set on_hand=p_count,updated_at=now() where variant_id=p_variant;
 insert into public.audit_logs(actor_id,action,object_type,object_id,details)
 values(p_admin,'stock_adjustment','variant',p_variant::text,jsonb_build_object('on_hand',p_count,'reserved',held));
end $$;
revoke all on function public.admin_set_nexora_stock(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.admin_set_nexora_stock(uuid,uuid,integer) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('nexora-avatars','nexora-avatars',false,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
-- Do not add policies to the private avatar bucket. Service-only upload/read signed URLs.
