import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Download, Globe, CreditCard, LogOut, ChevronRight, Settings } from 'lucide-react';
import { getUserAvatar } from '@/lib/userHelper';
import MobileBottomNav from './MobileBottomNav';
import { compressImageFile } from '@/lib/compressImage';

export default function MobileProfile() {
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/mobile/login');
        return;
      }
      setUser(data.user);
      setName(data.user.user_metadata?.name || 'Utilisateur');
      setUsername(data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'username');
      setAvatar(getUserAvatar(data.user));
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
    const file = await compressImageFile(avatarFile, {
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.85,
      skipBelowBytes: 0,
    });
    const fileExt = file.name.split('.').pop() || 'webp';
    const fileName = `${user.id}_${Date.now()}.${fileExt}`;
    const { data, error: upErr } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
    if (upErr) {
      setError("Erreur lors de l'upload de la photo de profil");
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const handleUpdateAvatar = async () => {
    setError('');
    setSuccess('');
    if (!avatarFile) {
      setError('Veuillez sélectionner une photo.');
      return;
    }
    const uploadedUrl = await uploadAvatar();
    if (!uploadedUrl) return;
    setAvatar(uploadedUrl);
    const { error: updErr } = await supabase.auth.updateUser({ data: { avatar_url: uploadedUrl } });
    if (updErr) {
      setError(updErr.message);
      return;
    }
    setSuccess('Photo de profil mise à jour !');
    setAvatarFile(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/mobile');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0d14] pb-[calc(80px+env(safe-area-inset-bottom,0px))] text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button type="button" onClick={() => navigate(-1)} className="p-2" aria-label="Retour">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="-ml-8 flex-1 text-center text-lg font-extrabold">Mon profil</h1>
        <button type="button" className="p-2" onClick={() => navigate('/mobile/settings')} aria-label="Réglages">
          <Settings size={22} className="text-white" />
        </button>
      </div>

      <div className="mb-6 mt-4 flex items-start gap-4 px-6">
        <div className="relative">
          {avatar && avatar !== '/placeholder.svg' ? (
            <img
              src={avatar}
              alt=""
              className="h-32 w-32 rounded-full border-4 border-[#161b26] object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#161b26] bg-[#161b26]">
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
            <Camera size={20} className="text-[#ff184e]" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          {avatarFile && (
            <button
              type="button"
              className="absolute bottom-[-2.5rem] left-1/2 mt-2 -translate-x-1/2 rounded-xl bg-[#ff184e] px-4 py-2 text-sm font-semibold text-white shadow"
              onClick={handleUpdateAvatar}
            >
              Enregistrer la photo
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <div className="text-xl font-bold">{name}</div>
          <div className="text-base text-[#9ba5be]">@{username}</div>
          <button
            type="button"
            className="mt-3 rounded-xl bg-[#ff184e] px-5 py-2 text-base font-semibold text-white"
            onClick={() => navigate('/mobile/settings')}
          >
            Modifier le profil
          </button>
          {error && <div className="mt-2 text-sm text-[#ef4444]">{error}</div>}
          {success && <div className="mt-2 text-sm text-[#10b981]">{success}</div>}
        </div>
      </div>

      <div className="mx-4 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#161b26]">
        <ProfileAction icon={<Heart size={22} className="text-[#9ba5be]" />} label="Favoris" />
        <ProfileAction icon={<Download size={22} className="text-[#9ba5be]" />} label="Téléchargements" />
        <ProfileAction icon={<Globe size={22} className="text-[#9ba5be]" />} label="Langue" />
        <ProfileAction icon={<CreditCard size={22} className="text-[#9ba5be]" />} label="Abonnement" />
        <ProfileAction
          icon={<LogOut size={22} className="text-[#ff184e]" />}
          label={<span className="text-[#ff184e]">Déconnexion</span>}
          onClick={handleLogout}
        />
      </div>

      <MobileBottomNav user={user} />
    </div>
  );
}

function ProfileAction({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between bg-transparent px-5 py-4 text-left transition hover:bg-white/5"
    >
      <span className="flex items-center gap-4 text-base font-medium text-white">
        {icon}
        <span>{label}</span>
      </span>
      <ChevronRight size={20} className="text-[#9ba5be]/50 transition group-hover:text-[#ff184e]" />
    </button>
  );
}
