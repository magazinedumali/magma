import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function MobileRegister() {
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

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0a0d14] text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full"
          onClick={() => navigate(-1)}
          aria-label="Retour"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
        <h1 className="text-lg font-extrabold">Inscription</h1>
        <span className="w-11" />
      </header>

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#161b26]">
            <img src="/logo.png" alt="" className="h-[82%] w-[82%] object-contain" loading="lazy" />
          </div>
        </div>

        <form onSubmit={handleRegister} className="mx-auto w-full max-w-xs space-y-4">
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="name">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3.5 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/50"
              placeholder="Votre nom"
              required
              autoComplete="name"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3.5 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/50"
              placeholder="Votre adresse e-mail"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3.5 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/50"
              placeholder="Votre mot de passe"
              required
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm text-[#ef4444]">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-[20px] bg-[#ff184e] py-4 text-base font-extrabold text-white shadow-lg"
          >
            Créer un compte
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#9ba5be]">
          Vous avez déjà un compte ?{' '}
          <button type="button" className="font-extrabold text-[#ff184e]" onClick={() => navigate('/mobile/login')}>
            Se connecter
          </button>
        </p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex w-full animate-fadeInUp flex-col items-center rounded-t-3xl border-t border-white/10 bg-[#161b26] p-6 pb-10 shadow-2xl">
            <h2 className="mb-2 mt-2 text-center text-xl font-bold text-white">Complétez votre profil</h2>
            <p className="mb-6 text-center text-sm text-[#9ba5be]">
              Ajoutez une photo de profil depuis les réglages pour une meilleure expérience.
            </p>
            <button
              type="button"
              className="w-full rounded-[20px] bg-[#ff184e] py-3.5 text-base font-extrabold text-white"
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
