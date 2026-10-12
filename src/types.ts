export type SectionCategory =
  | 'All'
  | 'Body Scan'
  | 'Mindful Movement'
  | 'Sitting Meditation'
  | '5 minutes or less'
  | 'Silence with Bells'
  | '10 minute practices';

export type DurationFilter = 'all' | 'under5' | '5to15' | '15to30' | 'over30';
export type VoiceFilter = 'all' | 'christina' | 'paddy' | 'peter' | 'bells';

export interface MeditationTrack {
  id: string;
  driveId: string;
  title: string;
  subtitle?: string;
  section: SectionCategory;
  durationMinutes: number;
  durationFormatted: string;
  voice: 'female' | 'male' | 'bells';
  narrator: 'Christina' | 'Paddy' | 'Peter' | 'Bells';
  voiceLabel: string;
  posture?: 'lying down' | 'sitting' | 'standing' | 'walking' | 'any';
  description: string;
  recommendedWeek?: string;
  filename: string;
  streamUrl: string;
  fallbackStreamUrl: string;
  downloadUrl: string;
  viewUrl: string;
}

export interface PlayerState {
  currentTrack: MeditationTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLoading: boolean;
  error: string | null;
  sleepTimerEndsAt: number | null; // epoch timestamp
  sleepTimerMinutes: number | null;
  autoAdvance: boolean;
}

export type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
