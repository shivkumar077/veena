import { useRef, type ChangeEvent } from 'react';
import type {
  MusicSourceId,
  MusicSourceSelectionState,
  ProviderMusicSourceId,
} from '../../types/workspace';
import { getSourceSwitchBlock, musicSourceOptions } from './musicSources';

interface MusicSourceSelectionProps {
  selection: MusicSourceSelectionState;
  notice: string | null;
  onSelectSource: (sourceId: MusicSourceId) => void;
  onChooseLocalFile: (file: File) => void;
  onClearSelection: () => void;
  onBlocked: (notice: string | null) => void;
}

const providerOptions = [
  musicSourceOptions.appleMusic,
  musicSourceOptions.youtubeMusic,
] as const satisfies readonly {
  id: ProviderMusicSourceId;
  name: string;
}[];

function SourceIcon({ sourceId }: { sourceId: MusicSourceId }) {
  if (sourceId === 'apple-music') {
    return (
      <svg aria-hidden="true" className="source-icon" viewBox="0 0 48 48">
        <defs>
          <linearGradient id="apple-music-note" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#f28b98" />
            <stop offset=".52" stopColor="#c45b91" />
            <stop offset="1" stopColor="#8b62b2" />
          </linearGradient>
        </defs>
        <path
          d="M33.8 8.3c-.1 0-.2 0-.4.1L13 13.1a1.8 1.8 0 0 0-1.4 1.8v19.6a5.6 5.6 0 1 0 3.5-5.2V17.1l15.3-3.6v14.8a5.6 5.6 0 1 0 3.5-5.2V10.1a1.8 1.8 0 0 0-1.8-1.8h-.3Z"
          fill="url(#apple-music-note)"
        />
      </svg>
    );
  }

  if (sourceId === 'youtube-music') {
    return (
      <svg aria-hidden="true" className="source-icon" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="17"
          fill="none"
          stroke="#ff4e45"
          strokeWidth="3.5"
        />
        <path d="m21 16.8 12 7.2-12 7.2V16.8Z" fill="#ff4e45" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="source-icon" viewBox="0 0 48 48">
      <path
        d="M29.4 8.5v21.1a5.1 5.1 0 1 1-3.2-4.7V14l10.2-2.2v16.4a5.1 5.1 0 1 1-3.2-4.7V8l-3.8.5ZM10 37.5h28v2H10z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MusicSourceSelection({
  selection,
  notice,
  onSelectSource,
  onChooseLocalFile,
  onClearSelection,
  onBlocked,
}: MusicSourceSelectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      onChooseLocalFile(file);
    }
    event.currentTarget.value = '';
  };

  const requestLocalFile = () => {
    const block = getSourceSwitchBlock(selection, 'local-audio');
    if (block) {
      const name =
        block.sourceId === 'apple-music'
          ? 'Apple Music'
          : block.sourceId === 'youtube-music'
            ? 'YouTube Music'
            : 'Local Audio';
      onBlocked(
        block.kind === 'disconnect-provider'
          ? `Disconnect ${name} before switching sources.`
          : `Clear your ${name} selection before switching sources.`,
      );
      return;
    }
    onBlocked(null);
    fileInputRef.current?.click();
  };

  const selectedSource = selection.selectedSource;

  return (
    <div className="workspace-source-selection">
      <div
        aria-label="Choose a music source"
        className="workspace-source-grid"
        role="group"
      >
        {providerOptions.map((source) => (
          <button
            aria-pressed={selectedSource === source.id}
            className="workspace-source-choice"
            data-testid={`source-choice-${source.id}`}
            key={source.id}
            onClick={() => onSelectSource(source.id)}
            type="button"
          >
            <span className="workspace-source-choice__icon">
              <SourceIcon sourceId={source.id} />
            </span>
            <span className="workspace-source-choice__name">{source.name}</span>
          </button>
        ))}

        <input
          accept="audio/*"
          aria-label="Choose a local audio file"
          className="workspace-visually-hidden"
          data-testid="local-audio-input"
          onChange={handleFileChange}
          ref={fileInputRef}
          tabIndex={-1}
          type="file"
        />
        <button
          aria-pressed={selectedSource === 'local-audio'}
          className="workspace-source-choice"
          data-testid="source-choice-local-audio"
          onClick={requestLocalFile}
          type="button"
        >
          <span className="workspace-source-choice__icon workspace-source-choice__icon--local">
            <SourceIcon sourceId="local-audio" />
          </span>
          <span className="workspace-source-choice__name">Local Audio</span>
        </button>
      </div>

      {selectedSource && (
        <div className="workspace-selection-control">
          <p className="workspace-selection-control__detail" role="status">
            {selectedSource === 'local-audio'
              ? selection.localFileName
                ? `${selection.localFileName} stays on this device.`
                : 'Local Audio selected · On this device.'
              : `${selectedSource === 'apple-music' ? 'Apple Music' : 'YouTube Music'} selected · Not connected.`}
          </p>
          <button
            className="workspace-clear-selection"
            onClick={onClearSelection}
            type="button"
          >
            Clear selection
          </button>
        </div>
      )}

      {notice && (
        <p className="workspace-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}
    </div>
  );
}
