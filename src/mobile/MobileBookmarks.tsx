import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MobileBottomNav from './MobileBottomNav';

/** Équivalent de l’onglet « Bookmarks » placeholder dans MagmaMobile — avec lien utile vers le profil */
export default function MobileBookmarks() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0d14] pb-[calc(88px+env(safe-area-inset-bottom,0px))] text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex rounded-full border border-white/10 bg-[#161b26] p-2"
          aria-label="Retour"
        >
          <ArrowLeft size={22} className="text-white" />
        </button>
        <h1 className="text-lg font-extrabold">Favoris</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Bookmark size={56} className="mb-4 text-[#ff184e]" strokeWidth={1.5} />
        <p className="text-xl font-bold text-white">Bookmarks</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#9ba5be]">
          Sur l&apos;application MagmaMobile, cet onglet est en cours de développement. Vos favoris et votre profil sont
          accessibles depuis la page profil.
        </p>
        <button
          type="button"
          onClick={() => navigate(user ? '/mobile/profile' : '/mobile/login')}
          className="mt-8 rounded-full bg-[#ff184e] px-8 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          {user ? 'Ouvrir mon profil' : 'Se connecter'}
        </button>
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}
