create table if not exists public.party_events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('guest', 'song', 'poll')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.party_events enable row level security;

drop policy if exists "party events public read" on public.party_events;
drop policy if exists "party events public insert" on public.party_events;

create policy "party events public read"
on public.party_events
for select
using (true);

create policy "party events public insert"
on public.party_events
for insert
with check (type in ('guest', 'song', 'poll'));
