import type { AudioTrack, LyricsDocument, TimedLyricLine } from '../../types';

export interface LyricsEngine {
  getLyrics(
    track: AudioTrack,
    signal?: AbortSignal,
  ): Promise<LyricsDocument | null>;
  getActiveLine(
    document: LyricsDocument,
    positionMs: number,
  ): TimedLyricLine | null;
  dispose(): void;
}
