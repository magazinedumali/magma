import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff } from 'lucide-react';

export default function MobileSettings() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/mobile/login');
        return;
      }
      setUser(data.user);
      setName(data.user.user_metadata?.name || '');
      setEmail(data.user.email || '');
      setUsername(data.user.user_metadata?.username || '');
      setAvatar(data.user.user_metadata?.avatar_url || '');
      setPhone(data.user.user_metadata?.phone || '');
    });
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return null;
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile, { upsert: true });
    if (error) {
      setError("Erreur lors de l'upload de la photo de profil");
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    let avatarUrl = avatar;
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (!uploadedUrl) return;
      avatarUrl = uploadedUrl;
      setAvatar(avatarUrl);
    }
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      email,
      password: password || undefined,
      data: { name, username, avatar_url: avatarUrl, phone },
    });
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Profil mis à jour !');
    navigate(-1); // Retour à la page précédente
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0d14] pb-8 text-white transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button type="button" onClick={() => navigate(-1)} className="p-2" aria-label="Retour">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="text-center text-lg font-extrabold">Modifier le profil</h1>
        <button type="button" onClick={handleSave} className="p-2" aria-label="Enregistrer">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {/* Avatar */}
      <div className="mb-6 mt-4 flex flex-col items-center">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt=""
              className="h-28 w-28 rounded-full border-4 border-[#161b26] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-[#161b26] bg-[#161b26]">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#9ba5be" />
                <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#9ba5be" />
              </svg>
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 rounded-full border border-white/10 bg-[#161b26] p-1.5 shadow"
            title="Changer la photo"
          >
            <Camera size={22} className="text-[#ff184e]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        {avatarFile && (
          <button
            type="button"
            className="mt-3 rounded-xl bg-[#ff184e] px-4 py-2 text-sm font-semibold text-white shadow"
            onClick={async () => {
              await handleSave();
              setAvatarFile(null);
            }}
          >
            Télécharger la photo
          </button>
        )}
      </div>
      <form className="flex flex-col gap-4 px-4">
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="name">
            Nom
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
            placeholder="Votre nom"
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
            className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
            placeholder="Votre adresse e-mail"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="username">
            Nom d&apos;utilisateur
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
            placeholder="Nom d'utilisateur"
          />
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="password">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3 pr-11 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ba5be]"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-[13px] font-bold text-[#9ba5be]" htmlFor="phone">
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-[#161b26] px-4 py-3 text-base text-white outline-none placeholder:text-[#9ba5be] focus:border-[#ff184e]/40"
            placeholder="Numéro de téléphone"
          />
        </div>
        {error && <div className="mt-2 text-sm text-[#ef4444]">{error}</div>}
        {success && <div className="mt-2 text-sm text-[#10b981]">{success}</div>}
      </form>
    </div>
  );
} 