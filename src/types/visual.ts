export interface VisualPalette {
  background: string;
  foreground: string;
  accent: string;
  secondary?: string;
}

export type VisualMotionProfile = 'still' | 'drift' | 'flow' | 'pulse';

export interface VisualComposition {
  id: string;
  title: string;
  palette: VisualPalette;
  motionProfile: VisualMotionProfile;
  intensity: number;
  audioReactive: boolean;
}

export interface EnvironmentConfiguration {
  id: string;
  name: string;
  compositionId: string;
  palette: VisualPalette;
  atmosphere: 'interior' | 'open' | 'abstract';
  transitionDurationMs: number;
  reducedMotion: boolean;
}
