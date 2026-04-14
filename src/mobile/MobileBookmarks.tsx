import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import MobileBottomNav from './MobileBottomNav';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/** Placeholder onglet favoris — lien utile vers le profil */
export default function MobileBookmarks() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col pb-[calc(88px+env(safe-area-inset-bottom,0px))] transition-colors duration-300',
        isDark ? 'bg-[#0a0d14] text-[#ffffff]' : 'bg-[#f3f4f6] text-[#111827]',
      )}
    >
      <header
        className={cn(
          'flex items-center gap-3 border-b px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]',
          isDark ? 'border-white/10' : 'border-black/10 bg-white',
        )}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={cn(
            'flex rounded-full border p-2',
            isDark ? 'border-white/10 bg-[#161b26]' : 'border-black/10 bg-white shadow-sm',
          )}
          aria-label="Retour"
        >
          <ArrowLeft size={22} className={isDark ? 'text-[#ffffff]' : 'text-[#111827]'} />
        </button>
        <h1 className={cn('text-lg font-extrabold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>Favoris</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <Bookmark size={56} className="mb-4 text-[#ff184e]" strokeWidth={1.5} />
        <p className={cn('text-xl font-bold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>Favoris</p>
        <p className={cn('mt-3 max-w-sm text-sm leading-relaxed', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
          La liste de favoris arrive bientôt sur cette version mobile. En attendant, votre profil reste
          accessible depuis l’onglet profil.
        </p>
        <button
          type="button"
          onClick={() => navigate(user ? '/mobile/profile' : '/mobile/login')}
          className="mt-8 rounded-full bg-[#ff184e] px-8 py-3 text-sm font-extrabold text-[#ffffff] shadow-lg transition hover:bg-red-600"
        >
          {user ? 'Ouvrir mon profil' : 'Se connecter'}
        </button>
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}
