-- Add atomic request budgets and reliable email claiming.
create table if not exists public.api_rate_limits(
 key_hash text not null, bucket bigint not null, hits integer not null default 1,
 primary key(key_hash,bucket)
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon,authenticated;
create or replace function public.nexora_rate_allow(p_hash text,p_max integer,p_minutes integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_bucket bigint; v_hits integer;
begin
 if length(p_hash)<>64 or p_max not between 1 and 10000 or p_minutes not between 1 and 1440 then return false; end if;
 v_bucket:=floor(extract(epoch from now())/(p_minutes*60))::bigint;
 insert into public.api_rate_limits(key_hash,bucket,hits) values(p_hash,v_bucket,1)
 on conflict(key_hash,bucket) do update set hits=public.api_rate_limits.hits+1
 returning hits into v_hits;
 return v_hits<=p_max;
end $$;
revoke all on function public.nexora_rate_allow(text,integer,integer) from public,anon,authenticated;
grant execute on function public.nexora_rate_allow(text,integer,integer) to service_role;

alter table public.outbound_emails drop constraint if exists outbound_emails_status_check;
alter table public.outbound_emails add constraint outbound_emails_status_check check(status in ('queued','sending','sent','failed'));
alter table public.outbound_emails add column if not exists locked_at timestamptz;
create or replace function public.nexora_claim_email() returns uuid
language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 -- Recover interrupted attempts after 10 minutes, but avoid concurrent sends.
 with candidate as (
  select id from public.outbound_emails
  where status='queued' or (status='sending' and locked_at<now()-interval '10 minutes')
  order by created_at for update skip locked limit 1
 )
 update public.outbound_emails e set status='sending',locked_at=now(),attempts=attempts+1
 from candidate c where e.id=c.id returning e.id into v_id;
 return v_id;
end $$;
revoke all on function public.nexora_claim_email() from public,anon,authenticated;
grant execute on function public.nexora_claim_email() to service_role;

-- Password/email sign-in clients may only edit their own profile.
-- Server endpoints separately verify JWTs and roles for all other data.
create table if not exists public.site_policies (
 id text primary key, body text not null, updated_at timestamptz not null default now()
);
alter table public.site_policies enable row level security;
revoke all on public.site_policies from anon,authenticated;
