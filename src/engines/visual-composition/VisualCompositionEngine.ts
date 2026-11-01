import type { AudioTrack, PlaybackState, VisualComposition } from '../../types';

export interface VisualCompositionEngine {
  createComposition(track: AudioTrack): Promise<VisualComposition>;
  updateComposition(
    composition: VisualComposition,
    playbackState: PlaybackState,
  ): void;
  dispose(): void;
}
