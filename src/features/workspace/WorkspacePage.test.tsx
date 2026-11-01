import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkspacePage } from './WorkspacePage';

function renderWorkspace() {
  return render(<WorkspacePage onReturnToWelcome={vi.fn()} />);
}

describe('WorkspacePage', () => {
  it('offers honest provider states and local audio without account fields', () => {
    renderWorkspace();

    expect(
      screen.getByRole('heading', { name: 'Choose how you listen' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('source-card-apple-music')).toHaveTextContent(
      'Not connected',
    );
    expect(screen.getByTestId('source-card-youtube-music')).toHaveTextContent(
      'Not connected',
    );
    expect(
      screen.getByRole('button', { name: 'Choose an audio file' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue as guest' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/email|password|your name|profile/i),
    ).not.toBeInTheDocument();
  });

  it('keeps provider choices disconnected and confirms no authorization was requested', () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Select Apple Music' }));

    expect(
      screen.getByRole('button', { name: 'Selected: Apple Music' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('source-card-apple-music')).toHaveTextContent(
      'Not connected',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'no access was requested',
    );
  });

  it('enters the listening workspace as a guest without requiring a source', () => {
    const { container } = renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Continue as guest' }));

    expect(
      screen.getByRole('heading', { name: 'A place for the next song.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Guest session');
    expect(screen.getByTestId('current-listening')).toHaveTextContent(
      'No track selected',
    );
    expect(container.querySelector('audio')).toBeNull();
  });

  it('lets visitors navigate among sources, listening, and lyrics', () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole('button', { name: 'Listening' }));

    expect(screen.getByRole('button', { name: 'Listening' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Guest session');

    fireEvent.click(screen.getByRole('button', { name: 'Lyrics' }));
    expect(
      screen.getByRole('heading', {
        name: 'Let the words find their place.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('lyrics-placeholder')).toHaveTextContent(
      'Lyrics retrieval and synchronization are planned',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sources' }));
    expect(
      screen.getByRole('heading', { name: 'Choose how you listen' }),
    ).toBeInTheDocument();
  });

  it('keeps selected local audio on-device and does not start playback', () => {
    const { container } = renderWorkspace();
    const file = new File(['audio fixture'], 'quiet-morning.mp3', {
      type: 'audio/mpeg',
    });

    fireEvent.change(screen.getByLabelText('Choose a local audio file'), {
      target: { files: [file] },
    });

    expect(
      within(screen.getByTestId('source-card-local-audio')).getByRole('status'),
    ).toHaveTextContent('will not be uploaded or played in this milestone');
    expect(screen.getByTestId('source-card-local-audio')).toHaveTextContent(
      'quiet-morning.mp3',
    );
    expect(container.querySelector('audio')).toBeNull();
  });

  it('clears the local file selection when a provider becomes the preference', () => {
    renderWorkspace();
    const file = new File(['audio fixture'], 'quiet-morning.mp3', {
      type: 'audio/mpeg',
    });

    fireEvent.change(screen.getByLabelText('Choose a local audio file'), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Select Apple Music' }));

    expect(screen.getByTestId('source-card-local-audio')).not.toHaveTextContent(
      'quiet-morning.mp3',
    );
    expect(
      screen.getByRole('button', { name: 'Choose an audio file' }),
    ).toBeInTheDocument();
  });

  it('returns to the welcome experience through the supplied navigation action', () => {
    const onReturnToWelcome = vi.fn();
    render(<WorkspacePage onReturnToWelcome={onReturnToWelcome} />);

    fireEvent.click(screen.getByRole('button', { name: 'Welcome' }));

    expect(onReturnToWelcome).toHaveBeenCalledOnce();
  });
});
