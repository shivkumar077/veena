export interface AudioTrack {
  id: string;
  providerId: string;
  title: string;
  artists: string[];
  album?: string;
  artworkUrl?: string;
  durationMs?: number;
  isrc?: string;
}

export type PlaybackStatus =
  'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export type RepeatMode = 'off' | 'track' | 'queue';

export interface PlaybackState {
  status: PlaybackStatus;
  track: AudioTrack | null;
  positionMs: number;
  durationMs: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
}
