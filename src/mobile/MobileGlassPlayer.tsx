import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { mobileTheme as T } from './mobileTheme';

const RADIO_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60';

export default function MobileGlassPlayer() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/mobile/audio-streaming')}
      className="fixed left-4 right-4 z-40 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md transition active:scale-[0.99]"
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderColor: T.colors.border,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={RADIO_COVER}
          alt=""
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
          loading="lazy"
        />
        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-bold text-white">Direct Radio Magma</p>
          <p className="truncate text-xs" style={{ color: T.colors.textMuted }}>
            Écouter en direct
          </p>
        </div>
      </div>
      <PlayCircle size={40} className="shrink-0 text-[#ff184e]" strokeWidth={1.5} />
    </button>
  );
}
