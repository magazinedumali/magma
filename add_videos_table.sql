-- Table des vidéos publiées
CREATE TABLE IF NOT EXISTS public.videos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    author text NOT NULL,
    date date NOT NULL,
    image text NOT NULL,
    author_avatar text,
    video_url text NOT NULL
); 