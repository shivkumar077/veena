import type { AudioTrack, PlaybackState } from '../../types';

export interface PlaybackEngine {
  getState(): PlaybackState;
  subscribe(listener: (state: PlaybackState) => void): () => void;
  load(track: AudioTrack): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(positionMs: number): void;
  setVolume(volume: number): void;
  dispose(): void;
}
