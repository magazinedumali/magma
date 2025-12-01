import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabaseClient';
import { getOAuthRedirectUrl } from '@/lib/authHelpers';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Connexion Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess('Connexion réussie !');
    // Enrichir la localisation si besoin
    if (data.user && !data.user.user_metadata?.country) {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        const geoRes = await fetch(`https://ipapi.co/${ip}/country_name/`);
        const country = await geoRes.text();
        if (country && country.length < 40) {
          await supabase.auth.updateUser({ data: { ...data.user.user_metadata, country } });
        }
      } catch (e) { /* ignore */ }
    }
    setTimeout(() => navigate('/'), 1000);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const redirectUrl = getOAuthRedirectUrl();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      }
      // Note: L'utilisateur sera redirigé vers Google, donc on ne met pas à jour loading ici
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion avec Google');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <Header />
      <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
        {/* Left side - Testimonial and image */}
        <div style={{ flex: 1, background: '#e9eaf0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', minWidth: 0 }}>
          <div style={{ maxWidth: 400, textAlign: 'left' }}>
            <img src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&q=80" alt="Témoignage" style={{ width: '100%', borderRadius: '8px', marginBottom: 24, objectFit: 'cover', height: 260 }} />
            <blockquote style={{ fontSize: 22, fontWeight: 500, color: '#222', marginBottom: 24, lineHeight: 1.3 }}>
              « Nous utilisons Untitled pour démarrer chaque nouveau projet et nous ne pouvons plus nous en passer. »
            </blockquote>
            <div style={{ color: '#444', fontWeight: 600 }}>Olivia Rhye</div>
            <div style={{ color: '#888', fontSize: 14 }}>Lead Designer, Layers<br />Web Development Agency</div>
          </div>
        </div>
        {/* Right side - Login form */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', minWidth: 0 }}>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 350 }}>
            <h2 style={{ marginBottom: 8, fontSize: 28, fontWeight: 700, color: '#222' }}>Connexion à votre compte</h2>
            <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>Ravi de vous revoir ! Veuillez entrer vos identifiants.</p>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Adresse e-mail</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', 
                padding: 12, 
                borderRadius: 6, 
                background: '#ff184e', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 600, 
                fontSize: 16, 
                marginBottom: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }}></div>
              <span style={{ padding: '0 12px', color: '#888', fontSize: 14 }}>ou</span>
              <div style={{ flex: 1, height: 1, background: '#e0e0e0' }}></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 6,
                background: '#fff',
                color: '#222',
                border: '1px solid #ccc',
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 16,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M17.64 9.20454C17.64 8.56636 17.5827 7.95272 17.4764 7.36363H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H15.9564C17.1582 14.7527 17.64 13.2109 17.64 9.20454Z"
                  fill="#4285F4"
                />
                <path
                  d="M9 18C11.43 18 13.467 17.1941 14.9564 15.8195L11.0477 13.5613C10.2418 14.1013 9.21091 14.4204 9 14.4204C6.65455 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z"
                  fill="#34A853"
                />
                <path
                  d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40681 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65455 3.57955 9 3.57955Z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>

            <div style={{ textAlign: 'center', color: '#888', fontSize: 15 }}>
              Pas encore de compte ?{' '}
              <Link to="/register" style={{ color: '#ff184e', textDecoration: 'underline' }}>Inscrivez-vous</Link>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 10, marginTop: 10 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 10, marginTop: 10 }}>{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login; 