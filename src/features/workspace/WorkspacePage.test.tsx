import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { MusicSourceSelectionState } from '../../types/workspace';
import { clearMusicSourceSelection, selectMusicSource } from './musicSources';
import { WorkspacePage } from './WorkspacePage';

describe('WorkspacePage', () => {
  it('marks the source-selection screen for its forward entrance only when requested', () => {
    const { rerender } = render(<WorkspacePage isEntering={false} />);
    const workspace = screen.getByTestId('workspace');

    expect(workspace).not.toHaveClass('workspace-page--entering');

    rerender(<WorkspacePage isEntering />);

    expect(workspace).toHaveClass('workspace-page--entering');
    expect(workspace).toHaveAttribute('data-transition-entering', 'true');
  });

  it('shows only three accessible source choices without dashboard navigation', () => {
    render(<WorkspacePage isEntering={false} />);

    expect(
      screen.getByRole('heading', { name: 'Choose your source' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId(/^source-choice-/)).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: 'Apple Music' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'YouTube Music' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Local Audio' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Listening' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Lyrics' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /welcome/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /continue as guest/i }),
    ).not.toBeInTheDocument();
  });

  it('selects one provider without representing it as connected', () => {
    render(<WorkspacePage isEntering={false} />);

    fireEvent.click(screen.getByTestId('source-choice-apple-music'));

    expect(screen.getByTestId('source-choice-apple-music')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('source-choice-youtube-music')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Apple Music selected · Not connected.',
    );
    expect(
      screen.getByRole('button', { name: 'Clear selection' }),
    ).toBeInTheDocument();
  });

  it('requires clearing a selection before choosing a different source', () => {
    render(<WorkspacePage isEntering={false} />);

    fireEvent.click(screen.getByTestId('source-choice-apple-music'));
    fireEvent.click(screen.getByTestId('source-choice-youtube-music'));

    expect(screen.getByTestId('source-choice-apple-music')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByTestId('source-choice-youtube-music')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      screen.getByText(
        'Clear your Apple Music selection before switching sources.',
      ),
    ).toHaveAttribute('role', 'status');

    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    fireEvent.click(screen.getByTestId('source-choice-youtube-music'));

    expect(screen.getByTestId('source-choice-apple-music')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByTestId('source-choice-youtube-music')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('requires disconnecting a connected provider before changing sources', () => {
    const connectedSelection: MusicSourceSelectionState = {
      selectedSource: 'apple-music',
      connectedProviderId: 'apple-music',
      localFileName: null,
    };

    expect(
      selectMusicSource(connectedSelection, 'youtube-music').blockedBy,
    ).toEqual({ kind: 'disconnect-provider', sourceId: 'apple-music' });
    expect(clearMusicSourceSelection(connectedSelection)).toEqual({
      state: null,
      blockedBy: { kind: 'disconnect-provider', sourceId: 'apple-music' },
    });
  });

  it('treats a local file as a local source and never starts playback', () => {
    const { container } = render(<WorkspacePage isEntering={false} />);
    const file = new File(['audio fixture'], 'quiet-morning.mp3', {
      type: 'audio/mpeg',
    });

    fireEvent.change(screen.getByTestId('local-audio-input'), {
      target: { files: [file] },
    });

    expect(screen.getByTestId('source-choice-local-audio')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'quiet-morning.mp3 stays on this device.',
    );
    expect(container.querySelector('audio')).toBeNull();
    expect(container.querySelector('input[type="email"]')).toBeNull();
  });

  it('returns to the source-selection home when the VEENA wordmark is activated', () => {
    render(<WorkspacePage isEntering={false} />);
    fireEvent.click(screen.getByTestId('source-choice-apple-music'));

    fireEvent.click(
      screen.getByRole('button', { name: 'VEENA source selection home' }),
    );

    expect(screen.getByTestId('source-choice-apple-music')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(
      screen.getByRole('heading', { name: 'Choose your source' }),
    ).toHaveFocus();
  });
});
