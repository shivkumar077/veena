import { useState } from 'react';
import type {
  GuestSession,
  MusicSourceSelectionState,
  ProviderMusicSourceId,
  WorkspaceArea,
  WorkspaceNavigationState,
} from '../../types/workspace';
import { MusicSourceSelection } from './MusicSourceSelection';
import { WorkspaceNavigation } from './WorkspaceNavigation';

interface WorkspacePageProps {
  onReturnToWelcome: () => void;
}

function ListeningArea({
  onChooseSource,
  onOpenLyrics,
}: {
  onChooseSource: () => void;
  onOpenLyrics: () => void;
}) {
  return (
    <section aria-labelledby="listening-heading" className="workspace-area">
      <header className="workspace-area__heading">
        <p className="workspace-eyebrow">YOUR LISTENING SPACE</p>
        <h2 id="listening-heading">A place for the next song.</h2>
        <p>Nothing is playing. Choose a source whenever you are ready.</p>
      </header>

      <div
        className="workspace-listening"
        data-testid="current-listening"
        role="region"
        aria-label="Current listening area"
      >
        <span aria-hidden="true" className="workspace-listening__symbol">
          ♪
        </span>
        <p className="workspace-eyebrow">NOW LISTENING</p>
        <h3>No track selected</h3>
        <p>
          VEENA is ready when you are. Playback will be introduced in a later
          milestone.
        </p>
        <button
          className="workspace-button workspace-button--primary"
          onClick={onChooseSource}
          type="button"
        >
          Choose a music source
        </button>
      </div>

      <div className="workspace-support-grid">
        <article className="workspace-support-card">
          <p className="workspace-eyebrow">LYRICS</p>
          <h3>Words, in their own time.</h3>
          <p>
            Lyrics will appear here when the lyrics experience is available.
          </p>
          <button
            className="workspace-text-button"
            onClick={onOpenLyrics}
            type="button"
          >
            Open lyrics area
          </button>
        </article>
        <article className="workspace-support-card workspace-support-card--quiet">
          <p className="workspace-eyebrow">GUEST SESSION</p>
          <h3>Listening without an account</h3>
          <p>
            Your visit does not require a VEENA account or personal details.
          </p>
        </article>
      </div>
    </section>
  );
}

function LyricsArea({ onChooseSource }: { onChooseSource: () => void }) {
  return (
    <section aria-labelledby="lyrics-heading" className="workspace-area">
      <header className="workspace-area__heading">
        <p className="workspace-eyebrow">LYRICS</p>
        <h2 id="lyrics-heading">Let the words find their place.</h2>
        <p>A calm space for lyrics, ready for a future listening session.</p>
      </header>
      <div
        aria-label="Lyrics area placeholder"
        className="workspace-lyrics"
        data-testid="lyrics-placeholder"
      >
        <span aria-hidden="true">“</span>
        <p>No track is selected yet.</p>
        <p>
          Lyrics retrieval and synchronization are planned for a later
          milestone.
        </p>
        <button
          className="workspace-button workspace-button--secondary"
          onClick={onChooseSource}
          type="button"
        >
          Return to sources
        </button>
      </div>
    </section>
  );
}

export function WorkspacePage({ onReturnToWelcome }: WorkspacePageProps) {
  const [navigation, setNavigation] = useState<WorkspaceNavigationState>({
    activeArea: 'sources',
  });
  const [guestSession, setGuestSession] = useState<GuestSession | null>(null);
  const [selection, setSelection] = useState<MusicSourceSelectionState>({
    preferredSource: null,
    localFileName: null,
  });
  const [notice, setNotice] = useState<string | null>(null);

  const enterArea = (area: WorkspaceArea) => {
    if (area !== 'sources') {
      setGuestSession({ mode: 'guest' });
    }
    setNavigation({ activeArea: area });
    setNotice(null);
  };

  const selectProvider = (sourceId: ProviderMusicSourceId) => {
    const source = sourceId === 'apple-music' ? 'Apple Music' : 'YouTube Music';
    setSelection({
      preferredSource: sourceId,
      localFileName: null,
    });
    setNotice(
      `${source} is selected as a preference, but is not connected. Provider authorization is not available yet; no access was requested.`,
    );
  };

  const selectLocalFile = (file: File) => {
    setSelection({
      preferredSource: 'local-audio',
      localFileName: file.name,
    });
    setNotice(
      'This file stays on your device. It will not be uploaded or played in this milestone.',
    );
  };

  const continueAsGuest = () => {
    setGuestSession({ mode: 'guest' });
    setNavigation({ activeArea: 'listen' });
    setNotice(null);
  };

  const openSources = () => enterArea('sources');

  return (
    <section
      aria-label="VEENA listening workspace"
      className="workspace-page"
      data-testid="workspace"
    >
      <div className="workspace-frame">
        <header className="workspace-header">
          <div aria-label="VEENA" className="workspace-brand">
            <span className="workspace-brand__name">VEENA</span>
            <span className="workspace-brand__devanagari" lang="hi">
              वीणा
            </span>
            <span className="workspace-brand__tagline">
              Beyond What You Hear.
            </span>
          </div>
          <div className="workspace-header__actions">
            {guestSession && (
              <p className="workspace-session" role="status">
                Guest session
              </p>
            )}
            <button
              className="workspace-back"
              onClick={onReturnToWelcome}
              type="button"
            >
              <span aria-hidden="true">←</span> Welcome
            </button>
          </div>
        </header>

        <WorkspaceNavigation
          activeArea={navigation.activeArea}
          onNavigate={enterArea}
        />

        <div
          aria-label="Workspace content"
          className="workspace-main"
          id="workspace-main"
          role="region"
          tabIndex={-1}
        >
          {navigation.activeArea === 'sources' && (
            <MusicSourceSelection
              selection={selection}
              notice={notice}
              onContinueAsGuest={continueAsGuest}
              onSelectLocalFile={selectLocalFile}
              onSelectProvider={selectProvider}
            />
          )}
          {navigation.activeArea === 'listen' && (
            <ListeningArea
              onChooseSource={openSources}
              onOpenLyrics={() => enterArea('lyrics')}
            />
          )}
          {navigation.activeArea === 'lyrics' && (
            <LyricsArea onChooseSource={openSources} />
          )}
        </div>
      </div>
    </section>
  );
}
