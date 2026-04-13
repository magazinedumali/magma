import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getOAuthRedirectUrl } from '@/lib/authHelpers';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function MobileLogin() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError('Email ou mot de passe incorrect.');
      return;
    }
    if (data.user && !data.user.user_metadata?.country) {
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
    navigate('/mobile');
  };

  const handleGoogleLogin = async () => {
    setError('');
    setOauthLoading(true);
    try {
      const redirectUrl = getOAuthRedirectUrl();
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (err) setError(err.message || 'Connexion Google impossible.');
    } catch {
      setError('Une erreur est survenue avec Google.');
      setOauthLoading(false);
    }
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
        'flex min-h-screen flex-col transition-colors duration-300',
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
        <h1 className={cn('text-lg font-extrabold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>Connexion</h1>
        <span className="w-11" />
      </header>

      <div className="flex flex-1 flex-col px-6 pb-10 pt-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <div
            className={cn(
              'mb-4 flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-3xl border',
              isDark ? 'border-white/10 bg-[#161b26]' : 'border-black/10 bg-white shadow-sm',
            )}
          >
            <img src="/logo.png" alt="Magma" className="h-[82%] w-[82%] object-contain" loading="lazy" />
          </div>
          <p className={cn('text-[22px] font-extrabold', isDark ? 'text-[#ffffff]' : 'text-[#111827]')}>
            Bienvenue sur Magma
          </p>
          <p className={cn('mt-1 text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
            Connectez-vous pour accéder à votre compte
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="votre@email.com"
              className={fieldClass}
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
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className={fieldClass}
            />
          </div>

          {error && <p className="text-sm text-[#ef4444]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-[20px] bg-[#ff184e] py-4 text-center text-base font-extrabold text-[#ffffff] disabled:opacity-70"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-2">
          <div className={cn('h-px flex-1', isDark ? 'bg-white/10' : 'bg-black/10')} />
          <span className={cn('text-xs font-semibold uppercase tracking-wider', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
            ou
          </span>
          <div className={cn('h-px flex-1', isDark ? 'bg-white/10' : 'bg-black/10')} />
        </div>

        <button
          type="button"
          disabled={oauthLoading}
          onClick={handleGoogleLogin}
          className={cn(
            'flex items-center justify-center gap-2 rounded-[20px] border py-3.5 text-[15px] font-bold disabled:opacity-70',
            isDark
              ? 'border-white/10 bg-[#161b26] text-[#ffffff]'
              : 'border-black/10 bg-white text-[#111827] shadow-sm',
          )}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          {oauthLoading ? 'Redirection…' : 'Continuer avec Google'}
        </button>

        <button
          type="button"
          className="mt-4 text-center text-sm font-bold text-[#ff184e]"
          onClick={() => navigate('/login')}
        >
          Mot de passe oublié ?
        </button>

        <p className={cn('mt-10 text-center text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
          Pas encore de compte ?{' '}
          <button type="button" className="font-extrabold text-[#ff184e]" onClick={() => navigate('/mobile/register')}>
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}
