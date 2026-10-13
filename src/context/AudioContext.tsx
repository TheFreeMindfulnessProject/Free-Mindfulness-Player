import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { MeditationTrack } from '../types';
import { cacheTrackAudio, getCachedAudioBlobUrl, isTrackCached, removeTrackFromCache } from '../utils/offlineCache';
import { MEDITATIONS } from '../data/meditations';

interface AudioContextType {
  currentTrack: MeditationTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  error: string | null;
  sleepTimerRemaining: number | null; // seconds
  sleepTimerMinutes: number | null;
  isFullPlayerOpen: boolean;
  favorites: string[];
  completedTracks: string[];
  cachedTrackIds: string[];
  downloadProgress: Record<string, number>;
  playTrack: (track: MeditationTrack) => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  skipSeconds: (seconds: number) => void;
  setRate: (rate: number) => void;
  setSleepTimer: (minutes: number | null) => void;
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  toggleCompleted: (trackId: string) => void;
  isCompleted: (trackId: string) => boolean;
  setIsFullPlayerOpen: (open: boolean) => void;
  downloadForOffline: (track: MeditationTrack) => Promise<void>;
  removeFromOffline: (track: MeditationTrack) => Promise<void>;
  isDownloaded: (trackId: string) => boolean;
}

const AudioContext = createContext<AudioContextType | null>(null);

const STORAGE_KEY_FAVORITES = 'lthtr_favorites_v1';
const STORAGE_KEY_COMPLETED = 'lthtr_completed_v1';
const STORAGE_KEY_RATE = 'lthtr_playback_rate_v1';

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<MeditationTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_RATE);
      if (saved) return parseFloat(saved) || 1;
    }
    return 1;
  });
  const [error, setError] = useState<string | null>(null);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  // Sleep timer
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const sleepTimerIntervalRef = useRef<number | null>(null);

  // Favorites & Completed
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [completedTracks, setCompletedTracks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_COMPLETED);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  // Offline caching status
  const [cachedTrackIds, setCachedTrackIds] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});

  // Check which tracks are already cached on initial load
  useEffect(() => {
    async function checkAllCached() {
      const cachedList: string[] = [];
      for (const track of MEDITATIONS) {
        const cached = await isTrackCached(track.id, track.streamUrl);
        if (cached) cachedList.push(track.id);
      }
      setCachedTrackIds(cachedList);
    }
    checkAllCached();
  }, []);

  // Save favorites & completed to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedTracks));
  }, [completedTracks]);

  // Initialize Audio element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.playbackRate = playbackRate;
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setError(null);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onEnded = () => {
      setIsPlaying(false);
      if (currentTrack) {
        // Mark as completed
        setCompletedTracks((prev) =>
          prev.includes(currentTrack.id) ? prev : [...prev, currentTrack.id]
        );
      }
    };
    const onError = () => {
      if (!audio.src || audio.src === window.location.href) return;
      console.warn('Audio playback error encountered');
      setIsLoading(false);
      setIsPlaying(false);
      // Try fallback if available and not already on fallback
      if (currentTrack && audio.src !== currentTrack.fallbackStreamUrl) {
        console.log('Retrying with fallback URL...');
        audio.src = currentTrack.fallbackStreamUrl;
        audio.play().catch((err) => {
          console.error('Fallback stream also failed:', err);
          setError('Could not play stream. Tap to retry or use direct download.');
        });
      } else {
        setError('Playback issue. You can tap direct download or retry.');
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update MediaSession API for lock-screen controls
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.voiceLabel,
      album: `Free Mindfulness · ${currentTrack.section}`,
      artwork: [
        {
          src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=512&auto=format&fit=crop&q=80',
          sizes: '512x512',
          type: 'image/jpeg',
        },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play().catch(console.error);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler('seekbackward', (details) => {
      const skipTime = details.seekOffset || 15;
      skipSeconds(-skipTime);
    });
    navigator.mediaSession.setActionHandler('seekforward', (details) => {
      const skipTime = details.seekOffset || 15;
      skipSeconds(skipTime);
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPreviousTrack();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNextTrack();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
  }, [currentTrack]);

  // Sleep Timer logic
  useEffect(() => {
    if (sleepTimerRemaining === null) {
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
      return;
    }

    if (sleepTimerRemaining <= 0) {
      // Gently pause audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      setSleepTimerMinutesState(null);
      setSleepTimerRemaining(null);
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
      return;
    }

    sleepTimerIntervalRef.current = window.setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sleepTimerIntervalRef.current) {
        clearInterval(sleepTimerIntervalRef.current);
        sleepTimerIntervalRef.current = null;
      }
    };
  }, [sleepTimerRemaining]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutesState(minutes);
    if (minutes === null) {
      setSleepTimerRemaining(null);
    } else {
      setSleepTimerRemaining(minutes * 60);
    }
  };

  const playTrack = async (track: MeditationTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    setError(null);
    setIsLoading(true);
    setCurrentTrack(track);

    try {
      // Check if available in offline cache first
      const cachedBlobUrl = await getCachedAudioBlobUrl(track.streamUrl);
      const audioSource = cachedBlobUrl || track.streamUrl;

      if (!audio.src.endsWith(audioSource) && audio.src !== audioSource) {
        audio.src = audioSource;
        audio.playbackRate = playbackRate;
      }
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Playback initiation failed:', err);
      // Try fallback URL directly
      try {
        audio.src = track.fallbackStreamUrl;
        audio.playbackRate = playbackRate;
        await audio.play();
        setIsPlaying(true);
      } catch (fallbackErr) {
        console.error('Playback failed on both sources:', fallbackErr);
        setError('Audio could not start automatically. Tap play to retry.');
        setIsPlaying(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setError(null);
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Play resumed failed:', err);
        setError('Unable to resume playback. Tap to retry.');
      }
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipSeconds = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.duration || 0, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    localStorage.setItem(STORAGE_KEY_RATE, rate.toString());
  };

  const playNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = MEDITATIONS.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % MEDITATIONS.length;
    playTrack(MEDITATIONS[nextIndex]);
  };

  const playPreviousTrack = () => {
    if (!currentTrack) return;
    const currentIndex = MEDITATIONS.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + MEDITATIONS.length) % MEDITATIONS.length;
    playTrack(MEDITATIONS[prevIndex]);
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  const toggleCompleted = (trackId: string) => {
    setCompletedTracks((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isCompleted = (trackId: string) => completedTracks.includes(trackId);

  const downloadForOffline = async (track: MeditationTrack) => {
    setDownloadProgress((prev) => ({ ...prev, [track.id]: 5 }));
    try {
      await cacheTrackAudio(track.id, track.streamUrl, (percent) => {
        setDownloadProgress((prev) => ({ ...prev, [track.id]: percent }));
      });
      setCachedTrackIds((prev) => (prev.includes(track.id) ? prev : [...prev, track.id]));
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
    } catch (err) {
      console.error('Failed to cache track for offline:', err);
      setDownloadProgress((prev) => {
        const next = { ...prev };
        delete next[track.id];
        return next;
      });
      alert('Unable to cache track offline in this browser. You can still download the MP3 directly!');
    }
  };

  const removeFromOffline = async (track: MeditationTrack) => {
    await removeTrackFromCache(track.streamUrl);
    setCachedTrackIds((prev) => prev.filter((id) => id !== track.id));
  };

  const isDownloaded = (trackId: string) => cachedTrackIds.includes(trackId);

  return (
    <AudioContext.Provider
      value={{
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
        favorites,
        completedTracks,
        cachedTrackIds,
        downloadProgress,
        playTrack,
        togglePlayPause,
        seekTo,
        skipSeconds,
        setRate,
        setSleepTimer,
        playNextTrack,
        playPreviousTrack,
        toggleFavorite,
        isFavorite,
        toggleCompleted,
        isCompleted,
        setIsFullPlayerOpen,
        downloadForOffline,
        removeFromOffline,
        isDownloaded,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
