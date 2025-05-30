-- Ajout des champs pour la hiérarchie et la gestion avancée des liens
ALTER TABLE public.main_menu
ADD COLUMN parent_id uuid REFERENCES public.main_menu(id) ON DELETE CASCADE,
ADD COLUMN link_type text NOT NULL DEFAULT 'internal',
ADD COLUMN target_blank boolean NOT NULL DEFAULT false; 