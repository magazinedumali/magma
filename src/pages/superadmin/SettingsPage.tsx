import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
      setError(err.message || "Erreur lors de la mise à jour de l'email.");
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
      setError(err.message || "Erreur lors de la mise à jour du mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif', maxWidth: 800 }}>
      <h2 style={{ marginBottom: 32 }}>Paramètres</h2>
      
      {error && <div style={{ color: 'red', marginBottom: 16, padding: 12, background: '#fee', borderRadius: 6 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: 16, padding: 12, background: '#efe', borderRadius: 6 }}>{success}</div>}

      {/* Section Email */}
      <div style={{ marginBottom: 32, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <h3 style={{ marginBottom: 16 }}>Modifier l'email</h3>
        <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              alignSelf: 'flex-start'
            }}
          >
            {loading ? 'Mise à jour...' : "Mettre à jour l'email"}
          </button>
        </form>
      </div>

      {/* Section Mot de passe */}
      <div style={{ marginBottom: 32, padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <h3 style={{ marginBottom: 16 }}>Modifier le mot de passe</h3>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Nouveau mot de passe</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              required
              minLength={6}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              required
              minLength={6}
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px 20px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              alignSelf: 'flex-start'
            }}
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>

      {/* Informations utilisateur */}
      <div style={{ padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <h3 style={{ marginBottom: 16 }}>Informations du compte</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </div>
          <div>
            <strong>ID utilisateur:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>Dernière connexion:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
          </div>
          <div>
            <strong>Rôle:</strong> Super Admin
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

