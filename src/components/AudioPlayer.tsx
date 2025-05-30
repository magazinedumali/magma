import React, { useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  noCard?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, noCard }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const increaseVolume = () => {
    let newVolume = Math.min(1, Math.round((volume + 0.1) * 10) / 10);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const decreaseVolume = () => {
    let newVolume = Math.max(0, Math.round((volume - 0.1) * 10) / 10);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className={noCard ? "w-full flex flex-col items-center px-0 py-0 gap-2 bg-transparent shadow-none" : "w-full bg-white rounded-xl shadow flex flex-col items-center px-4 py-3 gap-2"}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      <div className="flex items-center w-full gap-3">
        <button
          onClick={togglePlay}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-[#ff184e] text-white hover:bg-red-600 transition p-0"
          style={{ minWidth: 48, minHeight: 48 }}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="2" fill="currentColor"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M7 5v14l11-7L7 5z" fill="currentColor"/></svg>
          )}
        </button>
        <span className="text-xs text-gray-500 w-10 text-right">{formatTime(currentTime)}</span>
        <div className="relative flex-1 flex items-center">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
            className="w-full h-2 rounded-full accent-[#ff184e] bg-gray-200 shadow-inner"
            style={{
              background: `linear-gradient(to right, #ff184e ${(currentTime / (duration || 1)) * 100}%, #e5e7eb ${(currentTime / (duration || 1)) * 100}%)`
            }}
        />
        </div>
        <span className="text-xs text-gray-500 w-10">{formatTime(duration)}</span>
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setShowVolume(!showVolume)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            {volume === 0 ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="19" y1="5" x2="5" y2="19" stroke="#ff184e" strokeWidth="2"/></svg>
            ) : volume < 0.5 ? (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M9 9v6h4l5 5V4l-5 5H9z" stroke="#ff184e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 8c1.333 1.333 2 2.667 2 4s-.667 2.667-2 4" stroke="#ff184e" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
          </button>
          {showVolume && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-30 animate-slideup origin-bottom transition-transform duration-300">
              <div className="flex flex-col items-center gap-2 bg-white rounded-xl shadow-lg p-2">
                <span className="text-xs font-semibold text-[#ff184e] mb-1">{Math.round(volume * 100)}%</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                  className="h-24 w-2 rounded-full accent-[#ff184e] bg-gray-200 shadow-inner"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    background: `linear-gradient(to top, #e5e7eb ${volume * 100}%, #ff184e ${volume * 100}%)`,
                    touchAction: 'none'
                  }}
              />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer; 