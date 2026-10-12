import React from 'react';
import { Play, Pause, RotateCw, ChevronUp, Loader2 } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

function formatSeconds(secs: number): string {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlayPause,
    skipSeconds,
    setIsFullPlayerOpen,
  } = useAudio();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Audio player"
      onClick={() => setIsFullPlayerOpen(true)}
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#131915]/95 backdrop-blur-lg border-t border-black/[0.08] dark:border-white/[0.08] shadow-lg cursor-pointer pb-[env(safe-area-inset-bottom)] transition-all duration-200"
    >
      {/* Top progress line */}
      <div className="w-full h-1 bg-black/[0.05] dark:bg-white/[0.08]">
        <div
          className="h-full bg-[#385944] dark:bg-[#6F9B7E] transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Track info */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[#385944]/15 dark:bg-[#6F9B7E]/20 flex items-center justify-center shrink-0 text-[#385944] dark:text-[#7EA089]">
            <ChevronUp className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold truncate text-[#1E2621] dark:text-[#F0F4F1]">
              {currentTrack.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-[#5C6E62] dark:text-[#9FB1A5] font-medium">
              <span>{currentTrack.voiceLabel}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="font-mono tabular-nums text-[11px]">
                {formatSeconds(currentTime)} / {formatSeconds(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Skip +15s */}
          <button
            onClick={() => skipSeconds(15)}
            aria-label="Skip forward 15 seconds"
            title="Forward 15 seconds"
            className="p-2.5 rounded-full text-[#526357] dark:text-[#9FB1A5] hover:text-[#1E2621] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Play / Pause button */}
          <button
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-11 h-11 rounded-full bg-[#31523D] dark:bg-[#436C52] text-white flex items-center justify-center active:scale-95 shadow-sm transition-transform"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
