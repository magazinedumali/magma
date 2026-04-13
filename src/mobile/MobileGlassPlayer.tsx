import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';
import { mobileTheme as T } from './mobileTheme';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const RADIO_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60';

export default function MobileGlassPlayer() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={() => navigate('/mobile/audio-streaming')}
      className={cn(
        'fixed left-4 right-4 z-40 flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-md transition active:scale-[0.99]',
        isDark ? '' : 'border-black/10'
      )}
      style={{
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.92)',
        borderColor: isDark ? T.colors.border : 'rgba(0,0,0,0.1)',
        boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.35)' : '0 8px 28px rgba(0,0,0,0.08)',
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
          <p
            className={cn(
              'truncate text-sm font-bold',
              isDark ? 'text-white' : 'text-[#111827]'
            )}
          >
            Direct Radio Magma
          </p>
          <p
            className="truncate text-xs"
            style={{ color: isDark ? T.colors.textMuted : '#6b7280' }}
          >
            Écouter en direct
          </p>
        </div>
      </div>
      <PlayCircle size={40} className="shrink-0 text-[#ff184e]" strokeWidth={1.5} />
    </button>
  );
}
