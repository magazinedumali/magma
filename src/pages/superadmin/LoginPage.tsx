import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      navigate("/superadmin/apparence");
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32 }}>
      <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 24, textAlign: 'center' }}>Connexion Super Admin</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
        <input type="password" required placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2' }} />
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{loading ? 'Connexion...' : 'Se connecter'}</button>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 15 }}>
        Pas de compte ? <a href="/superadmin/register" style={{ color: '#4f8cff', textDecoration: 'underline' }}>Créer un compte</a>
      </div>
    </div>
  );
} 