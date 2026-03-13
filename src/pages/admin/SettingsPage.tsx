import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Lock, CheckCircle, Shield, User, Clock, ShieldCheck } from 'lucide-react';
import { LoadingBar } from '@/components/ui/loading-bar';

const SettingsPage = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser(currentUser);
        setForm(f => ({ ...f, email: currentUser.email || '' }));
      }
    };
    fetchUser();
  }, []);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: form.email });
      if (error) throw error;
      setSuccess('Email mis à jour avec succès !');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'email.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword
      });
      if (error) throw error;
      setSuccess('Mot de passe mis à jour avec succès !');
      setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-jost text-[var(--text-primary)] max-w-5xl mx-auto py-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Paramètres système</h2>
        <p className="text-[var(--text-muted)] text-sm mt-2">Gérez vos informations personnelles et paramètres de sécurité</p>
      </div>
      
      {(error || success) && (
        <div className="mb-8 flex flex-col gap-3">
          {error && (
             <div className="flex items-center gap-3 text-red-400 font-medium bg-red-500/10 p-4 rounded-2xl border border-red-500/20 animate-fadeIn shadow-[0_4px_16px_rgba(239,68,68,0.1)]">
                <Shield className="w-5 h-5" /> {error}
             </div>
          )}
          {success && (
             <div className="flex items-center gap-3 text-emerald-400 font-medium bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 animate-fadeIn shadow-[0_4px_16px_rgba(16,185,129,0.1)]">
                <CheckCircle className="w-5 h-5" /> {success}
             </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
        {/* Section Email */}
        <div className="dark-card h-full flex flex-col hover:border-[var(--accent)] transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-[var(--accent)]/10 p-2.5 rounded-xl border border-[var(--accent)]/20">
                <Mail className="w-6 h-6 text-[var(--accent)]" />
             </div>
             <h3 className="text-xl font-bold text-white">Modifier l'email</h3>
          </div>

          <form onSubmit={handleUpdateEmail} className="flex flex-col gap-6 flex-1">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Adresse Email actuelle</label>
              <div className="relative">
                 <input
                   type="email"
                   value={form.email}
                   onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                   required
                   className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder-[var(--text-muted)]"
                   placeholder="votre@email.com"
                 />
                 <Mail className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-auto w-full bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-semibold shadow-sm flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
              ) : (
                 <>
                   Mettre à jour l'email
                   <CheckCircle className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                 </>
              )}
            </button>
          </form>
        </div>

        {/* Section Mot de passe */}
        <div className="dark-card h-full flex flex-col hover:border-[var(--accent)] transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
                <Lock className="w-6 h-6 text-purple-400" />
             </div>
             <h3 className="text-xl font-bold text-white">Sécurité</h3>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 flex-1">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Nouveau mot de passe</label>
              <div className="relative">
                 <input
                   type="password"
                   value={form.newPassword}
                   onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                   required
                   minLength={6}
                   className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all placeholder-[var(--text-muted)]"
                   placeholder="••••••••"
                 />
                 <Lock className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 ml-1">Au moins 6 caractères requis.</p>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                 <input
                   type="password"
                   value={form.confirmPassword}
                   onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                   required
                   minLength={6}
                   className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all placeholder-[var(--text-muted)]"
                   placeholder="••••••••"
                 />
                 <Lock className="w-5 h-5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-auto w-full bg-purple-500 hover:brightness-110 shadow-[0_4px_16px_rgba(168,85,247,0.4)] text-white px-6 py-3.5 rounded-xl transition-all font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingBar variant="inline" className="h-0.5 min-w-[60px] flex-1 max-w-16 bg-white/30" />
              ) : (
                <>Modifier le mot de passe</>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="dark-card lg:col-span-2 relative overflow-hidden group hover:border-[var(--accent)] transition-colors duration-300">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[var(--accent)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent)]/20 transition-all duration-500"></div>
        
        <div className="relative z-10">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <div className="bg-sky-500/10 p-2.5 rounded-xl border border-sky-500/20">
                 <ShieldCheck className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-white">Détails du compte</h3>
                 <p className="text-sm text-[var(--text-muted)]">Informations techniques de la session courante</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-0.5">
                   <Mail className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Email Actuel</div>
                   <div className="font-medium text-white truncate w-full max-w-[200px]" title={user?.email}>{user?.email || 'N/A'}</div>
                </div>
             </div>
             
             <div className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-0.5">
                   <User className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">ID Utilisateur</div>
                   <div className="font-mono text-xs text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded border border-[var(--accent)]/20 break-all w-fit">
                      {user?.id || 'N/A'}
                   </div>
                </div>
             </div>
             
             <div className="flex items-start gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-0.5">
                   <Clock className="w-5 h-5" />
                </div>
                <div>
                   <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-semibold mb-1">Dernière Connexion</div>
                   <div className="font-medium text-white">
                      {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('fr-FR', {
                         day: 'numeric',
                         month: 'long',
                         year: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                      }) : 'N/A'}
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
