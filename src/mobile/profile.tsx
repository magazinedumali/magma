import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Download, Globe, MapPin, CreditCard, Trash2, Clock, LogOut, ChevronRight, Settings, Bell, Bookmark, User, Search as SearchIcon, PlayCircle } from 'lucide-react';

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
        navigate('/login');
        return;
      }
      setUser(data.user);
      setName(data.user.user_metadata?.name || 'Utilisateur');
      setUsername(data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'username');
      setAvatar(data.user.user_metadata?.avatar_url || '');
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
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: uploadedUrl } });
    if (error) {
      setError(error.message);
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
    <div className="min-h-screen bg-[#fafbfc] pb-6 flex flex-col transition-colors duration-300">
      {/* Header (retour + settings + titre) */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2">
        <button onClick={() => navigate(-1)} className="p-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h1 className="flex-1 text-center text-xl font-bold -ml-8 text-[#1a2746]">Mon Profil</h1>
        <button className="p-2" onClick={() => navigate('/mobile/settings')}>
          <Settings size={22} className="text-[#1a2746]" />
                </button>
              </div>
      {/* Avatar, name, username, edit button */}
      <div className="flex items-center gap-4 px-6 mt-2 mb-6">
        <div className="relative">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow" loading="lazy" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow">
              {/* Default social profile icon SVG */}
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
          {avatarFile && (
            <button
              className="absolute left-1/2 -translate-x-1/2 bottom-[-2.5rem] px-4 py-2 rounded-xl bg-[#ff184e] text-white font-semibold text-sm shadow mt-2"
              onClick={handleUpdateAvatar}
            >
              Télécharger la photo
            </button>
          )}
        </div>
        <div className="flex-1">
          <div className="text-xl font-bold text-[#222]">{name}</div>
          <div className="text-gray-500 text-base">@{username}</div>
          <button className="mt-2 px-5 py-2 rounded-xl bg-[#ff184e] text-white font-semibold text-base" onClick={() => navigate('/mobile/settings')}>Modifier le profil</button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
        </div>
      </div>
      {/* Actions list */}
      <div className="bg-white rounded-2xl mx-4 shadow divide-y transition-colors duration-300">
        <ProfileAction icon={<Heart size={22} className="text-[#1a2746]" />} label="Favoris" />
        <ProfileAction icon={<Download size={22} className="text-[#1a2746]" />} label="Téléchargements" />
        <ProfileAction icon={<Globe size={22} className="text-[#1a2746]" />} label="Langue" />
        <ProfileAction icon={<CreditCard size={22} className="text-[#1a2746]" />} label="Abonnement" />
        <ProfileAction icon={<LogOut size={22} className="text-[#ff184e]" />} label={<span className="text-[#ff184e]">Déconnexion</span>} onClick={handleLogout} />
      </div>
      {/* Bottom Navigation - Fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center h-16 z-50 shadow-lg transition-colors duration-300">
        <button className="flex flex-col items-center text-[#ff184e]" onClick={() => navigate('/mobile')}>
          {/* Nouveau home icon moderne */}
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M3 12L12 5l9 7v7a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3H9v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-7z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff"/></svg>
        </button>
        <button className="flex flex-col items-center text-[#1a2746]">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M12 3v18M8 7v10M16 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="flex flex-col items-center text-[#1a2746]">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="flex flex-col items-center text-[#1a2746]" onClick={() => navigate('/mobile/profile')}>
          <User size={28} />
        </button>
      </nav>
    </div>
  );
}

function ProfileAction({ icon, label, onClick }: { icon: React.ReactNode, label: React.ReactNode, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-5 py-4 bg-transparent hover:bg-gray-50 focus:bg-gray-100 transition group justify-between"
    >
      <span className="flex items-center gap-4 text-lg">
        {icon}
        <span>{label}</span>
      </span>
      <ChevronRight size={22} className="text-gray-300 group-hover:text-[#ff184e] transition" />
    </button>
  );
} 