import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface PollOption {
  id: number;
  poll_id: number;
  label: string;
  votes: number;
}

interface PollData {
  id: number;
  question: string;
  image_url?: string;
}

const Poll = ({ compact = false }: { compact?: boolean }) => {
  const [loading, setLoading] = useState(true);
  const [poll, setPoll] = useState<PollData | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoll();
  }, []);

  const fetchPoll = async () => {
    setLoading(true);
    setError('');
    // Récupérer le sondage actif
    const { data: pollData, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (pollError || !pollData) {
      setError("Aucun sondage actif");
      setLoading(false);
      return;
    }
    setPoll(pollData);
    // Vérifier si l'utilisateur a déjà voté à ce sondage
    if (localStorage.getItem('poll_voted_' + pollData.id)) setVoted(true);
    // Récupérer les options
    const { data: optionsData, error: optionsError } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', pollData.id)
      .order('id');
    if (optionsError || !optionsData) {
      setError("Erreur lors du chargement des options");
      setLoading(false);
      return;
    }
    setOptions(optionsData);
    setLoading(false);
  };

  const handleVote = async (optionId: number) => {
    if (!poll || voted) return;
    setLoading(true);
    const { error: voteError } = await supabase
      .from('poll_options')
      .update({ votes: options.find(o => o.id === optionId)!.votes + 1 })
      .eq('id', optionId);
    if (!voteError) {
      setVoted(true);
      localStorage.setItem('poll_voted_' + poll.id, '1');
      fetchPoll();
    } else {
      setError(voteError.message);
    }
    setLoading(false);
  };

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);
  const percent = (n: number) => totalVotes ? Math.round((n / totalVotes) * 100) : 0;

  if (loading) return <div className="text-center py-8">Chargement du sondage…</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path d="M12 20h9" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="10" r="6" stroke="#ff184e" strokeWidth="2"/><path d="M9.5 9.5h.01M14.5 9.5h.01" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/><path d="M9.5 13c.5.5 1.5.5 2 0" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/></svg>
      <div className="mt-4 text-lg font-semibold text-[#ff184e]">Aucun sondage n'est actuellement en ligne</div>
      <div className="mt-2 text-gray-500">Revenez plus tard pour participer à nos prochains sondages !</div>
    </div>
  );
  if (!poll) return null;

  return (
    <div className={compact ? "bg-gray-50 rounded-xl p-4 flex flex-col items-center shadow-md" : "bg-gray-50 rounded-xl p-8 flex flex-col items-center shadow-md"}>
      {poll.image_url && (
        <img
          src={poll.image_url}
          alt="Sujet du sondage"
          style={{ width: '100%', height: compact ? 120 : 180, objectFit: 'cover', borderRadius: 16, marginBottom: 20 }}
        />
      )}
      <div className={compact ? "text-center text-gray-700 mb-4 font-semibold text-base" : "text-center text-gray-700 mb-6 font-semibold text-lg"}>{poll.question}</div>
      <div className="flex w-full justify-center gap-4">
        {options.map(option => {
          const isYes = option.label.trim().toLowerCase() === 'oui' || option.label.trim().toLowerCase() === 'yes';
          const bgColor = isYes ? '#22c55e' : '#ff184e';
          return (
            <div
              key={option.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: 9999,
                overflow: 'hidden',
                background: 'transparent',
                minWidth: compact ? 120 : 160,
                height: compact ? 48 : 56,
                boxShadow: '0 1px 4px #0001',
              }}
            >
              <button
                disabled={voted || loading}
                onClick={() => handleVote(option.id)}
                style={{
                  background: bgColor,
                  color: '#fff',
                  border: 'none',
                  outline: 'none',
                  fontWeight: 600,
                  fontSize: compact ? 18 : 20,
                  padding: compact ? '0 18px' : '0 24px',
                  height: '100%',
                  borderTopLeftRadius: 9999,
                  borderBottomLeftRadius: 9999,
                  cursor: voted || loading ? 'default' : 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: voted ? 0.7 : 1,
                  minWidth: compact ? 60 : 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {option.label}
              </button>
              <div
                style={{
                  background: '#f5f6fa',
                  color: '#232b46',
                  fontWeight: 500,
                  fontSize: compact ? 18 : 20,
                  padding: compact ? '0 14px' : '0 18px',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderTopRightRadius: 9999,
                  borderBottomRightRadius: 9999,
                  minWidth: compact ? 40 : 56,
                  justifyContent: 'center',
                }}
              >
                {option.votes} vote{option.votes > 1 ? 's' : ''}
              </div>
            </div>
          );
        })}
      </div>
      {voted && <div className="mt-4 text-green-600 font-medium">Merci pour votre vote !</div>}
      {totalVotes > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center w-full">Total&nbsp;: {totalVotes} vote{totalVotes > 1 ? 's' : ''}</div>
      )}
    </div>
  );
};

export default Poll; 