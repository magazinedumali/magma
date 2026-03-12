import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getUserAvatar, getUserDisplayName } from '@/lib/userHelper';

interface CommentFormProps {
  onAdd: (text: string) => void;
  placeholder?: string;
  sendLabel?: string;
  user?: any;
}

const CommentForm: React.FC<CommentFormProps> = ({ onAdd, placeholder = 'Ajouter un commentaire...', sendLabel = 'Envoyer', user: propUser }) => {
  const [text, setText] = useState('');
  const [user, setUser] = useState<any>(propUser || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propUser) {
      setUser(propUser);
    } else {
      // Fetch user if not provided
      supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
      });
    }
  }, [propUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && user) {
      setLoading(true);
      await onAdd(text.trim());
      setText('');
      setLoading(false);
    }
  };

  const userAvatar = user ? getUserAvatar(user) : '/placeholder.svg';
  const displayName = user ? getUserDisplayName(user) : 'Utilisateur';

  return (
    <form className="flex items-start gap-4 mb-0" onSubmit={handleSubmit}>
      <img 
        src={userAvatar} 
        alt={displayName} 
        className="w-12 h-12 rounded-full object-cover mt-1 border border-white/20 shadow-md"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <div className="flex-1">
        {user ? (
          <>
            <textarea
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl p-4 focus:border-[#ff184e] focus:ring-1 focus:ring-[#ff184e] transition mb-3 resize-none text-sm"
              rows={3}
              placeholder={placeholder}
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={loading}
            />
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={loading || !text.trim()}
                className="bg-[#ff184e] hover:bg-[#ff184e]/80 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(255,24,78,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : sendLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="border border-white/10 bg-white/5 rounded-xl p-6 text-center shadow-inner">
            <p className="text-gray-300 font-medium mb-4">Connectez-vous pour commenter cet article</p>
            <div className="flex gap-3 justify-center">
              <a href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-lg font-bold transition-colors text-sm">
                Se connecter
              </a>
              <a href="/register" className="bg-[#ff184e] hover:bg-[#ff184e]/80 shadow-[0_0_15px_rgba(255,24,78,0.4)] text-white px-5 py-2.5 rounded-lg font-bold transition-all text-sm">
                Créer un compte
              </a>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default CommentForm; 