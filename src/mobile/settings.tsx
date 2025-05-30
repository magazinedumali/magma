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
        navigate('/login');
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
    <div className="min-h-screen bg-white flex flex-col pb-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="p-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-[#1a2746]">Modifier le profil</h1>
        <button onClick={handleSave} className="p-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      {/* Avatar */}
      <div className="flex flex-col items-center mt-2 mb-6">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow" loading="lazy" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#cbd5e1"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#cbd5e1"/></svg>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow border"
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
            className="mt-3 px-4 py-2 rounded-xl bg-[#ff184e] text-white font-semibold text-sm shadow"
            onClick={async () => { await handleSave(); setAvatarFile(null); }}
          >
            Télécharger la photo
          </button>
        )}
      </div>
      {/* Form */}
      <form className="flex flex-col gap-4 px-4">
        <div>
          <label className="block font-bold mb-1 text-[#1a2746]" htmlFor="name">Nom</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-4 py-3 text-base font-medium transition-colors duration-200"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="block font-bold mb-1 text-[#1a2746]" htmlFor="email">Adresse e-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-4 py-3 text-base font-medium transition-colors duration-200"
            placeholder="Votre adresse e-mail"
          />
        </div>
        <div>
          <label className="block font-bold mb-1 text-[#1a2746]" htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-4 py-3 text-base font-medium transition-colors duration-200"
            placeholder="Nom d'utilisateur"
          />
        </div>
        <div>
          <label className="block font-bold mb-1 text-[#1a2746]" htmlFor="password">Mot de passe</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl bg-gray-100 px-4 py-3 text-base font-medium pr-10 transition-colors duration-200"
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1 text-[#1a2746]" htmlFor="phone">Téléphone</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full rounded-xl bg-gray-100 px-4 py-3 text-base font-medium transition-colors duration-200"
            placeholder="Numéro de téléphone"
          />
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </form>
    </div>
  );
} 