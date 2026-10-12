import React from 'react';
import { Play, Pause, Heart, Check, Download, ArrowDownToLine, Loader2 } from 'lucide-react';
import { MeditationTrack } from '../types';
import { useAudio } from '../context/AudioContext';

interface TrackCardProps {
  track: MeditationTrack;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    playTrack,
    togglePlayPause,
    toggleFavorite,
    isFavorite,
    isCompleted,
    setIsFullPlayerOpen,
    downloadForOffline,
    removeFromOffline,
    isDownloaded,
    downloadProgress,
  } = useAudio();

  const isCurrent = currentTrack?.id === track.id;
  const isPlayingThis = isCurrent && isPlaying;
  const isLoadingThis = isCurrent && isLoading;
  const favorited = isFavorite(track.id);
  const completed = isCompleted(track.id);
  const downloaded = isDownloaded(track.id);
  const progressPercent = downloadProgress[track.id];

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const handleCardClick = () => {
    if (isCurrent) {
      setIsFullPlayerOpen(true);
    } else {
      playTrack(track);
    }
  };

  const handleOfflineToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloaded) {
      if (confirm(`Remove "${track.title}" from offline downloads?`)) {
        await removeFromOffline(track);
      }
    } else {
      await downloadForOffline(track);
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group relative p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'bg-[#EFECE5] dark:bg-[#1E2821] border border-[#385944]/35 dark:border-[#6F9B7E]/40 shadow-sm'
          : 'bg-white dark:bg-[#181F1A] border border-stone-200/70 dark:border-white/[0.06] hover:border-stone-300 dark:hover:border-white/[0.12] shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Play / Pause circular button */}
        <button
          onClick={handlePlayClick}
          aria-label={isPlayingThis ? `Pause ${track.title}` : `Play ${track.title}`}
          className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xs ${
            isPlayingThis
              ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
              : isCurrent
              ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
              : 'bg-[#F2EDE4] dark:bg-[#253028] text-[#242F26] dark:text-[#E2EBE5] group-hover:bg-[#31523D] group-hover:text-white dark:group-hover:bg-[#436C52]'
          }`}
        >
          {isLoadingThis ? (
            <Loader2 className="w-5 h-5 animate-spin text-inherit" />
          ) : isPlayingThis ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Content container taking the entire remaining width */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Full Title strictly on ONE line without clipping (no buttons to the right crowding it) */}
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap overflow-hidden transition-colors ${
                isCurrent
                  ? 'text-[#1B241E] dark:text-[#FFFFFF]'
                  : 'text-[#1E2621] dark:text-[#EDF3EF] group-hover:text-[#31523D] dark:group-hover:text-[#7EA089]'
              }`}
            >
              {track.title}
            </h3>

            {completed && (
              <span
                title="Completed"
                className="shrink-0 text-xs text-[#385944] dark:text-[#7EA089] flex items-center gap-1 font-semibold"
              >
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Row 2: Metadata moved down below the title, with actions on the right */}
          <div className="mt-1 flex items-center justify-between gap-2">
            {/* Duration and Narrator (Clean, no posture text) */}
            <div className="flex items-center gap-1.5 text-xs text-[#5E6F63] dark:text-[#9FB1A5] font-medium whitespace-nowrap">
              <span className="font-bold text-[#202B23] dark:text-[#E0EAE3]">
                {track.durationFormatted}
              </span>
              <span aria-hidden="true" className="opacity-35">·</span>
              <span>{track.voiceLabel}</span>
            </div>

            {/* Right Action Icons moved down to row 2 so title has full width */}
            <div className="flex items-center gap-1 shrink-0 -my-1">
              {/* Favorite toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(track.id);
                }}
                aria-label={favorited ? 'Remove favorite' : 'Save favorite'}
                className="p-1.5 sm:p-2 rounded-full text-[#6E7F73] dark:text-[#90A295] hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Download for Offline */}
              <button
                onClick={handleOfflineToggle}
                aria-label={downloaded ? 'Remove offline copy' : 'Save for offline'}
                title={downloaded ? 'Saved offline (tap to remove)' : 'Save for offline'}
                disabled={progressPercent !== undefined}
                className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                  downloaded
                    ? 'text-[#385944] dark:text-[#7EA089] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                    : 'text-[#6E7F73] dark:text-[#90A295] hover:text-[#1E2621] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                {progressPercent !== undefined ? (
                  <span className="text-[10px] font-mono tabular-nums text-[#385944]">
                    {progressPercent}%
                  </span>
                ) : downloaded ? (
                  <div className="relative">
                    <Download className="w-3.5 h-3.5 text-[#385944] dark:text-[#7EA089]" />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#385944] dark:bg-[#7EA089]" />
                  </div>
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Direct MP3 file save */}
              <a
                href={track.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Download MP3 file"
                aria-label={`Save MP3 file for ${track.title}`}
                className="p-1.5 sm:p-2 rounded-full text-[#6E7F73] dark:text-[#90A295] hover:text-[#1E2621] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
