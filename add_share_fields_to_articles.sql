-- Migration: Add share_image_url and share_description to articles
ALTER TABLE public.articles
ADD COLUMN share_image_url text null,
ADD COLUMN share_description text null; 