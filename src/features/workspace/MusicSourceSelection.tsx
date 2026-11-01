import { useRef, type ChangeEvent } from 'react';
import type {
  MusicSourceId,
  MusicSourceSelectionState,
  ProviderMusicSourceId,
} from '../../types/workspace';
import { musicSourceOptions } from './musicSources';

interface MusicSourceSelectionProps {
  selection: MusicSourceSelectionState;
  notice: string | null;
  onSelectProvider: (sourceId: ProviderMusicSourceId) => void;
  onSelectLocalFile: (file: File) => void;
  onContinueAsGuest: () => void;
}

const providerOptions = [
  musicSourceOptions.appleMusic,
  musicSourceOptions.youtubeMusic,
] as const;

function isPreferred(
  selection: MusicSourceSelectionState,
  sourceId: MusicSourceId,
) {
  return selection.preferredSource === sourceId;
}

export function MusicSourceSelection({
  selection,
  notice,
  onSelectProvider,
  onSelectLocalFile,
  onContinueAsGuest,
}: MusicSourceSelectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      onSelectLocalFile(file);
    }
    event.currentTarget.value = '';
  };

  return (
    <section aria-labelledby="sources-heading" className="workspace-area">
      <header className="workspace-area__heading">
        <p className="workspace-eyebrow">LISTENING SOURCES</p>
        <h2 id="sources-heading">Choose how you listen</h2>
        <p>
          A source is optional. Continue as a guest now, or make a source
          selection for later.
        </p>
      </header>

      <div className="workspace-guest-action">
        <div>
          <h3>Prefer to begin without a source?</h3>
          <p>No VEENA account or provider connection is required.</p>
        </div>
        <button
          className="workspace-button workspace-button--primary"
          onClick={onContinueAsGuest}
          type="button"
        >
          Continue as guest
        </button>
      </div>

      <div className="workspace-source-grid">
        {providerOptions.map((source, index) => (
          <article
            className="workspace-source-card"
            data-testid={`source-card-${source.id}`}
            key={source.id}
          >
            <div className="workspace-source-card__heading">
              <span aria-hidden="true" className="workspace-source-card__mark">
                {index === 0 ? 'A' : '▶'}
              </span>
              <div>
                <h3>{source.name}</h3>
                <span className="workspace-status">
                  {source.connectionStatus === 'not-connected'
                    ? 'Not connected'
                    : source.connectionStatus}
                </span>
              </div>
            </div>
            <p>{source.description}</p>
            <button
              aria-pressed={isPreferred(selection, source.id)}
              className="workspace-button workspace-button--secondary"
              onClick={() => onSelectProvider(source.id)}
              type="button"
            >
              {isPreferred(selection, source.id)
                ? `Selected: ${source.name}`
                : `Select ${source.name}`}
            </button>
          </article>
        ))}

        <article
          className="workspace-source-card workspace-source-card--local"
          data-testid="source-card-local-audio"
        >
          <div className="workspace-source-card__heading">
            <span aria-hidden="true" className="workspace-source-card__mark">
              ♪
            </span>
            <div>
              <h3>{musicSourceOptions.localAudio.name}</h3>
              <span className="workspace-status">On this device</span>
            </div>
          </div>
          <p>{musicSourceOptions.localAudio.description}</p>
          <input
            accept="audio/*"
            aria-label="Choose a local audio file"
            className="workspace-visually-hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
            tabIndex={-1}
            type="file"
          />
          <button
            aria-pressed={isPreferred(
              selection,
              musicSourceOptions.localAudio.id,
            )}
            className="workspace-button workspace-button--secondary"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {selection.localFileName
              ? 'Choose another file'
              : 'Choose an audio file'}
          </button>
          {selection.localFileName && (
            <p className="workspace-source-card__file" role="status">
              Selected on this device: {selection.localFileName}. It will not be
              uploaded or played in this milestone.
            </p>
          )}
        </article>
      </div>

      {notice && (
        <p className="workspace-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </section>
  );
}
