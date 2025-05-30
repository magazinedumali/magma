import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const IMAGE_DURATION = 5000; // 5 secondes pour une image

function formatStoryDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "il y a quelques secondes";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString();
}

const StoryViewer = ({ stories, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);
  const story = stories[index];
  const isVideo = !!story.video_url;
  const duration = isVideo ? videoDuration || IMAGE_DURATION : IMAGE_DURATION;
  const touchStartX = useRef(null);
  const intervalRef = useRef(null);

  // Barre de progression et enchaînement
  useEffect(() => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused && (!isVideo || (isVideo && videoDuration))) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(intervalRef.current);
            handleNext();
            return 100;
          }
          return p + 2;
        });
      }, duration / 50);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [index, videoDuration, paused]);

  // Pour vidéo : reset la progression quand la vidéo change
  useEffect(() => {
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoDuration(0);
    }
    // eslint-disable-next-line
  }, [index]);

  // Pause/reprise vidéo si tap
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (paused) videoRef.current.pause();
      else videoRef.current.play();
    }
  }, [paused, isVideo]);

  // Récupère la durée de la vidéo
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration * 1000);
    }
  };

  // Navigation
  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
    else onClose();
  };
  const handleNext = () => {
    if (index < stories.length - 1) setIndex(index + 1);
    else onClose();
  };

  // Swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) handleNext(); // swipe gauche
    else if (diff < -50) handlePrev(); // swipe droite
    touchStartX.current = null;
  };

  // Pause/reprise au tap (hors boutons)
  const handleViewerClick = (e) => {
    // Ignore si clic sur bouton navigation ou fermeture
    if (
      e.target.closest('button') ||
      e.target.closest('.story-badge')
    ) return;
    setPaused((p) => !p);
  };

  if (!story) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleViewerClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 z-50">
        <div
          className="h-1 bg-[#ff184e] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Auteur en haut à gauche */}
      <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
        {story.author_avatar ? (
          <img src={story.author_avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <span className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold">
            {story.author ? story.author[0].toUpperCase() : "?"}
          </span>
        )}
        <div className="flex flex-col">
          <span className="text-white text-xs font-semibold">{story.author || 'Auteur inconnu'}</span>
          <span className="text-gray-300 text-[10px] font-normal">
            {story.created_at ? formatStoryDate(story.created_at) : ''}
          </span>
        </div>
      </div>
      {/* Boutons navigation */}
      {index > 0 && (
        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white text-3xl rounded-full p-2 z-10"
          onClick={handlePrev}
          aria-label="Précédent"
        >&#8592;</button>
      )}
      {index < stories.length - 1 && (
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white text-3xl rounded-full p-2 z-10"
          onClick={handleNext}
          aria-label="Suivant"
        >&#8594;</button>
      )}
      {/* Image ou vidéo */}
      <div className="relative flex flex-col items-center w-full h-full">
        {isVideo ? (
          <video
            ref={videoRef}
            src={story.video_url}
            className="w-full h-full object-cover rounded-none shadow-none"
            autoPlay
            muted
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleNext}
          />
        ) : (
          <img
            src={story.image_url}
            alt={story.title}
            className="w-full h-full object-cover rounded-none shadow-none"
          />
        )}
        {/* Titre en overlay centré */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 px-6 py-4 bg-black/40 z-40 flex justify-center items-center">
          <h2 className="text-white text-2xl font-bold drop-shadow-lg text-center" style={{textShadow:'0 2px 8px #0008'}}>{story.title}</h2>
        </div>
        {/* Badge si présent */}
        {story.badge && (
          <span className="story-badge absolute top-12 left-3 bg-[#ff184e] text-white text-xs font-bold px-3 py-1 rounded-full shadow z-50">
            {story.badge}
          </span>
        )}
      </div>
      {/* Fermer au clic */}
      <button
        className="absolute top-4 right-4 text-white text-2xl"
        onClick={onClose}
        aria-label="Fermer"
        style={{ cursor: 'pointer' }}
      >×</button>
      {/* Indication pause/play */}
      {paused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="20" width="12" height="40" rx="4" fill="white" fillOpacity="0.7" />
            <rect x="46" y="20" width="12" height="40" rx="4" fill="white" fillOpacity="0.7" />
          </svg>
        </div>
      )}
    </div>
  );
};

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      setStories(data || []);
      setLoading(false);
    };
    fetchStories();
  }, []);

  const handleStoryClick = async (idx) => {
    setOpenIndex(idx); // Ouvre le viewer immédiatement
    const story = stories[idx];
    if (story && story.id) {
      // Incrémente la vue dans Supabase (fonction atomique)
      await supabase.rpc('increment_story_views', { story_id: story.id });
      // Récupère la valeur à jour depuis Supabase
      const { data, error } = await supabase
        .from('stories')
        .select('views')
        .eq('id', story.id)
        .single();
      setStories(prevStories => {
        const updated = [...prevStories];
        updated[idx] = { ...updated[idx], views: data?.views ?? story.views };
        return updated;
      });
    }
  };

  if (loading) {
    return <div className="py-4 text-center text-gray-400 text-sm">Chargement des stories...</div>;
  }

  if (!stories.length) {
    return null;
  }

  return (
    <>
      {openIndex !== null && (
        <StoryViewer
          stories={stories}
          currentIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
      <div className="flex gap-4 overflow-x-auto px-4 py-2">
        {stories.map((story, idx) => (
          <div
            key={story.id}
            className="relative min-w-[160px] w-[160px] h-[240px] rounded-2xl overflow-hidden shadow-md bg-black flex-shrink-0 transition-colors duration-300 cursor-pointer"
            onClick={() => handleStoryClick(idx)}
          >
            <img
              src={story.image_url}
              alt={story.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            {/* Badge en haut à gauche */}
            <span className="absolute top-3 left-3 bg-[#ff184e] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {story.badge || 'Nouveau'}
            </span>
            {/* Nombre de vues en haut à droite */}
            <span className="absolute top-3 right-4 text-white/80 text-sm font-semibold flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="2"/></svg>
              {typeof story.views !== 'undefined' && story.views !== null ? story.views : 0}
            </span>
            {/* Titre sur l'image */}
            <div className="absolute left-0 right-0 bottom-8 px-4">
              <h3 className="text-white font-extrabold text-base leading-tight drop-shadow-lg" style={{textShadow:'0 2px 8px #0008'}}>{story.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Stories; 