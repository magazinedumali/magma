import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogClose } from './ui/dialog';

export interface Video {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  author_avatar?: string;
  video_url: string;
}

const PlayButton = ({ onClick }: { onClick?: () => void }) => (
  <button
    type="button"
    aria-label="Lire la vidéo"
    onClick={onClick}
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 focus:outline-none"
    style={{ background: 'none', border: 'none', padding: 0 }}
  >
    <div className="bg-white bg-opacity-90 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="white" />
        <polygon points="13,10 24,16 13,22" fill="#ff184e" />
      </svg>
    </div>
  </button>
);

const getAuthorAvatar = (author: string, authorAvatar?: string) => {
  if (authorAvatar) return authorAvatar;
  return '/logo.png';
};

const VideoModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
}> = ({ open, onOpenChange, video }) => {
  if (!video) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-black/95 p-0 rounded-xl overflow-hidden flex flex-col items-center">
        <div className="w-full flex flex-col items-center">
          <video
            src={video.video_url}
            controls
            autoPlay
            style={{ width: '100%', maxHeight: '70vh', background: '#000' }}
            poster={video.image || undefined}
          />
          <div className="w-full px-6 py-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <img src={getAuthorAvatar(video.author, video.author_avatar)} alt="author" className="w-7 h-7 rounded-full border-2 border-white" onError={e => { e.currentTarget.src = '/logo.png'; }} />
              <span className="text-white text-base font-medium">{video.author}</span>
              <span className="text-[#ff184e] mx-2">|</span>
              <span className="text-white text-xs flex items-center"><span className="mr-1">📅</span>{video.date}</span>
            </div>
            <div className="text-white text-xl font-bold font-roboto leading-tight drop-shadow-md">
              {video.title}
            </div>
          </div>
        </div>
        <DialogClose className="absolute right-4 top-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 focus:outline-none">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

// Ajout du style global dans le composant (en haut du fichier ou juste avant le composant)
const hideVideoMenuDotsStyle = `
  video::-webkit-media-controls-menu-button {
    display: none !important;
  }
  video::-webkit-media-controls-timeline-container {
    margin-right: 0 !important;
  }
  video::-webkit-media-controls-enclosure {
    overflow: hidden !important;
  }
  video::-webkit-media-controls-panel {
    padding-right: 0 !important;
  }
  /* Firefox */
  video::-moz-media-controls-menu {
    display: none !important;
  }
`;

const PublishedVideoSection: React.FC = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState<(string | null)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) setVideos(data);
      setLoading(false);
    };

    fetchVideos();

    const channel = supabase
      .channel('realtime-videos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'videos' },
        payload => {
          const newVideo = payload.new as Video;
          setVideos(prev => {
            // évite doublons si déjà présent
            if (prev.some(v => v.id === newVideo.id)) return prev;
            // on garde le tri par date desc en réinsérant proprement
            const updated = [newVideo, ...prev];
            return updated.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'videos' },
        payload => {
          const updatedVideo = payload.new as Video;
          setVideos(prev => {
            const updated = prev.map(v => (v.id === updatedVideo.id ? updatedVideo : v));
            return updated.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'videos' },
        payload => {
          const deletedId = (payload.old as { id: string }).id;
          setVideos(prev => prev.filter(v => v.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Génère les thumbnails pour les vidéos sans image, en utilisant l'ordre (plus récentes d'abord)
    if (videos.length === 0) return;
    const baseVideos = [...videos].sort((a, b) => {
      const da = new Date(a.date || '').getTime();
      const db = new Date(b.date || '').getTime();
      return db - da;
    });

    const newThumbnails: (string | null)[] = [null, null, null, null];
    baseVideos.slice(0, 4).forEach((video, idx) => {
      if (!video.image) {
        const videoEl = document.createElement('video');
        videoEl.src = video.video_url;
        videoEl.crossOrigin = 'anonymous';
        videoEl.currentTime = 1;
        videoEl.muted = true;
        videoEl.addEventListener('loadeddata', () => {
          const canvas = document.createElement('canvas');
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            newThumbnails[idx] = canvas.toDataURL('image/png');
            setThumbnails([...newThumbnails]);
          }
        });
      }
    });
  }, [videos]);

  if (loading) return <div className="text-center py-16 text-white">Chargement des vidéos...</div>;
  if (!videos || videos.length === 0) return null;

  const orderedVideos = [...videos].sort((a, b) => {
    const da = new Date(a.date || '').getTime();
    const db = new Date(b.date || '').getTime();
    return db - da; // plus récent en premier
  });

  const hasEditorialLayout = orderedVideos.length >= 4;

  // Gestion du clic Play
  const handlePlay = (video: Video) => {
    setSelectedVideo(video);
    setModalOpen(true);
  };

  return (
    <section className="py-16 bg-transparent">
      {/* Style global pour masquer les trois points sur tous les players vidéo */}
      <style>{hideVideoMenuDotsStyle}</style>
      <VideoModal open={modalOpen} onOpenChange={setModalOpen} video={selectedVideo} />
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-jost font-bold text-white mb-8 border-b-2 border-[#ff184e] inline-block pb-2">{t('Vidéos Publiées')}</h2>
        {hasEditorialLayout ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left column (2 stacked small videos) */}
          <div className="flex flex-col gap-6">
              {[orderedVideos[0], orderedVideos[1]].map((video, idx) => (
                <div key={video.id} className="relative rounded-2xl overflow-hidden h-60 group shadow-lg flex glass-panel border border-white/10 hover:shadow-[0_0_20px_rgba(255,24,78,0.3)] transition-all">
                  <video
                    src={video.video_url}
                    controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#000' }}
                    poster={video.image || thumbnails[idx] || undefined}
                  />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                  <PlayButton onClick={() => handlePlay(video)} />
                <div className="absolute left-0 bottom-0 p-4 z-20">
                  <div className="flex items-center gap-2 mb-2">
                      <img src={getAuthorAvatar(video.author, video.author_avatar)} alt="author" className="w-6 h-6 rounded-full border-2 border-white" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                    <span className="text-white text-sm font-medium">{video.author}</span>
                    <span className="text-[#ff184e] mx-2">|</span>
                    <span className="text-white text-xs flex items-center"><span className="mr-1">📅</span>{video.date}</span>
                  </div>
                  <div className="text-white text-lg font-bold font-roboto leading-tight drop-shadow-md">
                    {video.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Center large video */}
            <div className="relative rounded-lg overflow-hidden md:col-span-2 h-96 group shadow-lg flex">
              <video
                src={orderedVideos[2].video_url}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#000' }}
                poster={orderedVideos[2].image || thumbnails[2] || undefined}
              />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
              <PlayButton onClick={() => handlePlay(orderedVideos[2])} />
            <div className="absolute left-0 bottom-0 p-6 z-20">
              <div className="flex items-center gap-2 mb-2">
                  <img src={getAuthorAvatar(orderedVideos[2].author, orderedVideos[2].author_avatar)} alt="author" className="w-6 h-6 rounded-full border-2 border-white" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                <span className="text-white text-sm font-medium">{orderedVideos[2].author}</span>
                <span className="text-[#ff184e] mx-2">|</span>
                <span className="text-white text-xs flex items-center"><span className="mr-1">📅</span>{orderedVideos[2].date}</span>
              </div>
              <div className="text-white text-2xl font-bold font-roboto leading-tight drop-shadow-md">
                {orderedVideos[2].title}
              </div>
            </div>
          </div>
          {/* Right column (1 tall video) */}
          <div className="flex flex-col gap-6">
              <div className="relative rounded-lg overflow-hidden h-full min-h-60 group shadow-lg flex" style={{height: '100%'}}>
                <video
                  src={orderedVideos[3].video_url}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#000' }}
                  poster={orderedVideos[3].image || thumbnails[3] || undefined}
                />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
                <PlayButton onClick={() => handlePlay(orderedVideos[3])} />
              <div className="absolute left-0 bottom-0 p-4 z-20">
                <div className="flex items-center gap-2 mb-2">
                    <img src={getAuthorAvatar(orderedVideos[3].author, orderedVideos[3].author_avatar)} alt="author" className="w-6 h-6 rounded-full border-2 border-white" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                  <span className="text-white text-sm font-medium">{orderedVideos[3].author}</span>
                  <span className="text-[#ff184e] mx-2">|</span>
                  <span className="text-white text-xs flex items-center"><span className="mr-1">📅</span>{orderedVideos[3].date}</span>
                </div>
                <div className="text-white text-lg font-bold font-roboto leading-tight drop-shadow-md">
                  {orderedVideos[3].title}
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(4, orderedVideos.length)} gap-6`}>
            {orderedVideos.map((video, idx) => (
              <div key={video.id} className="relative rounded-lg overflow-hidden h-60 group shadow-lg flex">
                <video
                  src={video.video_url}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12, background: '#000' }}
                  poster={video.image || thumbnails[idx] || undefined}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40" />
                <PlayButton onClick={() => handlePlay(video)} />
                <div className="absolute left-0 bottom-0 p-4 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={getAuthorAvatar(video.author, video.author_avatar)} alt="author" className="w-6 h-6 rounded-full border-2 border-white" onError={e => { e.currentTarget.src = '/logo.png'; }} />
                    <span className="text-white text-sm font-medium">{video.author}</span>
                    <span className="text-[#ff184e] mx-2">|</span>
                    <span className="text-white text-xs flex items-center"><span className="mr-1">📅</span>{video.date}</span>
                  </div>
                  <div className="text-white text-lg font-bold font-roboto leading-tight drop-shadow-md">
                    {video.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PublishedVideoSection; 