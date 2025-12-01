import React, { useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, User, Radio, SkipBack, SkipForward } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { getUserAvatar } from '@/lib/userHelper';
import AudioPlayer from '@/components/AudioPlayer';

const demoPlaylist = [
  {
    title: "Chill Vibes",
    artist: "DJ Relax",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=facearea&w=400&h=400",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    title: "Morning Energy",
    artist: "Sunrise Crew",
    cover: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=400&h=400",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    title: "Focus Beats",
    artist: "WorkFlow",
    cover: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=400&h=400",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

export default function AudioStreamingPage() {
  const [current, setCurrent] = useState<number|null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [avatar, setAvatar] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const track = demoPlaylist[current || 0];

  // Hook pour charger les albums dynamiquement (local à ce composant)
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
  const { albums, loading } = useAlbums();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setAvatar(getUserAvatar(data.user));
      }
    });
  }, []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const val = Number(e.target.value);
    audioRef.current.currentTime = val;
    setProgress(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    setMuted(val === 0);
  };

  const handleMute = () => {
    setMuted(m => {
      if (audioRef.current) audioRef.current.muted = !m;
      return !m;
    });
  };

  const handleSelectTrack = (idx: number) => {
    setCurrent(idx);
    setProgress(0);
    setPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setPlaying(true);
      }
    }, 100);
  };

  // Quand on change de morceau (après action utilisateur), ne joue que si playing=true
  React.useEffect(() => {
    if (audioRef.current && current !== null && albums[current] && albums[current].songs && albums[current].songs[current] && albums[current].songs[current].audio_url) {
      audioRef.current.currentTime = 0;
      if (playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [current, playing]);

  return (
    <div className="min-h-screen bg-white flex flex-col transition-colors duration-300 pb-32">
      {/* Header modernisé */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 bg-white">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm mr-2 border border-gray-100">
            <ArrowLeft size={24} className="text-[#1a2746]" />
          </button>
          <span className="font-extrabold text-xl tracking-wide text-[#1a2746] font-poppins">MAGMA FM</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full bg-gray-100">
            <Radio size={22} className="text-[#ff184e]" />
          </button>
          <button className="p-1 rounded-full border-2 border-[#ff184e] overflow-hidden w-10 h-10 flex items-center justify-center">
            {avatar && avatar !== '/placeholder.svg' ? (
              <img 
                src={avatar} 
                alt="avatar" 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <User size={28} className="text-[#ff184e]" />
            )}
          </button>
        </div>
      </div>
      {/* Barre de recherche */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-gray-400 mr-2"><circle cx="11" cy="11" r="8" stroke="#888" strokeWidth="2"/><path d="M21 21l-2-2" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
          <input type="text" placeholder="Search in All" className="bg-transparent outline-none flex-1 text-base text-[#1a2746] placeholder-gray-400" />
        </div>
      </div>
      {/* Carte principale du morceau courant */}
      <div className="flex flex-col items-center px-6 mt-2 mb-6">
        <div className="relative w-full max-w-xs rounded-3xl overflow-hidden shadow-lg" style={{background: 'linear-gradient(135deg,#ffb6c1 0%,#ffe0e9 100%)'}}>
          <img src={track.cover} alt={track.title} className="w-full h-56 object-cover" loading="lazy" />
          <span className="absolute top-3 left-3 bg-white/80 text-[#ff184e] text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" stroke="#ff184e" strokeWidth="2"/></svg> Track
          </span>
          {/* Dégradé bas */}
          <div className="absolute left-0 right-0 bottom-0 h-[40%]" style={{background: 'linear-gradient(0deg,rgba(20,20,30,0.85) 70%,rgba(20,20,30,0) 100%)'}} />
          {/* Texte sur le dégradé */}
          <div className="absolute left-0 right-0 bottom-6 flex flex-col items-center z-10">
            <span className="text-white text-sm font-normal tracking-widest mb-1" style={{letterSpacing:'0.1em'}}>{track.artist}</span>
            <span className="text-white text-2xl font-bold font-poppins mb-2 drop-shadow-lg">{track.title}</span>
            <div className="flex justify-center gap-2 mt-2">
              {demoPlaylist.map((_, idx) => (
                <span key={idx} className={`w-2 h-2 rounded-full ${current === idx ? 'bg-white' : 'bg-gray-400/60'}`}></span>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Section Most Popular (remplace Hot Music) */}
      <section className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-xl text-[#1a2746]">Populaires...</span>
        </div>
        {loading ? (
          <div>Chargement…</div>
        ) : (
        <div className="grid grid-cols-2 gap-4">
          {albums.slice(0, 4).map(album => (
            <div key={album.id} className="bg-white rounded-2xl shadow overflow-hidden cursor-pointer" onClick={() => navigate(`/mobile/album/${album.id}`)}>
              <img src={album.cover} alt={album.title} className="w-full h-36 object-cover" />
              <div className="p-3">
                <div className="font-bold text-base text-[#1a2746] mb-1">{album.title}</div>
                {album.category && (
                  <div className="inline-block text-xs text-gray-500 font-semibold mb-1 bg-gray-100 px-2 py-0.5 rounded-full">{album.category}</div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" stroke="#ff184e" strokeWidth="2"/></svg>
                  {album.songs?.length || 0} Pistes Audio
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement…</div>;
  if (!album) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#18122B] text-white">
      <div className="text-2xl font-bold mb-4">Album not found</div>
      <button onClick={() => navigate(-1)} className="bg-[#ff184e] text-white px-6 py-2 rounded-full font-bold">Go Back</button>
    </div>
  );
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
    <div className="min-h-screen bg-[#f9f7fc] flex flex-col pb-40">
      <div className="relative overflow-hidden" style={{background:'#18122B'}}>
        <img src={album.cover} alt={album.title} className="w-full h-64 object-cover" />
        {/* Dégradé noir progressif en bas */}
        <div className="absolute left-0 right-0 bottom-0 h-32" style={{background: 'linear-gradient(0deg,rgba(0,0,0,0.92) 55%,rgba(0,0,0,0.7) 75%,rgba(0,0,0,0.3) 90%,rgba(0,0,0,0) 100%)'}} />
        {/* Texte sur le dégradé, aligné à gauche */}
        <div className="absolute left-6 right-0 bottom-8 flex flex-col items-start z-10">
          <h1 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">{album.title}</h1>
          {album.category && (
            <div className="text-white text-xs font-semibold mb-1 bg-[#ff184e]/80 px-2 py-0.5 rounded-full drop-shadow">{album.category}</div>
          )}
          <div className="text-white text-base font-medium drop-shadow mb-1">{album.year} &nbsp;•&nbsp; {songs.length} morceaux</div>
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 bg-white/80 rounded-full p-2"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#18122B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>
      <div className="flex-1 px-0 pt-0 pb-0">
        <div className="bg-white rounded-3xl mx-2 px-2 py-2 shadow-lg">
          {songs.map((song: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center py-3 px-4 mb-1 transition-all duration-200 bg-white relative group ${idx === current && playing ? 'shadow-md' : ''}`}
              style={{ borderLeft: idx === current && playing ? '4px solid #ff184e' : '4px solid transparent', borderRadius: 8 }}
            >
              {/* Avatar pochette */}
              <img src={album.cover} alt={song.title} className="w-10 h-10 object-cover mr-4" />
              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base text-[#181818] truncate">{song.title}</div>
                <div className="text-xs text-gray-400 truncate">{song.subtitle}</div>
              </div>
              {/* Durée */}
              <div className="text-xs text-gray-400 ml-2 mr-2">{song.duration}</div>
              {/* Bouton play/pause à droite */}
              <button
                className={`ml-2 w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow hover:bg-[#ff184e]/10 transition ${idx === current && playing ? 'border-[#ff184e]' : ''}`}
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
                  <Play size={20} className="text-[#ff184e]" />
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
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t z-50 flex flex-col items-center px-4 py-4 max-w-md mx-auto" style={{minHeight:120}}>
          <div className="flex items-center w-full gap-4 justify-center">
            {/* Pochette */}
            <img src={album.cover} alt={currentSong.title} className="w-16 h-16 object-cover shadow mr-4" />
            {/* Infos et contrôles */}
            <div className="flex-1 min-w-0 flex flex-col items-start justify-center">
              <div className="font-bold text-base text-[#181818] truncate mb-1">{currentSong.title}</div>
              <div className="text-[#a09db1] text-xs truncate mb-2">{currentSong.subtitle || album.title}</div>
              {/* Barre de progression */}
              <div className="w-full flex items-center gap-2">
                <span className="text-xs text-gray-400">{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
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
                <span className="text-xs text-gray-400">{audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}</span>
              </div>
              {/* Contrôles */}
              <div className="flex items-center gap-4 mt-2">
                <button onClick={() => { setCurrent(current > 0 ? current - 1 : songs.length - 1); setPlaying(true); }} className="p-2 rounded-full hover:bg-gray-100 transition"><SkipBack size={28} className="text-gray-400" /></button>
                <button onClick={() => setPlaying(p => { if (audioRef.current) { if (p) { audioRef.current.pause(); } else { audioRef.current.play(); } } return !p; })} className="p-2 rounded-full bg-[#ff184e] hover:bg-[#ff184e]/80 transition" style={{width:48,height:48,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {playing ? <Pause size={28} className="text-white" /> : <Play size={28} className="text-white" />}
                </button>
                <button onClick={() => { setCurrent(current < songs.length - 1 ? current + 1 : 0); setPlaying(true); }} className="p-2 rounded-full hover:bg-gray-100 transition"><SkipForward size={28} className="text-gray-400" /></button>
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