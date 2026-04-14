import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pause, Play, SkipBack, SkipForward, Music } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import MobileBottomNav from './MobileBottomNav';
import { mobileTheme as T } from './mobileTheme';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

/** Flux démo tant qu’aucune URL live n’est branchée côté config */
const RADIO_STREAM_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const RADIO_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80';

const RECENT_EPISODES = [
  { id: 1, title: 'Débat du jour - Épisode 1', meta: 'Il y a 2 jours • 45 min' },
  { id: 2, title: 'Débat du jour - Épisode 2', meta: 'Il y a 2 jours • 45 min' },
  { id: 3, title: 'Débat du jour - Épisode 3', meta: 'Il y a 2 jours • 45 min' },
];

function useAlbums() {
  const [albums, setAlbums] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      const { data } = await supabase.from('albums').select('*, songs(*)').order('year', { ascending: false });
      setAlbums(data || []);
      setLoading(false);
    }
    fetchAlbums();
  }, []);
  return { albums, loading };
}

export default function AudioStreamingPage() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [livePlaying, setLivePlaying] = useState(false);
  const liveRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const { albums, loading } = useAlbums();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  const toggleLive = () => {
    const el = liveRef.current;
    if (!el) return;
    if (livePlaying) {
      el.pause();
      setLivePlaying(false);
    } else {
      el.play()
        .then(() => setLivePlaying(true))
        .catch(() => setLivePlaying(false));
    }
  };

  const skipLive = (deltaSec: number) => {
    const el = liveRef.current;
    if (!el) return;
    try {
      el.currentTime = Math.max(0, el.currentTime + deltaSec);
    } catch {
      /* flux live sans seek */
    }
  };

  return (
    <div
      className={cn(
        'relative flex min-h-screen flex-col pb-[calc(88px+env(safe-area-inset-bottom,0px))] transition-colors duration-300',
        isDark ? 'text-[#ffffff]' : 'text-[#111827]',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b',
          isDark ? 'from-[#1a1e2e] to-[#0a0d14]' : 'from-[#f8fafc] to-[#e2e8f0]',
        )}
        aria-hidden
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <header className="relative flex items-center justify-center px-4 pb-2 pt-[calc(env(safe-area-inset-top)+12px)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={cn(
              'absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] flex rounded-full border p-2 backdrop-blur-sm',
              isDark
                ? 'border-white/10 bg-[#161b26]/80'
                : 'border-black/10 bg-white/90 shadow-sm',
            )}
            aria-label="Retour"
          >
            <ArrowLeft size={22} className={isDark ? 'text-[#ffffff]' : 'text-[#111827]'} />
          </button>
          <h1
            className={cn(
              'text-center text-lg font-extrabold uppercase tracking-[0.2em]',
              isDark ? 'text-[#ffffff]' : 'text-[#111827]',
            )}
          >
            Streaming Direct
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center px-4 pb-6">
          <div className="mt-5 flex w-full max-w-sm flex-col items-center">
            <img
              src={RADIO_COVER}
              alt=""
              className="aspect-square w-[min(100%,280px)] rounded-[20px] object-cover shadow-2xl"
              style={{
                boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 16px 40px rgba(15,23,42,0.12)',
              }}
              loading="lazy"
            />
            <p
              className={cn(
                'mt-8 text-center text-2xl font-extrabold',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]',
              )}
            >
              Radio Magma Mali
            </p>
            <p className="mt-1 text-center text-base font-semibold" style={{ color: T.colors.primary }}>
              En direct de Bamako
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-10">
            <button
              type="button"
              className="p-2 opacity-80 transition hover:opacity-100"
              aria-label="Reculer"
              onClick={() => skipLive(-15)}
            >
              <SkipBack size={32} className={isDark ? 'text-[#ffffff]' : 'text-[#475569]'} />
            </button>
            <button
              type="button"
              className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition active:scale-95"
              style={{
                backgroundColor: T.colors.primary,
                boxShadow: `0 10px 40px ${T.colors.primary}66`,
              }}
              aria-label={livePlaying ? 'Pause' : 'Lecture'}
              onClick={toggleLive}
            >
              {livePlaying ? (
                <Pause size={40} className="text-[#ffffff]" fill="currentColor" />
              ) : (
                <Play size={40} className="ml-1 text-[#ffffff]" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              className="p-2 opacity-80 transition hover:opacity-100"
              aria-label="Avancer"
              onClick={() => skipLive(15)}
            >
              <SkipForward size={32} className={isDark ? 'text-[#ffffff]' : 'text-[#475569]'} />
            </button>
          </div>

          <section className="mt-10 w-full max-w-lg">
            <h2
              className={cn(
                'mb-5 text-lg font-bold',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]',
              )}
            >
              Émissions récentes
            </h2>
            <ul className="space-y-3">
              {RECENT_EPISODES.map((ep) => (
                <li
                  key={ep.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 backdrop-blur-md',
                    isDark
                      ? 'border-white/10 bg-white/[0.06]'
                      : 'border-black/10 bg-white shadow-sm',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <Music size={24} className="shrink-0" style={{ color: T.colors.primary }} />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'truncate text-sm font-semibold',
                          isDark ? 'text-[#ffffff]' : 'text-[#111827]',
                        )}
                      >
                        {ep.title}
                      </p>
                      <p className={cn('mt-0.5 text-xs', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
                        {ep.meta}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'shrink-0 rounded-full p-2 opacity-90 hover:opacity-100',
                      !isDark && 'bg-gray-100',
                    )}
                    aria-label={`Écouter ${ep.title}`}
                    onClick={toggleLive}
                  >
                    <Play
                      size={20}
                      className={isDark ? 'text-[#ffffff]' : 'text-[#111827]'}
                      fill="currentColor"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 w-full max-w-lg pb-4">
            <h2
              className={cn(
                'mb-4 text-lg font-bold',
                isDark ? 'text-[#ffffff]' : 'text-[#111827]',
              )}
            >
              Nos albums
            </h2>
            {loading ? (
              <p className={cn('text-sm', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>Chargement…</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {albums.slice(0, 4).map((album) => (
                  <button
                    type="button"
                    key={album.id}
                    className={cn(
                      'cursor-pointer overflow-hidden rounded-2xl border text-left shadow-lg transition active:scale-[0.98]',
                      isDark
                        ? 'border-white/10 bg-[#161b26]'
                        : 'border-black/10 bg-white',
                    )}
                    onClick={() => navigate(`/mobile/album/${album.id}`)}
                  >
                    <img src={album.cover} alt="" className="h-36 w-full object-cover" />
                    <div className="p-3">
                      <div
                        className={cn(
                          'mb-1 text-base font-bold',
                          isDark ? 'text-[#ffffff]' : 'text-[#111827]',
                        )}
                      >
                        {album.title}
                      </div>
                      {album.category && (
                        <div
                          className={cn(
                            'mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold',
                            isDark ? 'bg-white/10 text-[#9ba5be]' : 'bg-gray-100 text-[#6b7280]',
                          )}
                        >
                          {album.category}
                        </div>
                      )}
                      <div className={cn('flex items-center gap-1 text-xs', isDark ? 'text-[#9ba5be]' : 'text-[#6b7280]')}>
                        {album.songs?.length || 0} pistes
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <audio
        ref={liveRef}
        src={RADIO_STREAM_URL}
        playsInline
        className="hidden"
        onPlay={() => setLivePlaying(true)}
        onPause={() => setLivePlaying(false)}
        onEnded={() => setLivePlaying(false)}
      />

      <MobileBottomNav user={user} />
    </div>
  );
}

function formatTime(sec: number) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// AlbumDetailMobile dynamique
export function AlbumDetailMobile() {
  const { isDark } = useTheme();

  function useAlbums() {
    const [albums, setAlbums] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
      async function fetchAlbums() {
        setLoading(true);
        const { data, error } = await supabase
          .from('albums')
          .select('*, songs(*)')
          .order('year', { ascending: false });
        setAlbums(data || []);
        setLoading(false);
      }
      fetchAlbums();
    }, []);
    return { albums, loading };
  }
  const { id } = useParams();
  const { albums, loading } = useAlbums();
  const album = albums.find(a => a.id === id);
  const navigate = useNavigate();
  const [current, setCurrent] = React.useState<number|null>(null);
  const [playing, setPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => { setCurrent(0); setPlaying(false); }, [album?.id]);
  // Quand on change de morceau, lance la lecture automatiquement
  React.useEffect(() => {
    if (audioRef.current && current !== null && album && album.songs && album.songs[current] && album.songs[current].audio_url) {
      audioRef.current.currentTime = 0;
      if (playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [current, playing]);

  if (loading) {
    return (
      <div
        className={cn(
          'flex min-h-screen items-center justify-center transition-colors',
          isDark ? 'bg-[#0a0d14] text-[#9ba5be]' : 'bg-[#f3f4f6] text-[#6b7280]',
        )}
      >
        Chargement…
      </div>
    );
  }
  if (!album) {
    return (
      <div
        className={cn(
          'flex min-h-screen flex-col items-center justify-center px-4 transition-colors',
          isDark ? 'bg-[#0a0d14] text-[#ffffff]' : 'bg-[#f3f4f6] text-[#111827]',
        )}
      >
        <div className="mb-4 text-2xl font-bold">Album introuvable</div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-full bg-[#ff184e] px-6 py-2 font-bold text-[#ffffff]"
        >
          Retour
        </button>
      </div>
    );
  }
  const songs = album.songs || [];
  const currentSong = songs[current || 0];
  // Gestion play/pause/next/prev
  const handlePrev = () => setCurrent(i => (i > 0 ? i - 1 : songs.length - 1));
  const handleNext = () => setCurrent(i => (i < songs.length - 1 ? i + 1 : 0));
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col pb-40 transition-colors',
        isDark ? 'bg-[#0a0d14]' : 'bg-[#f9f7fc]',
      )}
    >
      <div className="relative overflow-hidden" style={{ background: '#18122B' }}>
        <img src={album.cover} alt={album.title} className="w-full h-64 object-cover" />
        {/* Dégradé noir progressif en bas */}
        <div className="absolute left-0 right-0 bottom-0 h-32" style={{background: 'linear-gradient(0deg,rgba(0,0,0,0.92) 55%,rgba(0,0,0,0.7) 75%,rgba(0,0,0,0.3) 90%,rgba(0,0,0,0) 100%)'}} />
        {/* Texte sur le dégradé, aligné à gauche */}
        <div className="absolute bottom-8 left-6 right-0 z-10 flex flex-col items-start">
          <h1 className="mb-1 text-2xl font-bold text-[#ffffff] drop-shadow-lg">{album.title}</h1>
          {album.category && (
            <div className="mb-1 rounded-full bg-[#ff184e]/80 px-2 py-0.5 text-xs font-semibold text-[#ffffff] drop-shadow">
              {album.category}
            </div>
          )}
          <div className="mb-1 text-base font-medium text-[#ffffff] drop-shadow">
            {album.year} &nbsp;•&nbsp; {songs.length} morceaux
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/80 rounded-full p-2"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#18122B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
      <div className="flex-1 px-0 pt-0 pb-0">
        <div
          className={cn(
            'mx-2 rounded-3xl px-2 py-2 shadow-lg',
            isDark ? 'border border-white/10 bg-[#161b26]' : 'bg-white',
          )}
        >
          {songs.map((song: any, idx: number) => (
            <div
              key={idx}
              className={cn(
                'group relative mb-1 flex items-center px-4 py-3 transition-all duration-200',
                isDark ? 'bg-[#161b26]' : 'bg-white',
                idx === current && playing && 'shadow-md',
              )}
              style={{ borderLeft: idx === current && playing ? '4px solid #ff184e' : '4px solid transparent', borderRadius: 8 }}
            >
              {/* Avatar pochette */}
              <img src={album.cover} alt={song.title} className="w-10 h-10 object-cover mr-4" />
              {/* Infos */}
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'truncate text-base font-semibold',
                    isDark ? 'text-[#ffffff]' : 'text-[#181818]',
                  )}
                >
                  {song.title}
                </div>
                <div className={cn('truncate text-xs', isDark ? 'text-[#9ba5be]' : 'text-gray-400')}>
                  {song.subtitle}
                </div>
              </div>
              {/* Durée */}
              <div className={cn('ml-2 mr-2 text-xs', isDark ? 'text-[#9ba5be]' : 'text-gray-400')}>{song.duration}</div>
              {/* Bouton play/pause à droite */}
              <button
                className={cn(
                  'ml-2 flex h-9 w-9 items-center justify-center rounded-full border shadow transition hover:bg-[#ff184e]/10',
                  isDark
                    ? 'border-white/10 bg-[#0a0d14]'
                    : 'border-gray-200 bg-white',
                  idx === current && playing && 'border-[#ff184e]',
                )}
                onClick={e => {
                  e.stopPropagation();
                  if (idx === current) {
                    setPlaying(p => !p);
                  } else {
                    setCurrent(idx);
                    setPlaying(true);
                  }
                }}
                aria-label={idx === current && playing ? 'Pause' : 'Play'}
              >
                {(current === null || idx !== current || !playing) ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" className="text-[#ff184e]">
                    <path fill="currentColor" d="M12.225 4.462C9.89 3.142 7 4.827 7 7.508V24.5c0 2.682 2.892 4.368 5.226 3.045l14.997-8.498c2.367-1.341 2.366-4.751 0-6.091z" />
                  </svg>
                ) : (
                  <Pause size={20} className="text-[#ff184e]" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Mini-player flottant en bas */}
      {current !== null && currentSong && currentSong.audio_url && (
        <div
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-md flex-col items-center rounded-t-3xl border-t px-4 py-4 shadow-2xl',
            isDark ? 'border-white/10 bg-[#161b26]' : 'border-black/10 bg-white',
          )}
          style={{ minHeight: 120 }}
        >
          <div className="flex w-full items-center justify-center gap-4">
            {/* Pochette */}
            <img src={album.cover} alt={currentSong.title} className="mr-4 h-16 w-16 object-cover shadow" />
            {/* Infos et contrôles */}
            <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
              <div
                className={cn(
                  'mb-1 truncate text-base font-bold',
                  isDark ? 'text-[#ffffff]' : 'text-[#181818]',
                )}
              >
                {currentSong.title}
              </div>
              <div className={cn('mb-2 truncate text-xs', isDark ? 'text-[#9ba5be]' : 'text-[#a09db1]')}>
                {currentSong.subtitle || album.title}
              </div>
              {/* Barre de progression */}
              <div className="flex w-full items-center gap-2">
                <span className={cn('text-xs', isDark ? 'text-[#9ba5be]' : 'text-gray-400')}>
                  {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
                </span>
                <div className="flex-1 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={audioRef.current && audioRef.current.duration ? audioRef.current.duration : 0}
                    value={audioRef.current ? audioRef.current.currentTime : 0}
                    onChange={e => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Number(e.target.value);
                        setProgress(audioRef.current.currentTime);
                      }
                    }}
                    className="w-full h-1 rounded-full accent-[#ff184e] bg-gray-200 shadow-inner"
                    style={{ background: `linear-gradient(to right, #ff184e ${(audioRef.current && audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)}%, #e5e7eb ${(audioRef.current && audioRef.current.duration ? (audioRef.current.currentTime / audioRef.current.duration) * 100 : 0)}%)` }}
                  />
                </div>
                <span className={cn('text-xs', isDark ? 'text-[#9ba5be]' : 'text-gray-400')}>
                  {audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}
                </span>
              </div>
              {/* Contrôles */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(current > 0 ? current - 1 : songs.length - 1);
                    setPlaying(true);
                  }}
                  className={cn(
                    'rounded-full p-2 transition',
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
                  )}
                >
                  <SkipBack size={28} className={isDark ? 'text-[#9ba5be]' : 'text-gray-400'} />
                </button>
                <button onClick={() => setPlaying(p => { if (audioRef.current) { if (p) { audioRef.current.pause(); } else { audioRef.current.play(); } } return !p; })} className="p-2 rounded-full bg-[#ff184e] hover:bg-[#ff184e]/80 transition" style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {playing ? (
                    <Pause size={28} className="text-[#ffffff]" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="text-[#ffffff]">
                      <path fill="currentColor" d="M12.225 4.462C9.89 3.142 7 4.827 7 7.508V24.5c0 2.682 2.892 4.368 5.226 3.045l14.997-8.498c2.367-1.341 2.366-4.751 0-6.091z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrent(current < songs.length - 1 ? current + 1 : 0);
                    setPlaying(true);
                  }}
                  className={cn(
                    'rounded-full p-2 transition',
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100',
                  )}
                >
                  <SkipForward size={28} className={isDark ? 'text-[#9ba5be]' : 'text-gray-400'} />
                </button>
              </div>
            </div>
          </div>
          {/* Audio réel, caché */}
          <audio
            ref={audioRef}
            src={currentSong.audio_url}
            controls={false}
            onEnded={() => { setCurrent(current < songs.length - 1 ? current + 1 : 0); setPlaying(true); }}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            onTimeUpdate={() => audioRef.current && setProgress(audioRef.current.currentTime)}
            onLoadedMetadata={() => audioRef.current && setProgress(audioRef.current.currentTime)}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
} 