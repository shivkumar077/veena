import type {
  MusicSourceOption,
  ProviderMusicSourceId,
} from '../../types/workspace';

export const musicSourceOptions = {
  appleMusic: {
    id: 'apple-music',
    name: 'Apple Music',
    kind: 'provider',
    connectionStatus: 'not-connected',
    availability: 'planned',
    description:
      'Provider authorization is not available yet. Selecting this source will not connect an account.',
  },
  youtubeMusic: {
    id: 'youtube-music',
    name: 'YouTube Music',
    kind: 'provider',
    connectionStatus: 'not-connected',
    availability: 'planned',
    description:
      'Provider authorization is not available yet. Selecting this source will not connect an account.',
  },
  localAudio: {
    id: 'local-audio',
    name: 'Local audio',
    kind: 'local',
    connectionStatus: 'not-applicable',
    availability: 'available',
    description:
      'Choose an audio file stored on this device. Playback is not available yet.',
  },
} as const satisfies Record<string, MusicSourceOption>;

export const providerMusicSourceIds = [
  musicSourceOptions.appleMusic.id,
  musicSourceOptions.youtubeMusic.id,
] as const satisfies readonly ProviderMusicSourceId[];
