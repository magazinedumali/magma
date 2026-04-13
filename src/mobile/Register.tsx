import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function MobileRegister() {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { data, error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (signErr) {
      setError(signErr.message);
      return;
    }
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, name, role: 'user' });
      if (!data.user.user_metadata?.country) {
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          const { ip } = await ipRes.json();
          const geoRes = await fetch(`https://ipapi.co/${ip}/country_name/`);
          const country = await geoRes.text();
          if (country && country.length < 40) {
            await supabase.auth.updateUser({ data: { ...data.user.user_metadata, country } });
          }
        } catch {
          /* ignore */
        }
      }
    }
    setShowModal(true);
  };

  const fieldClass = cn(
    'w-full rounded-2xl border px-4 py-3.5 text-base outline-none focus:border-[#ff184e]/50',
    isDark
      ? 'border-white/10 bg-[#161b26] text-[#ffffff] placeholder:text-[#9ba5be]'
      : 'border-black/10 bg-white text-[#111827] placeholder:text-[#6b7280] shadow-sm',
  );

  const labelClass = cn('mb-2 block text-[13px] font-bold', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]');

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col transition-colors duration-300',
        isDark ? 'bg-[#0a0d14] text-[#ffffff]' : 'bg-[#f3f4f6] text-[#111827]',
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between border-b px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]',
          isDark ? 'border-white/10' : 'border-black/10 bg-white',
        )}
      >
        <button
          type="button"
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full',
            !isDark && 'hover:bg-black/5',
          )}
          onClick={() => navigate(-1)}
          aria-label="Retour"
        >
          <ChevronLeft size={28} className={isDark ? 'text-[#ffffff]' : 'text-[#111827]'} />
        </button>
        <h1 className={cn('text-lg font-extrabold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>Inscription</h1>
        <span className="w-11" />
      </header>

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center">
          <div
            className={cn(
              'mb-4 flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-3xl border',
              isDark ? 'border-white/10 bg-[#161b26]' : 'border-black/10 bg-white shadow-sm',
            )}
          >
            <img src="/logo.png" alt="" className="h-[82%] w-[82%] object-contain" loading="lazy" />
          </div>
        </div>

        <form onSubmit={handleRegister} className="mx-auto w-full max-w-xs space-y-4">
          <div>
            <label className={labelClass} htmlFor="name">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="Votre nom"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
              placeholder="Votre adresse e-mail"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
              placeholder="Votre mot de passe"
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-[#ef4444]">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-[20px] bg-[#ff184e] py-4 text-base font-extrabold text-[#ffffff] shadow-lg"
          >
            Créer un compte
          </button>
        </form>

        <p className={cn('mt-6 text-center text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
          Vous avez déjà un compte ?{' '}
          <button type="button" className="font-extrabold text-[#ff184e]" onClick={() => navigate('/mobile/login')}>
            Se connecter
          </button>
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div
            className={cn(
              'flex w-full animate-fadeInUp flex-col items-center rounded-t-3xl border-t p-6 pb-10 shadow-2xl',
              isDark
                ? 'border-white/10 bg-[#161b26]'
                : 'border-black/10 bg-white',
            )}
          >
            <h2
              className={cn(
                'mb-2 mt-2 text-center text-xl font-bold',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]',
              )}
            >
              Complétez votre profil
            </h2>
            <p className={cn('mb-6 text-center text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
              Ajoutez une photo de profil depuis les réglages pour une meilleure expérience.
            </p>
            <button
              type="button"
              className="w-full rounded-[20px] bg-[#ff184e] py-3.5 text-base font-extrabold text-[#ffffff]"
              onClick={() => navigate('/mobile/profile')}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
