import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { getUserAvatar } from '@/lib/userHelper';
import { LoadingBar } from '@/components/ui/loading-bar';
import { motion } from 'framer-motion';

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
  const [loading, setLoading] = useState(false);
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
      setEmail(data.user.email || '');
      setAvatar(getUserAvatar(data.user));
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (!avatar && !avatarFile) {
        setError('La photo de profil est obligatoire.');
        setLoading(false);
        return;
      }
      let avatarUrl = avatar;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (!uploadedUrl) {
          setLoading(false);
          return;
        }
        avatarUrl = uploadedUrl;
        setAvatar(avatarUrl);
      }
      const { error } = await supabase.auth.updateUser({ data: { name, avatar_url: avatarUrl } });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Profil mis à jour !');
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
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
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    
    if (signInError) {
      setPwError('Le mot de passe actuel est incorrect.');
      return;
    }
    
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
    <div className="min-h-screen bg-transparent text-gray-200 font-jost selection:bg-[#ff184e]/30">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#ff184e]/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-xl glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/10 p-1 bg-white/5 shadow-2xl relative group">
                  <img 
                    src={avatar || '/placeholder.svg'} 
                    alt={name} 
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Icon icon="solar:camera-bold-duotone" className="text-white text-3xl" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 bg-[#ff184e] text-white p-2.5 rounded-xl shadow-lg border-2 border-[#0B0F19] hover:scale-110 transition-transform shadow-[#ff184e]/30"
                >
                  <Icon icon="solar:camera-bold-duotone" className="text-lg" />
                </button>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-1 uppercase tracking-tighter">{name || 'Utilisateur'}</h1>
              <p className="text-gray-400 font-medium">{email}</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="space-y-10">
              {/* Profile Settings */}
              <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Icon icon="solar:user-bold-duotone" className="text-[#ff184e] text-lg" />
                  Informations Personnelles
                </h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nom complet</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-[#ff184e] transition-all"
                      placeholder="Votre nom"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#ff184e] hover:bg-[#ff184e]/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#ff184e]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <LoadingBar variant="inline" className="h-0.5 min-w-[40px] max-w-12 bg-white/30" />}
                    Mettre à jour le profil
                  </button>
                  {success && <div className="text-green-400 text-sm font-medium bg-green-400/10 p-3 rounded-lg text-center border border-green-400/20">{success}</div>}
                  {error && <div className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg text-center border border-red-400/20">{error}</div>}
                </form>
              </section>

              {/* Password Settings */}
              <section className="pt-8 border-t border-white/5">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Icon icon="solar:lock-password-bold-duotone" className="text-[#ff184e] text-lg" />
                  Sécurité du compte
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-[#ff184e] transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 focus:ring-[#ff184e] transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-xl transition-all">
                    Changer le mot de passe
                  </button>
                  {pwSuccess && <div className="text-green-400 text-sm font-medium bg-green-400/10 p-3 rounded-lg text-center border border-green-400/20">{pwSuccess}</div>}
                  {pwError && <div className="text-red-400 text-sm font-medium bg-red-400/10 p-3 rounded-lg text-center border border-red-400/20">{pwError}</div>}
                </form>
              </section>

              <button 
                onClick={handleLogout} 
                className="w-full py-4 text-gray-500 font-bold hover:text-[#ff184e] transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              >
                <Icon icon="solar:logout-bold-duotone" className="text-xl" />
                Déconnexion
              </button>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;