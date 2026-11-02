import type {
  MusicSourceOption,
  MusicSourceId,
  MusicSourceSelectionState,
  ProviderMusicSourceId,
} from '../../types/workspace';

export const musicSourceOptions = {
  appleMusic: {
    id: 'apple-music',
    name: 'Apple Music',
    kind: 'provider',
    connectionStatus: 'not-connected',
    availability: 'planned',
    description: 'Provider source',
  },
  youtubeMusic: {
    id: 'youtube-music',
    name: 'YouTube Music',
    kind: 'provider',
    connectionStatus: 'not-connected',
    availability: 'planned',
    description: 'Provider source',
  },
  localAudio: {
    id: 'local-audio',
    name: 'Local audio',
    kind: 'local',
    connectionStatus: 'not-applicable',
    availability: 'available',
    description: 'Audio on this device',
  },
} as const satisfies Record<string, MusicSourceOption>;

export const providerMusicSourceIds = [
  musicSourceOptions.appleMusic.id,
  musicSourceOptions.youtubeMusic.id,
] as const satisfies readonly ProviderMusicSourceId[];

export type SourceSwitchBlock =
  | { kind: 'clear-selection'; sourceId: MusicSourceId }
  | { kind: 'disconnect-provider'; sourceId: ProviderMusicSourceId };

export function getSourceSwitchBlock(
  selection: MusicSourceSelectionState,
  nextSourceId: MusicSourceId,
): SourceSwitchBlock | null {
  if (
    selection.connectedProviderId &&
    selection.connectedProviderId !== nextSourceId
  ) {
    return {
      kind: 'disconnect-provider',
      sourceId: selection.connectedProviderId,
    };
  }

  if (selection.selectedSource && selection.selectedSource !== nextSourceId) {
    return {
      kind: 'clear-selection',
      sourceId: selection.selectedSource,
    };
  }

  return null;
}

export function clearMusicSourceSelection(
  selection: MusicSourceSelectionState,
):
  | { state: MusicSourceSelectionState; blockedBy: null }
  | { state: null; blockedBy: SourceSwitchBlock } {
  if (selection.connectedProviderId) {
    return {
      state: null,
      blockedBy: {
        kind: 'disconnect-provider',
        sourceId: selection.connectedProviderId,
      },
    };
  }

  return {
    state: {
      selectedSource: null,
      connectedProviderId: null,
      localFileName: null,
    },
    blockedBy: null,
  };
}

export function selectMusicSource(
  selection: MusicSourceSelectionState,
  sourceId: MusicSourceId,
  localFileName: string | null = null,
):
  | { state: MusicSourceSelectionState; blockedBy: null }
  | { state: null; blockedBy: SourceSwitchBlock } {
  const blockedBy = getSourceSwitchBlock(selection, sourceId);
  if (blockedBy) {
    return { state: null, blockedBy };
  }

  return {
    state: {
      selectedSource: sourceId,
      connectedProviderId: selection.connectedProviderId,
      localFileName: sourceId === 'local-audio' ? localFileName : null,
    },
    blockedBy: null,
  };
}
