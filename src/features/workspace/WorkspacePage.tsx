import { useRef, useState } from 'react';
import type {
  MusicSourceId,
  MusicSourceSelectionState,
  ProviderMusicSourceId,
} from '../../types/workspace';
import { clearMusicSourceSelection, selectMusicSource } from './musicSources';
import { MusicSourceSelection } from './MusicSourceSelection';

const initialSelection: MusicSourceSelectionState = {
  selectedSource: null,
  connectedProviderId: null,
  localFileName: null,
};

function sourceName(sourceId: MusicSourceId) {
  return sourceId === 'apple-music'
    ? 'Apple Music'
    : sourceId === 'youtube-music'
      ? 'YouTube Music'
      : 'Local Audio';
}

function blockedNotice(
  block:
    | { kind: 'clear-selection'; sourceId: MusicSourceId }
    | { kind: 'disconnect-provider'; sourceId: ProviderMusicSourceId },
) {
  const name = sourceName(block.sourceId);
  return block.kind === 'disconnect-provider'
    ? `Disconnect ${name} before switching sources.`
    : `Clear your ${name} selection before switching sources.`;
}

interface WorkspacePageProps {
  isEntering: boolean;
}

export function WorkspacePage({ isEntering }: WorkspacePageProps) {
  const [selection, setSelection] =
    useState<MusicSourceSelectionState>(initialSelection);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleSelectSource = (sourceId: MusicSourceId) => {
    const result = selectMusicSource(selection, sourceId);
    if (result.blockedBy) {
      setNotice(blockedNotice(result.blockedBy));
      return;
    }

    if (sourceId !== 'local-audio') {
      setSelection(result.state);
      setNotice(null);
    }
  };

  const handleChooseLocalFile = (file: File) => {
    const result = selectMusicSource(selection, 'local-audio', file.name);
    if (result.blockedBy) {
      setNotice(blockedNotice(result.blockedBy));
      return;
    }

    setSelection(result.state);
    setNotice(null);
  };

  const handleClearSelection = () => {
    const result = clearMusicSourceSelection(selection);
    if (result.blockedBy) {
      setNotice(blockedNotice(result.blockedBy));
      return;
    }

    setSelection(result.state);
    setNotice(null);
  };

  const handleHome = () => {
    handleClearSelection();
    headingRef.current?.focus({ preventScroll: true });
    const panel = document.querySelector<HTMLElement>('.workspace-panel');
    if (panel && typeof panel.scrollIntoView === 'function') {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <section
      aria-label="VEENA source selection"
      className={
        isEntering
          ? 'workspace-page workspace-page--entering'
          : 'workspace-page'
      }
      data-transition-entering={isEntering}
      data-testid="workspace"
    >
      <div className="workspace-frame">
        <header className="workspace-header">
          <button
            aria-label="VEENA source selection home"
            className="workspace-brand"
            onClick={handleHome}
            type="button"
          >
            <span className="workspace-brand__name">VEENA</span>
            <span className="workspace-brand__devanagari" lang="hi">
              वीणा
            </span>
            <span className="workspace-brand__tagline">
              Beyond What You Hear.
            </span>
          </button>
        </header>

        <div className="workspace-main">
          <div className="workspace-panel">
            <div className="workspace-panel__intro">
              <p className="workspace-eyebrow">VEENA · LISTENING SOURCES</p>
              <h1 id="sources-heading" ref={headingRef} tabIndex={-1}>
                Choose your source
              </h1>
              <span aria-hidden="true" className="workspace-panel__rule" />
            </div>

            <MusicSourceSelection
              notice={notice}
              onBlocked={setNotice}
              onChooseLocalFile={handleChooseLocalFile}
              onClearSelection={handleClearSelection}
              onSelectSource={handleSelectSource}
              selection={selection}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
