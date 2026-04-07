-- Fix RLS for articles so admin dashboard updates (including statut='publie') persist.
-- Run this in Supabase SQL Editor.

begin;

alter table public.articles enable row level security;

-- Remove conflicting/unknown existing policies to avoid policy stacking issues.
drop policy if exists "Public can read published articles" on public.articles;
drop policy if exists "Authenticated can read all articles" on public.articles;
drop policy if exists "Authenticated can insert articles" on public.articles;
drop policy if exists "Authenticated can update articles" on public.articles;
drop policy if exists "Authenticated can delete articles" on public.articles;

-- Public website access: read only published articles.
create policy "Public can read published articles"
on public.articles
for select
to anon
using (statut = 'publie');

-- Admin dashboard sessions are authenticated users in this app.
create policy "Authenticated can read all articles"
on public.articles
for select
to authenticated
using (true);

create policy "Authenticated can insert articles"
on public.articles
for insert
to authenticated
with check (true);

create policy "Authenticated can update articles"
on public.articles
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated can delete articles"
on public.articles
for delete
to authenticated
using (true);

commit;

