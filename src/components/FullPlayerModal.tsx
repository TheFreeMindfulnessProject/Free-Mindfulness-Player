import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Heart,
  Download,
  ArrowDownToLine,
  Moon,
  Loader2,
  ExternalLink,
  Bell,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import { playMindfulBell } from '../utils/bellSound';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const FullPlayerModal: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    playbackRate,
    error,
    sleepTimerRemaining,
    sleepTimerMinutes,
    isFullPlayerOpen,
    setIsFullPlayerOpen,
    togglePlayPause,
    seekTo,
    skipSeconds,
    setRate,
    setSleepTimer,
    playNextTrack,
    playPreviousTrack,
    toggleFavorite,
    isFavorite,
    downloadForOffline,
    removeFromOffline,
    isDownloaded,
    downloadProgress,
  } = useAudio();

  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isTimerMenuOpen, setIsTimerMenuOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isFullPlayerOpen) return;
      if (e.key === 'Escape') {
        setIsFullPlayerOpen(false);
      } else if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'ArrowLeft') {
        skipSeconds(-15);
      } else if (e.key === 'ArrowRight') {
        skipSeconds(15);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullPlayerOpen, isPlaying]);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const favorited = isFavorite(currentTrack.id);
  const downloaded = isDownloaded(currentTrack.id);
  const progressPercent = downloadProgress[currentTrack.id];
  const remainingSeconds = Math.max(0, duration - currentTime);

  const speedOptions = [0.8, 0.9, 1.0, 1.1, 1.2];
  const timerOptions = [
    { label: 'Off', minutes: null },
    { label: '5 min', minutes: 5 },
    { label: '10 min', minutes: 10 },
    { label: '15 min', minutes: 15 },
    { label: '20 min', minutes: 20 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-title"
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fadeIn"
    >
      {/* Click outside to close */}
      <div
        className="absolute inset-0"
        onClick={() => setIsFullPlayerOpen(false)}
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-md mx-auto bg-[#FAF7F2] dark:bg-[#131915] rounded-t-3xl sm:rounded-3xl border-t sm:border border-stone-200/80 dark:border-white/[0.08] shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.06]">
          <button
            onClick={() => setIsFullPlayerOpen(false)}
            aria-label="Minimize player"
            className="p-2.5 rounded-full text-[#4B5950] dark:text-[#A7B6AB] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#426B50] dark:text-[#7EA089]">
              {currentTrack.section}
            </span>
            <p className="text-xs text-[#6B7D71] dark:text-[#9FB1A5] font-medium">
              Free Mindfulness Player
            </p>
          </div>

          <div className="w-11" />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col items-center justify-center space-y-6">
          {/* Zen Animated Breathing Disc */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2">
            <div
              className={`absolute inset-0 rounded-full bg-[#385944]/10 dark:bg-[#6F9B7E]/15 transition-all duration-1000 ${
                isPlaying ? 'scale-110 opacity-70 animate-pulse' : 'scale-100 opacity-40'
              }`}
            />
            <div
              className={`absolute inset-3 rounded-full bg-[#385944]/15 dark:bg-[#6F9B7E]/20 transition-all duration-700 ${
                isPlaying ? 'scale-105' : 'scale-95'
              }`}
            />
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-[#EAE4D9] to-[#D8CFBF] dark:from-[#212B24] dark:to-[#17201A] flex flex-col items-center justify-center shadow-inner border border-black/[0.05] dark:border-white/[0.05] p-4 text-center">
              <span className="text-xs text-[#526357] dark:text-[#9FB1A5] font-semibold">
                {currentTrack.durationFormatted}
              </span>
              <span className="text-sm font-bold text-[#1E2621] dark:text-[#E8EFEA] mt-1 line-clamp-2">
                {currentTrack.title}
              </span>
            </div>
          </div>

          {/* Title & Details */}
          <div className="text-center max-w-sm">
            <h2 id="player-title" className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E2621] dark:text-[#F0F4F1]">
              {currentTrack.title}
            </h2>
            <div className="mt-1 flex items-center justify-center gap-2 text-xs text-[#5C6E62] dark:text-[#9FB1A5] font-medium">
              <span>{currentTrack.voiceLabel}</span>
            </div>
            <p className="mt-2 text-xs text-[#637569] dark:text-[#A7B6AB] leading-relaxed">
              {currentTrack.description}
            </p>
          </div>

          {/* Scrub / Progress Bar */}
          <div className="w-full space-y-1.5">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              aria-label="Seek track"
              className="w-full h-2 bg-black/[0.08] dark:bg-white/[0.12] rounded-lg appearance-none cursor-pointer accent-[#385944] dark:accent-[#6F9B7E]"
            />
            <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#687B6F] dark:text-[#93A599]">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(remainingSeconds)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
            {/* Skip -15s */}
            <button
              onClick={() => skipSeconds(-15)}
              title="Rewind 15 seconds"
              aria-label="Rewind 15 seconds"
              className="p-3 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Previous Track */}
            <button
              onClick={playPreviousTrack}
              title="Previous meditation"
              aria-label="Previous track"
              className="p-3 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Large Play/Pause */}
            <button
              onClick={togglePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-16 h-16 rounded-full bg-[#31523D] dark:bg-[#436C52] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            >
              {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin text-white" />
              ) : isPlaying ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            {/* Next Track */}
            <button
              onClick={playNextTrack}
              title="Next meditation"
              aria-label="Next track"
              className="p-3 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Skip +15s */}
            <button
              onClick={() => skipSeconds(15)}
              title="Forward 15 seconds"
              aria-label="Forward 15 seconds"
              className="p-3 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] active:scale-95 transition-all"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>

          {/* Secondary Utilities Bar */}
          <div className="flex items-center justify-around w-full pt-2 border-t border-black/[0.05] dark:border-white/[0.06]">
            {/* Speed selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSpeedMenuOpen(!isSpeedMenuOpen);
                  setIsTimerMenuOpen(false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
                title="Playback speed"
              >
                {playbackRate}x
              </button>

              {isSpeedMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1A211D] rounded-2xl shadow-lg border border-stone-200/80 dark:border-white/[0.08] p-1 flex flex-col gap-0.5 z-20 min-w-[70px]">
                  {speedOptions.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setRate(rate);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 text-xs rounded-xl font-semibold text-left transition-colors ${
                        playbackRate === rate
                          ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
                          : 'text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep Timer */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsTimerMenuOpen(!isTimerMenuOpen);
                  setIsSpeedMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  sleepTimerRemaining !== null
                    ? 'text-[#385944] dark:text-[#7EA089] bg-[#385944]/15 dark:bg-[#7EA089]/20'
                    : 'text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
                title="Sleep timer"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>
                  {sleepTimerRemaining !== null
                    ? `${Math.ceil(sleepTimerRemaining / 60)}m`
                    : 'Timer'}
                </span>
              </button>

              {isTimerMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1A211D] rounded-2xl shadow-lg border border-stone-200/80 dark:border-white/[0.08] p-2 grid grid-cols-2 gap-1 z-20 w-44">
                  {timerOptions.map((opt) => (
                    <button
                      key={opt.label}
                      onClick={() => {
                        setSleepTimer(opt.minutes);
                        setIsTimerMenuOpen(false);
                      }}
                      className={`px-2.5 py-1.5 text-xs rounded-xl font-semibold text-center transition-colors ${
                        (opt.minutes === null && sleepTimerRemaining === null) ||
                        (opt.minutes !== null && sleepTimerMinutes === opt.minutes)
                          ? 'bg-[#31523D] dark:bg-[#436C52] text-white'
                          : 'text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite toggle */}
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="p-2.5 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:text-rose-500 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={favorited ? 'Remove favorite' : 'Save favorite'}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Offline cache toggle */}
            <button
              onClick={() => {
                if (downloaded) {
                  removeFromOffline(currentTrack);
                } else {
                  downloadForOffline(currentTrack);
                }
              }}
              disabled={progressPercent !== undefined}
              className={`p-2.5 rounded-full transition-colors ${
                downloaded
                  ? 'text-[#385944] dark:text-[#7EA089] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                  : 'text-[#45544A] dark:text-[#B5C2B8] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
              title={downloaded ? 'Saved offline' : 'Save for offline'}
            >
              {progressPercent !== undefined ? (
                <span className="text-[10px] font-mono tabular-nums text-[#385944]">
                  {progressPercent}%
                </span>
              ) : downloaded ? (
                <div className="relative">
                  <Download className="w-4 h-4 text-[#385944] dark:text-[#7EA089]" />
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#385944] dark:bg-[#7EA089]" />
                </div>
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Direct MP3 file save */}
            <a
              href={currentTrack.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Download MP3 file"
              className="p-2.5 rounded-full text-[#45544A] dark:text-[#B5C2B8] hover:text-[#1E2621] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
            >
              <ArrowDownToLine className="w-4 h-4" />
            </a>
          </div>

          {/* Clean link */}
          <div className="text-center pt-1">
            <a
              href="https://www.freemindfulness.org/lthtr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#7A8C80] dark:text-[#889B8E] hover:text-[#385944] dark:hover:text-[#A7C5B0] hover:underline transition-colors font-medium"
            >
              <span>A selection of free mindfulness meditation audios from The Free Mindfulness Project</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
