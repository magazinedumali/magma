-- Normalize existing article data so published content appears on homepage sections.
-- Run in Supabase SQL Editor.

begin;

-- 1) Normalize status values to the canonical value used by frontend/RLS: 'publie'
update public.articles
set statut = 'publie'
where lower(trim(statut)) in ('publié', 'published', 'public', 'publie ');

-- 2) If already published but publication date is missing, set a fallback date
update public.articles
set date_publication = coalesce(date_publication, created_at::date, now()::date)
where statut = 'publie'
  and date_publication is null;

-- 3) Normalize obvious sport category variants (optional but useful)
update public.articles
set categorie = 'Sport'
where categorie is not null
  and (
    lower(trim(categorie)) in ('sports', 'sport ')
    or lower(trim(categorie)) like '%sport%'
  );

commit;

