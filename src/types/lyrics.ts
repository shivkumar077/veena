export interface TimedLyricWord {
  text: string;
  startMs: number;
  endMs?: number;
}

export interface TimedLyricLine {
  id: string;
  startMs: number;
  endMs?: number;
  text: string;
  words?: TimedLyricWord[];
}

export interface LyricsDocument {
  id: string;
  trackId: string;
  source: string;
  language?: string;
  isSynchronized: boolean;
  lines: TimedLyricLine[];
}
