import { MeditationTrack } from '../types';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Default Measurement ID provided by user
export const GA_MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-RPBRJ2EPHT').trim();

/**
 * Initializes Google Analytics 4 (gtag.js) if not already loaded in index.html.
 * Enables IP anonymization by default for user privacy.
 */
export function initGA(): void {
  if (typeof window === 'undefined') return;

  const measurementId = GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  // Already initialized via index.html or previous call
  if (window.gtag || document.getElementById('ga-gtag-script')) return;

  const script = document.createElement('script');
  script.id = 'ga-gtag-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Sends a custom event to Google Analytics.
 */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventParams);
  }
}

export function trackPlayMeditation(track: MeditationTrack): void {
  trackEvent('play_meditation', {
    track_id: track.id,
    track_title: track.title,
    duration_minutes: track.durationMinutes,
    narrator: track.voiceLabel,
    section: track.section,
  });
}

export function trackCompleteMeditation(track: MeditationTrack): void {
  trackEvent('complete_meditation', {
    track_id: track.id,
    track_title: track.title,
    duration_minutes: track.durationMinutes,
    narrator: track.voiceLabel,
  });
}

export function trackOfflineSave(track: MeditationTrack): void {
  trackEvent('save_offline', {
    track_id: track.id,
    track_title: track.title,
  });
}

export function trackFavoriteToggle(track: MeditationTrack, isFavorited: boolean): void {
  trackEvent(isFavorited ? 'favorite_track' : 'unfavorite_track', {
    track_id: track.id,
    track_title: track.title,
  });
}
