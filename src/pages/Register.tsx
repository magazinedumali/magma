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
    <div className="min-h-screen bg-transparent text-gray-200 relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-[#ff184e]/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* Left side / Image & Testimonial */}
          <div className="md:w-1/2 p-8 md:p-12 bg-black/20 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff184e]/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=facearea&w=600&q=80" 
                alt="Communauté" 
                className="w-full h-48 md:h-64 object-cover rounded-xl mb-6 shadow-lg border border-white/10" 
              />
              <blockquote className="text-xl md:text-2xl font-jost font-medium text-white mb-6 leading-relaxed italic">
                « Rejoignez la première communauté tech et culture au Mali. Une mine d'informations et d'inspiration au quotidien. »
              </blockquote>
              <div className="font-bold text-[#ff184e] tracking-wider uppercase text-sm">Mariam T.</div>
              <div className="text-gray-400 text-sm">Rédactrice en chef</div>
            </div>
          </div>

          {/* Right side / Form */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white/5 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <h2 className="text-3xl font-jost font-bold text-white mb-2">Créer un compte</h2>
              <p className="text-gray-400 mb-8 text-sm">Rejoignez-nous et profitez de tous les avantages.</p>
              
              <div className="space-y-5 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Adresse e-mail</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm"
                    placeholder="vous@exemple.com"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff184e] focus:border-[#ff184e] placeholder-gray-500 transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#ff184e] text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(255,24,78,0.4)] hover:shadow-[0_0_25px_rgba(255,24,78,0.6)] hover:bg-[#ff184e]/90 transition-all mb-6 text-sm"
              >
                S'inscrire
              </button>

              <div className="text-center text-sm text-gray-400">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-[#ff184e] hover:text-[#ff184e]/80 font-semibold transition-colors">Connectez-vous</Link>
              </div>
              
              {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">{error}</div>}
              {success && <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm text-center">{success}</div>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 