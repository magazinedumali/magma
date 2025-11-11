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
        className="w-12 h-12 rounded-full object-cover mt-1 border-2 border-gray-200"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
      <div className="flex-1">
        {user ? (
          <>
            <textarea
              className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-[#ff184e] focus:ring-2 focus:ring-[#ff184e] transition mb-2 resize-none text-base"
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
                className="bg-[#ff184e] hover:bg-red-600 text-white px-6 py-2 rounded-xl font-semibold shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi...' : sendLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 mb-3">Connectez-vous pour commenter</p>
            <div className="flex gap-2 justify-center">
              <a href="/login" className="bg-[#4f8cff] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg font-semibold transition">
                Se connecter
              </a>
              <a href="/register" className="bg-[#ff184e] hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition">
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