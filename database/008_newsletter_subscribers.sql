-- Nexora opt-in newsletter subscriptions.
-- All writes/reads use trusted server routes after origin/rate/owner checks.
create table if not exists public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(),
 email text not null unique check(length(email) between 5 and 254 and email=lower(email)),
 status text not null default 'active' check(status in ('active','unsubscribed')),
 source text not null default 'website' check(length(source)<=40),
 consent_at timestamptz not null,
 created_at timestamptz not null default now(),
 unsubscribed_at timestamptz
);
create index if not exists idx_newsletter_active_created on public.newsletter_subscribers(status,created_at desc);
alter table public.newsletter_subscribers enable row level security;
revoke all on public.newsletter_subscribers from anon,authenticated;
