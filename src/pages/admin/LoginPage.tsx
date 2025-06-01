import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import './login-glass.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/admin');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg-glass">
      <div className="login-glass-card">
        <h2 className="login-glass-title">Administrateur</h2>
        <form onSubmit={handleLogin} className="login-glass-form">
          <input
            type="email"
            required
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-glass-input"
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-glass-input"
          />
          {error && <div className="login-glass-error">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="login-glass-btn"
          >
            {loading ? 'Connexion...' : 'SE CONNECTER'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 