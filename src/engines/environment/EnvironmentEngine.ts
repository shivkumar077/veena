import type { EnvironmentConfiguration } from '../../types';

export interface EnvironmentEngine {
  apply(configuration: EnvironmentConfiguration): Promise<void>;
  transitionTo(
    configuration: EnvironmentConfiguration,
    durationMs: number,
  ): Promise<void>;
  dispose(): void;
}
