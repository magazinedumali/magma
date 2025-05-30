import React, { useState, useRef } from "react";
import { X, Edit2, Trash2, Plus, CheckCircle, Image as ImgIcon, Search, UploadCloud } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'polls';
const PAGE_SIZE = 8;

function totalVotes(options) {
  return options.reduce((s, o) => s + o.votes, 0);
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
  React.useEffect(() => { fetchPolls(); }, []);

  // Stats dynamiques
  const total = polls.length;
  const totalActive = polls.filter(p => p.active).length;
  const totalVotesAll = polls.reduce((s, p) => s + totalVotes(p.options), 0);

  // Filtrage
  let filtered = polls.filter(p => !search || p.question?.toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Drag & drop image upload (Supabase)
  const handleDrop = async e => { e.preventDefault(); setDragActive(false); };
  const handleDragOver = e => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragActive(false); };

  // Lightbox
  const openLightbox = url => setLightbox(url);
  const closeLightbox = () => setLightbox(null);

  // Ajout/édition sondage (avec upload image et options)
  const handleSave = async (poll, file?) => {
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
      setError(err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      setLoading(false);
    }
  };

  // Suppression réelle (table + image storage + options)
  const handleDelete = async (poll) => {
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
      setError(err.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  // Activation unique
  const handleActivate = async (id) => {
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
      setError(err.message || 'Erreur lors de l’activation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f9fafd] to-[#e6eaff] flex flex-col items-center py-0 px-0 font-jost">
      <div className="w-full max-w-5xl flex-1 flex flex-col justify-start items-center px-2 sm:px-6 md:px-10 py-10">
        {/* Barre sticky */}
        <div className="w-full sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-lg mb-8 px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#e5e9f2]">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-[#232b46] flex items-center gap-2">🗳️ Sondages</h2>
            <div className="flex flex-wrap gap-4 text-base text-gray-600">
              <span>Total : <b>{total}</b></span>
              <span>Actifs : <b>{totalActive}</b></span>
              <span>Votes : <b>{totalVotesAll}</b></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center justify-end">
            <div className="relative">
              <input type="text" placeholder="Recherche..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-[#4f8cff] outline-none text-base bg-white shadow-sm" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button onClick={() => { setEditPoll(null); setModalOpen(true); }} className="px-5 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><Plus className="w-5 h-5" /> Nouveau</button>
          </div>
        </div>
        {/* Grille de sondages */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-10">
          {paginated.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 text-lg py-12">Aucun sondage trouvé.</div>
          ) : (
            paginated.map(poll => (
              <div key={poll.id} className={`relative group bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col transition hover:scale-[1.03] hover:shadow-2xl cursor-pointer border-2 ${poll.active ? 'border-[#4f8cff]' : 'border-transparent'}`}>
                {/* Image sondage */}
                <div className="relative w-full h-40 flex items-center justify-center bg-gray-50 overflow-hidden" onClick={() => openLightbox(poll.image_url)}>
                  {poll.image_url ? <img src={poll.image_url} alt={poll.question} className="object-cover w-full h-full transition group-hover:scale-105" /> : <ImgIcon className="w-16 h-16 text-gray-300" />}
                  {poll.active && <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-[#4f8cff]/90 text-white flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Actif</span>}
                </div>
                {/* Infos */}
                <div className="flex-1 flex flex-col p-4 gap-2">
                  <div className="font-bold text-[#232b46] text-lg truncate" title={poll.question}>{poll.question}</div>
                  <div className="text-gray-400 text-xs">{poll.options.length} options • {totalVotes(poll.options)} votes</div>
                  <div className="text-gray-300 text-xs">Créé le {poll.created_at}</div>
                </div>
                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={e => { e.stopPropagation(); handleActivate(poll.id); }} className={`bg-[#4f8cff] text-white p-2 rounded-full shadow hover:scale-110 transition ${poll.active ? 'opacity-60 pointer-events-none' : ''}`} title="Activer"><CheckCircle className="w-5 h-5" /></button>
                  <button onClick={e => { e.stopPropagation(); setEditPoll(poll); setModalOpen(true); }} className="bg-[#ffc107] text-[#232b46] p-2 rounded-full shadow hover:scale-110 transition" title="Éditer"><Edit2 className="w-5 h-5" /></button>
                  <button onClick={e => { e.stopPropagation(); setConfirmDelete(poll); }} className="bg-[#ff184e] text-white p-2 rounded-full shadow hover:scale-110 transition" title="Supprimer"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center gap-4 mb-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Précédent</button>
            <span className="px-6 py-3 text-base font-bold">Page {page} / {pageCount}</span>
            <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-6 py-3 rounded-xl border border-gray-200 text-base font-bold bg-white shadow disabled:opacity-50">Suivant</button>
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
          />
        )}
        {/* Lightbox */}
        {lightbox && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative flex flex-col items-center">
              <button onClick={closeLightbox} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
              <div className="w-full flex flex-col items-center">
                <img src={lightbox} alt="aperçu sondage" className="max-h-[60vh] w-auto rounded-xl shadow mb-4" />
              </div>
            </div>
          </div>
        )}
        {/* Confirmation suppression */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-2xl shadow-2xl">
              <div className="text-2xl font-bold mb-8 text-[#ff184e]">Supprimer le sondage "{confirmDelete.question}" ?</div>
              <div className="flex justify-end gap-6">
                <button onClick={() => setConfirmDelete(null)} className="bg-gray-200 text-[#ff184e] px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Annuler</button>
                <button onClick={() => handleDelete(confirmDelete)} className="bg-[#ff184e] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">Supprimer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Modale d'ajout/édition sondage
const PollModal = ({ open, onClose, onSave, initialData, dragActive, setDragActive, inputRef }) => {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [options, setOptions] = useState(initialData?.options ? initialData.options.map(o => o.label) : ["", ""]);

  const handleAddOption = () => setOptions(opts => [...opts, ""]);
  const handleRemoveOption = idx => setOptions(opts => opts.length > 2 ? opts.filter((_, i) => i !== idx) : opts);
  const handleOptionChange = (idx, value) => setOptions(opts => opts.map((opt, i) => i === idx ? value : opt));

  // Drag & drop image (démo)
  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    // Pour la démo, on prend la première image
    const files = Array.from(e.dataTransfer.files) as File[];
    if (files[0]) setImageUrl(URL.createObjectURL(files[0]));
  };
  const handleDragOver = e => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = e => { e.preventDefault(); setDragActive(false); };
  const handleFileInput = e => {
    const files = Array.from(e.target.files as FileList) as File[];
    if (files[0]) setImageUrl(URL.createObjectURL(files[0]));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim())) return;
    onSave({
      id: initialData?.id,
      question,
      image_url: imageUrl,
      options: options.map((label, i) => ({ id: i + 1, label, votes: initialData?.options?.[i]?.votes || 0 })),
      active: initialData?.active || false,
      created_at: initialData?.created_at || new Date().toISOString().slice(0, 10),
    });
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-6 relative animate-fade-in">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 bg-gray-200 text-[#ff184e] p-2 rounded-full hover:scale-110 transition"><X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-bold text-[#232b46] mb-2">{initialData ? 'Éditer le sondage' : 'Nouveau sondage'}</h3>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Question :</label>
          <input value={question} onChange={e => setQuestion(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-lg" />
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Image :</label>
          <div
            className={`w-full border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center py-6 mb-2 ${dragActive ? 'border-[#4f8cff] bg-blue-50' : 'border-gray-200 bg-white/70'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="w-8 h-8 text-[#4f8cff] mb-2" />
            <div className="text-base font-bold mb-1">Glissez-déposez une image ici</div>
            <div className="text-gray-500 mb-2">ou cliquez sur Upload</div>
            <button type="button" onClick={() => { if (inputRef.current) inputRef.current.click(); }} className="px-4 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload</button>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
          </div>
          {imageUrl && <img src={imageUrl} alt="aperçu" className="mt-3 max-w-xs rounded-lg shadow" />}
        </div>
        <div>
          <label className="block font-bold mb-2 text-[#232b46]">Options :</label>
          <div className="flex flex-col gap-2">
            {options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input value={opt} onChange={e => handleOptionChange(idx, e.target.value)} className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-[#4f8cff] outline-none text-base" />
                {options.length > 2 && <button type="button" onClick={() => handleRemoveOption(idx)} className="bg-[#ff184e] text-white p-2 rounded-full hover:scale-110 transition"><Trash2 className="w-4 h-4" /></button>}
              </div>
            ))}
            <button type="button" onClick={handleAddOption} className="mt-2 px-4 py-2 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter une option</button>
          </div>
        </div>
        <button type="submit" className="mt-4 px-6 py-3 rounded-xl bg-[#4f8cff] text-white font-bold shadow hover:bg-[#2563eb] transition">{initialData ? 'Enregistrer' : 'Créer le sondage'}</button>
      </form>
    </div>
  ) : null;
};

export default PollsPage; 