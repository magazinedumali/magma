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
    <div className="min-h-screen bg-transparent text-gray-200 relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0B0F19]">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-[#ff184e]/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="glass-panel border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* Left side / Image & Testimonial */}
          <div className="md:w-1/2 p-8 md:p-12 bg-black/20 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff184e]/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <img 
                src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=600&q=80" 
                alt="Témoignage" 
                className="w-full h-48 md:h-64 object-cover rounded-xl mb-6 shadow-lg border border-white/10" 
              />
              <blockquote className="text-xl md:text-2xl font-jost font-medium text-white mb-6 leading-relaxed italic">
                « Un contenu d'une qualité exceptionnelle. Une newsletter qui m'accompagne tous les jours pour mieux comprendre l'actualité malienne et internationale. »
              </blockquote>
              <div className="font-bold text-[#ff184e] tracking-wider uppercase text-sm">Amadou S.</div>
              <div className="text-gray-400 text-sm">Abonné Magma depuis 2023</div>
            </div>
          </div>

          {/* Right side / Form */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white/5 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <h2 className="text-3xl font-jost font-bold text-white mb-2">Bon retour</h2>
              <p className="text-gray-400 mb-8 text-sm">Veuillez entrer vos identifiants pour vous connecter.</p>
              
              <div className="space-y-5 mb-8">
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
                disabled={loading}
                className="w-full bg-[#ff184e] text-white font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(255,24,78,0.4)] hover:shadow-[0_0_25px_rgba(255,24,78,0.6)] hover:bg-[#ff184e]/90 transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
              
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">ou</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors mb-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Continuer avec Google
              </button>

              <div className="text-center text-sm text-gray-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-[#ff184e] hover:text-[#ff184e]/80 font-semibold transition-colors">Inscrivez-vous</Link>
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

export default Login; 