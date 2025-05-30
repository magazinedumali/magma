-- Migration pour la table du menu principal
CREATE TABLE IF NOT EXISTS public.main_menu (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    path text NOT NULL,
    has_dropdown boolean NOT NULL DEFAULT false,
    hot boolean DEFAULT false,
    "order" integer NOT NULL DEFAULT 0
);

-- Index pour l'ordre d'affichage
CREATE INDEX IF NOT EXISTS idx_main_menu_order ON public.main_menu ("order"); 