import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import "./login-glass.css";

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
    <div className="login-bg-glass">
      <div className="login-glass-card">
        <h2 className="login-glass-title">SuperAdmin</h2>
        <form onSubmit={handleSubmit} className="login-glass-form">
          <input
            type="email"
            required
            placeholder="Adresse e-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="login-glass-input"
          />
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-glass-input"
          />
          {error && <div className="login-glass-error">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="login-glass-btn"
          >
            {loading ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  );
} 