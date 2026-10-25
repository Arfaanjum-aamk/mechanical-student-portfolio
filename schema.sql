-- Run this in Supabase Dashboard > SQL Editor.
-- Each authenticated student can read/write ONLY the portfolio row whose user_id matches their own auth.uid().

create table if not exists public.portfolios (
  user_id uuid primary key references auth.users(id) on delete cascade,
  portfolio_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

drop policy if exists "Students can read own portfolio" on public.portfolios;
create policy "Students can read own portfolio"
on public.portfolios for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Students can insert own portfolio" on public.portfolios;
create policy "Students can insert own portfolio"
on public.portfolios for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Students can update own portfolio" on public.portfolios;
create policy "Students can update own portfolio"
on public.portfolios for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on public.portfolios to authenticated;
