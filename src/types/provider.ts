import type { AudioTrack } from './audio';

export interface ProviderSearchOptions {
  limit?: number;
  signal?: AbortSignal;
}

export interface PlaybackSource {
  url: string;
  mimeType?: string;
  expiresAt?: string;
}

export interface MusicProvider {
  readonly id: string;
  readonly displayName: string;
  search(query: string, options?: ProviderSearchOptions): Promise<AudioTrack[]>;
  getTrack(trackId: string, signal?: AbortSignal): Promise<AudioTrack | null>;
  getPlaybackSource(
    trackId: string,
    signal?: AbortSignal,
  ): Promise<PlaybackSource>;
}
