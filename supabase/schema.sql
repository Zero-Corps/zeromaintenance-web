-- Zero Maintenance — Supabase schema for quote requests.
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- 1) Table
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null,
  phone         text        not null,
  vehicle_year  text,
  vehicle_make  text,
  vehicle_model text,
  size_class    text        not null,
  service       text,
  service_address text,
  notes         text,
  estimate_low  integer     not null,
  estimate_high integer     not null,
  status        text        not null default 'new',
  created_at    timestamptz not null default now()
);

-- 2) Enable Row Level Security
alter table public.quote_requests enable row level security;

-- 3) Policy: allow anonymous (and authenticated) visitors to INSERT only.
--    No SELECT/UPDATE/DELETE policy exists, so the data is NOT publicly
--    readable — only the business, via the dashboard or the service_role key,
--    can read it. This is exactly what we want for a lead form.
drop policy if exists "Anon can submit quote requests" on public.quote_requests;
create policy "Anon can submit quote requests"
  on public.quote_requests
  for insert
  to anon, authenticated
  with check (true);

-- Helpful index for the business reviewing newest-first.
create index if not exists quote_requests_created_at_idx
  on public.quote_requests (created_at desc);
