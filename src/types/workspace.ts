export type ProviderMusicSourceId = 'apple-music' | 'youtube-music';
export type LocalMusicSourceId = 'local-audio';
export type MusicSourceId = ProviderMusicSourceId | LocalMusicSourceId;

export type MusicSourceConnectionStatus =
  'not-connected' | 'connecting' | 'connected' | 'error' | 'not-applicable';

export type MusicSourceAvailability = 'planned' | 'available';

export interface MusicSourceOption {
  id: MusicSourceId;
  name: string;
  kind: 'provider' | 'local';
  connectionStatus: MusicSourceConnectionStatus;
  availability: MusicSourceAvailability;
  description: string;
}

export interface MusicSourceSelectionState {
  selectedSource: MusicSourceId | null;
  connectedProviderId: ProviderMusicSourceId | null;
  localFileName: string | null;
}

export interface MusicProviderAuthorizationAdapter {
  readonly sourceId: ProviderMusicSourceId;
  connect(signal?: AbortSignal): Promise<void>;
  disconnect(signal?: AbortSignal): Promise<void>;
}
