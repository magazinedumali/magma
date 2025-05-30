-- Table des pages du site
CREATE TABLE IF NOT EXISTS public.pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    path text NOT NULL UNIQUE,
    is_active boolean NOT NULL DEFAULT true
); 