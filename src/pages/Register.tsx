import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabaseClient';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Inscription Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    // (Optionnel) Ajouter à la table users
    if (data.user) {
      await supabase.from('users').insert({ id: data.user.id, email, name, role: 'user' });
      // Enrichir la localisation si besoin
      if (!data.user.user_metadata?.country) {
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
    }
    setSuccess('Inscription réussie ! Vérifiez votre email pour valider votre compte.');
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
        {/* Right side - Register form */}
        <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem 2rem', minWidth: 0 }}>
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 350 }}>
            <h2 style={{ marginBottom: 8, fontSize: 28, fontWeight: 700, color: '#222' }}>Créer un compte</h2>
            <p style={{ color: '#888', marginBottom: 24, fontSize: 15 }}>Rejoignez-nous et profitez de tous les avantages.</p>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Nom</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
              />
            </div>
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
            <button type="submit" style={{ width: '100%', padding: 12, borderRadius: 6, background: '#ff184e', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              S'inscrire
            </button>
            <div style={{ textAlign: 'center', color: '#888', fontSize: 15 }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#ff184e', textDecoration: 'underline' }}>Connectez-vous</Link>
            </div>
            {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 10 }}>{success}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 