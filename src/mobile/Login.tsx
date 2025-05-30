import React, { useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function MobileLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      // Enrichir la localisation si besoin
      if (data.user && !data.user.user_metadata?.country) {
        try {
          const ipRes = await fetch('https://api.ipify.org?format=json');
          const { ip } = await ipRes.json();
          const geoRes = await fetch(`https://ipapi.co/${ip}/country_name/`);
          const country = await geoRes.text();
          if (country && country.length < 40) {
            await supabase.auth.updateUser({ data: { ...data.user.user_metadata, country } });
          }
        } catch (e) { /* ignore */ }
      }
      navigate('/mobile');
    }
  };

  return (
    <div className="min-h-screen h-screen w-full flex flex-col justify-center items-center bg-white px-4 overflow-hidden relative transition-colors duration-300">
      <button onClick={() => navigate(-1)} className="absolute top-6 left-4 p-2 z-10">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <img src="/logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-8" loading="lazy" />
      <h1 className="text-3xl font-bold text-center mb-8 text-[#222]">Connexion</h1>
      <form onSubmit={handleLogin} className="w-full max-w-xs">
        <label className="block text-gray-500 text-sm mb-1" htmlFor="email">Adresse e-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-6 px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-[#ff184e] focus:ring-0 focus:outline-none text-base bg-transparent transition-colors duration-200"
          placeholder="Votre adresse e-mail"
          required
          autoComplete="email"
        />
        <label className="block text-gray-500 text-sm mb-1" htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 px-0 py-2 border-0 border-b-2 border-gray-200 focus:border-[#ff184e] focus:ring-0 focus:outline-none text-base bg-transparent transition-colors duration-200"
          placeholder="Votre mot de passe"
          required
          autoComplete="current-password"
        />
        <div className="flex justify-end mb-4">
          <button type="button" className="text-[#ff184e] text-sm font-medium" onClick={() => navigate('/mobile/forgot-password')}>Mot de passe oublié ?</button>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <button type="submit" className="w-full py-3 rounded-xl bg-[#ff184e] text-white font-bold text-lg shadow-md mb-4">Se connecter</button>
      </form>
      <div className="text-gray-400 text-center mt-2">
        Pas encore de compte ?{' '}
        <button className="text-[#ff184e] font-medium" onClick={() => navigate('/mobile/register')}>Créer un compte</button>
      </div>
    </div>
  );
} 