import React, { useState, useRef, useEffect } from "react";
import { X, Edit2, Trash2, Plus, CheckCircle, Image as ImgIcon, Search, UploadCloud, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'polls';
const PAGE_SIZE = 8;

function totalVotes(options: any[]) {
  return options.reduce((s, o) => s + (o.votes || 0), 0);
}

const PollsPage = () => {
  const [search, setSearch] = useState("");
  const [polls, setPolls] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPoll, setEditPoll] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [lightbox, setLightbox] = useState<string|null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // Fetch polls + options from Supabase
  const fetchPolls = async () => {
    setLoading(true);
    setError(null);
    // Fetch polls
    const { data: pollsData, error: pollsError } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
    if (pollsError) { setError(pollsError.message); setLoading(false); return; }
    // Fetch all options
    const { data: optionsData, error: optionsError } = await supabase.from('poll_options').select('*');
    if (optionsError) { setError(optionsError.message); setLoading(false); return; }
    // Map options to polls
    const pollsWithOptions = (pollsData || []).map(poll => ({
      ...poll,
      options: (optionsData || []).filter(opt => opt.poll_id === poll.id)
    }));
    setPolls(pollsWithOptions);
    setLoading(false);
  };
  useEffect(() => { fetchPolls(); }, []);

  // Stats dynamiques
  const total = polls.length;
  const totalActive = polls.filter(p => p.active).length;
  const totalVotesAll = polls.reduce((s, p) => s + totalVotes(p.options || []), 0);

  // Filtrage
  const filtered = polls.filter(p => !search || p.question?.toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Lightbox
  const openLightbox = (url: string) => setLightbox(url);
  const closeLightbox = () => setLightbox(null);

  // Ajout/édition sondage (avec upload image et options)
  const handleSave = async (poll: any, file?: File) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    let imageUrl = poll.image_url;
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `poll-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }
      let pollId = poll.id;
      if (poll.id) {
        // Update poll
        const { error: updateError } = await supabase.from('polls').update({
          question: poll.question,
          image_url: imageUrl,
          active: poll.active,
        }).eq('id', poll.id);
        if (updateError) throw updateError;
        pollId = poll.id;
        // Update options: delete all then re-insert
        await supabase.from('poll_options').delete().eq('poll_id', pollId);
        for (const opt of poll.options) {
          await supabase.from('poll_options').insert({ poll_id: pollId, label: opt.label, votes: opt.votes || 0 });
        }
        setSuccess('Sondage modifié !');
      } else {
        // Insert poll
        const { data: insertData, error: insertError } = await supabase.from('polls').insert([{
          question: poll.question,
          image_url: imageUrl,
          active: poll.active,
          created_at: new Date().toISOString(),
        }]).select();
        if (insertError) throw insertError;
        pollId = insertData?.[0]?.id;
        // Insert options
        for (const opt of poll.options) {
          await supabase.from('poll_options').insert({ poll_id: pollId, label: opt.label, votes: opt.votes || 0 });
        }
        setSuccess('Sondage ajouté !');
      }
      setModalOpen(false);
      setEditPoll(null);
      fetchPolls();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle (table + image storage + options)
  const handleDelete = async (poll: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Supprime image du storage si présente
      if (poll.image_url && poll.image_url.includes('/storage/v1/object/public/polls/')) {
        const path = poll.image_url.split('/storage/v1/object/public/polls/')[1];
        if (path) await supabase.storage.from(BUCKET).remove([path]);
      }
      await supabase.from('poll_options').delete().eq('poll_id', poll.id);
      const { error: delError } = await supabase.from('polls').delete().eq('id', poll.id);
      if (delError) throw delError;
      setSuccess('Sondage supprimé !');
      fetchPolls();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Activation unique
  const handleActivate = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Désactive tous les autres
      await supabase.from('polls').update({ active: false }).neq('id', id);
      // Active celui-ci
      const { error } = await supabase.from('polls').update({ active: true }).eq('id', id);
      if (error) throw error;
      setSuccess('Sondage activé !');
      fetchPolls();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'activation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-[var(--text-primary)]">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold admin-dashboard-title flex items-center gap-2">
            🗳️ Sondages
          </h2>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--text-muted)] mt-2">
            <span className="bg-white/5 px-3 py-1 rounded-full border border-white/10">Total : <b className="text-white">{total}</b></span>
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">Actifs : <b className="text-white">{totalActive}</b></span>
            <span className="bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">Votes : <b className="text-white">{totalVotesAll}</b></span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
          <div className="relative w-full xl:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1); }} 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[var(--accent)] outline-none text-sm text-white transition-colors" 
            />
          </div>
          <button 
            onClick={() => { setEditPoll(null); setModalOpen(true); }} 
            className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold shadow-[0_4px_16px_var(--accent-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-full xl:w-auto justify-center"
          >
            <Plus className="w-5 h-5" /> Créer un sondage
          </button>
        </div>
      </div>

      {/* Feedback visuel */}
      {(loading || error || success) && (
        <div className="w-full mb-6 flex flex-col gap-2">
          {loading && <div className="text-[var(--accent)] font-medium animate-pulse bg-[var(--accent)]/10 p-3 rounded-lg border border-[var(--accent)]/20 text-center">Chargement ou traitement en cours...</div>}
          {error && <div className="text-red-400 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">{error}</div>}
          {success && <div className="text-green-400 font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">{success}</div>}
        </div>
      )}

      {/* Grille de sondages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginated.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center text-[var(--text-muted)] py-20 dark-card">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p className="text-lg font-medium">Aucun sondage trouvé.</p>
          </div>
        ) : (
          paginated.map(poll => (
            <div 
              key={poll.id} 
              className={`dark-card !p-0 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 group border ${poll.active ? 'border-[var(--accent)] shadow-[0_4px_24px_var(--accent-glow)]' : 'border-white/10 hover:border-white/20'}`}
              style={{ padding: 0 }}
            >
              {/* Image sondage */}
              <div 
                className="relative w-full h-40 flex items-center justify-center bg-black/40 overflow-hidden border-b border-white/5 group-hover:bg-black/20 transition-colors" 
              >
                {poll.image_url ? (
                  <>
                    <img src={poll.image_url} alt={poll.question} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105 opacity-80" />
                    <button 
                      onClick={() => openLightbox(poll.image_url)}
                      className="absolute inset-0 m-auto w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      title="Aperçu"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <ImgIcon className="w-16 h-16 text-white/20" />
                )}
                {poll.active && (
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent)] text-white flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    Actif
                  </span>
                )}
              </div>
              
              {/* Infos */}
              <div className="flex-1 flex flex-col p-5 gap-3">
                <div className="font-bold text-[var(--text-primary)] text-lg line-clamp-2" title={poll.question}>{poll.question}</div>
                <div className="text-[var(--text-secondary)] text-xs flex gap-3 mt-auto pt-4 border-t border-white/5">
                  <span className="bg-white/5 px-2 py-1 rounded">{(poll.options || []).length} options</span>
                  <span className="bg-white/5 px-2 py-1 rounded">{totalVotes(poll.options || [])} votes</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {!poll.active && (
                  <button onClick={e => { handleActivate(poll.id); }} className="bg-green-500/90 hover:bg-green-500 text-white p-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-colors" title="Activer au public">
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
                <button onClick={e => { setEditPoll(poll); setModalOpen(true); }} className="bg-blue-500/90 hover:bg-blue-500 text-white p-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-colors" title="Éditer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={e => { setConfirmDelete(poll); }} className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg shadow-lg backdrop-blur-sm transition-colors" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center items-center gap-4 mb-10 pt-4 border-t border-white/10">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            Précédent
          </button>
          <span className="px-4 py-2 text-sm font-bold bg-[var(--accent)]/10 text-[var(--accent)] rounded-lg border border-[var(--accent)]/20">
            Page {page} sur {pageCount}
          </span>
          <button 
            onClick={() => setPage(p => Math.min(pageCount, p + 1))} 
            disabled={page === pageCount} 
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Modale ajout/édition */}
      {modalOpen && (
        <PollModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditPoll(null); }}
          onSave={handleSave}
          initialData={editPoll}
          dragActive={dragActive}
          setDragActive={setDragActive}
          inputRef={inputRef}
          loading={loading}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={closeLightbox}>
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button 
              onClick={closeLightbox} 
              className="absolute -top-12 right-0 bg-white/10 text-white p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightbox} alt="aperçu sondage" className="max-h-[85vh] w-auto rounded-xl shadow-2xl border border-white/10" />
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-2xl border border-[var(--border)] max-w-md w-full mx-4 text-center">
            <div className="bg-red-500/10 p-4 rounded-full mb-4 w-fit mx-auto">
              <Trash2 className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">Supprimer le sondage ?</h3>
            <p className="text-[var(--text-secondary)] mb-8">
              Vous êtes sur le point de supprimer le sondage <br/>
              <strong className="text-white">"{confirmDelete.question}"</strong>.<br/>
              Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-4 w-full">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 bg-white/5 text-[var(--text-primary)] px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors border border-white/10"
              >
                Annuler
              </button>
              <button 
                onClick={() => handleDelete(confirmDelete)} 
                className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-semibold hover:brightness-110 shadow-[0_4px_16px_rgba(239,68,68,0.3)] transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modale d'ajout/édition sondage
const PollModal = ({ open, onClose, onSave, initialData, dragActive, setDragActive, inputRef, loading }: any) => {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [options, setOptions] = useState<string[]>(initialData?.options ? initialData.options.map((o: any) => o.label) : ["", ""]);
  const [file, setFile] = useState<File|null>(null);

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || "");
      setImageUrl(initialData.image_url || "");
      setOptions(initialData.options ? initialData.options.map((o: any) => o.label) : ["", ""]);
    } else {
      setQuestion("");
      setImageUrl("");
      setOptions(["", ""]);
    }
    setFile(null);
  }, [initialData, open]);

  const handleAddOption = () => setOptions(opts => [...opts, ""]);
  const handleRemoveOption = (idx: number) => setOptions(opts => opts.length > 2 ? opts.filter((_, i) => i !== idx) : opts);
  const handleOptionChange = (idx: number, value: string) => setOptions(opts => opts.map((opt, i) => i === idx ? value : opt));

  // Drag & drop image
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragActive(false); };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files[0]) {
      setFile(files[0]);
      setImageUrl(URL.createObjectURL(files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) return;
    onSave({
      id: initialData?.id,
      question,
      image_url: imageUrl,
      options: options.map((label, i) => ({ id: i + 1, label, votes: initialData?.options?.[i]?.votes || 0 })),
      active: initialData?.active || false,
      created_at: initialData?.created_at || new Date().toISOString(),
    }, file);
  };

  return open ? (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-modalIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-bold admin-dashboard-title mb-2">
          {initialData ? 'Éditer le sondage' : 'Nouveau sondage'}
        </h3>
        
        <div>
          <label className="block font-medium mb-2 text-[var(--text-secondary)] text-sm">Question :</label>
          <input 
            value={question} 
            onChange={e => setQuestion(e.target.value)} 
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 text-white focus:border-[var(--accent)] outline-none text-base transition-colors placeholder-white/30" 
            placeholder="Posez votre question sondage..."
            required 
          />
        </div>
        
        <div>
          <label className="block font-medium mb-2 text-[var(--text-secondary)] text-sm">Image d'illustration :</label>
          <div
            className={`w-full border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center py-8 mb-4 ${dragActive ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-white/10 bg-black/20 hover:bg-black/40 hover:border-white/20'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className={`w-10 h-10 mb-3 ${dragActive ? 'text-[var(--accent)]' : 'text-white/40'}`} />
            <div className="text-sm font-semibold mb-1 text-[var(--text-primary)]">Glissez-déposez une image ici</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">ou cliquez sur le bouton ci-dessous</div>
            <button type="button" onClick={() => { if (inputRef.current) inputRef.current.click(); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition flex items-center gap-2 border border-white/10">
              <UploadCloud className="w-4 h-4" /> Parcourir les fichiers
            </button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} disabled={loading} />
          </div>
          
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 h-32 w-full mt-2">
              <img src={imageUrl} alt="aperçu" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs backdrop-blur-sm text-white font-medium">Image sélectionnée</div>
              <button 
                type="button" 
                onClick={() => { setFile(null); setImageUrl(initialData?.image_url || ""); }}
                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 p-1 rounded-md text-white backdrop-blur-sm transition-colors"
                title="Retirer cette image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div>
          <label className="block font-medium mb-3 text-[var(--text-secondary)] text-sm">Options de réponse :</label>
          <div className="flex flex-col gap-3 bg-black/20 p-4 rounded-xl border border-white/5">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center group">
                <span className="text-[var(--text-muted)] text-sm font-mono w-4">{idx + 1}.</span>
                <input 
                  value={opt} 
                  onChange={e => handleOptionChange(idx, e.target.value)} 
                  className="flex-1 px-3 py-2.5 rounded-lg border border-white/10 bg-black/40 text-white focus:border-[var(--accent)] outline-none text-sm transition-colors" 
                  placeholder={`Option ${idx + 1}`}
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => handleRemoveOption(idx)} 
                  className={`p-2.5 rounded-lg border border-white/10 transition-colors ${options.length > 2 ? 'bg-white/5 text-[var(--text-muted)] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' : 'opacity-30 cursor-not-allowed'}`}
                  disabled={options.length <= 2}
                  title="Supprimer cette option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddOption} 
              className="mt-2 px-4 py-2.5 rounded-lg border border-dashed border-white/20 text-[var(--text-secondary)] hover:text-white hover:border-white/40 hover:bg-white/5 text-sm font-semibold transition flex items-center justify-center gap-2 w-full"
            >
              <Plus className="w-4 h-4" /> Ajouter une option
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors font-semibold"
            disabled={loading}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent)] text-white font-bold shadow-[0_4px_16px_var(--accent-glow)] hover:brightness-110 hover:-translate-y-0.5 transition-all" 
            disabled={loading}
          >
            {loading ? 'Traitement...' : (initialData ? 'Enregistrer' : 'Créer le sondage')}
          </button>
        </div>
      </form>
    </div>
  ) : null;
};

export default PollsPage;
