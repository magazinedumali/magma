import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate('/login');
        return;
      }
      setUser(data.user);
      setName(data.user.user_metadata?.name || '');
      setEmail(data.user.email);
      setAvatar(data.user.user_metadata?.avatar_url || '');
    });

    // Simple mobile detection
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      navigate('/mobile/profile', { replace: true });
    }
  }, [navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatar(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!avatar && !avatarFile) {
      setError('La photo de profil est obligatoire.');
      return;
    }
    let avatarUrl = avatar;
    if (avatarFile) {
      const uploadedUrl = await uploadAvatar();
      if (!uploadedUrl) return;
      avatarUrl = uploadedUrl;
      setAvatar(avatarUrl);
    }
    const { error } = await supabase.auth.updateUser({ data: { name, avatar_url: avatarUrl } });
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Profil mis à jour !');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (!currentPassword || !password) {
      setPwError('Les deux champs sont obligatoires.');
      return;
    }
    // Vérifier le mot de passe actuel
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (signInError) {
      setPwError('Le mot de passe actuel est incorrect.');
      return;
    }
    // Changer le mot de passe
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPwError(error.message);
      return;
    }
    setPwSuccess('Mot de passe mis à jour !');
    setPassword('');
    setCurrentPassword('');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', minWidth: 340 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24, position: 'relative' }}>
            {avatar ? (
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <img src={avatar} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 12, objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Changer la photo"
                >
                  <Camera size={18} color="#ff184e" />
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#bbb', marginBottom: 12 }}>👤</div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    background: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Ajouter une photo"
                >
                  <Camera size={18} color="#ff184e" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 4 }}>{name || 'Utilisateur'}</div>
            <div style={{ color: '#888', fontSize: 15 }}>{email}</div>
          </div>
          <form onSubmit={handleUpdate} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Nom</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
            {success && <div style={{ color: 'green', marginTop: 10 }}>{success}</div>}
            {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
          </form>
          <form onSubmit={handlePasswordChange} style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="currentPassword" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mot de passe actuel</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
                required
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#222', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }}>
              Changer le mot de passe
            </button>
            {pwSuccess && <div style={{ color: 'green', marginTop: 10 }}>{pwSuccess}</div>}
            {pwError && <div style={{ color: 'red', marginTop: 10 }}>{pwError}</div>}
          </form>
          <button onClick={handleLogout} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#eee', color: '#ff184e', border: 'none', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Déconnexion
          </button>
          <button type="submit" form="" onClick={handleUpdate} style={{ width: '100%', padding: 12, borderRadius: 6, background: '#ff184e', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }} disabled={!avatar && !avatarFile}>
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 