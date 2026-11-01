import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WelcomePage from './WelcomePage';

vi.mock('./BlossomField', () => ({
  BlossomField: () => <canvas data-testid="blossom-field" />,
}));

describe('WelcomePage', () => {
  it('places the English and Hindi VEENA identity at the center of the welcome', () => {
    render(<WelcomePage />);

    expect(screen.getByRole('heading', { name: 'VEENA' })).toBeInTheDocument();
    expect(screen.getByText('वीणा', { exact: true })).toHaveAttribute(
      'lang',
      'hi',
    );
    expect(
      screen.getByText('Beyond What You Hear.', { exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        /discover the experience|a new dimension of listening/i,
      ),
    ).not.toBeInTheDocument();
  });

  it('provides a keyboard-accessible scroll transition without a promotional button', () => {
    render(<WelcomePage />);

    expect(
      screen.getByRole('link', { name: 'Scroll down to explore' }),
    ).toHaveAttribute('href', '#explore');
    expect(
      screen.getByRole('region', { name: 'Continue exploring VEENA' }),
    ).toHaveAttribute('id', 'explore');
    expect(
      screen.queryByRole('button', { name: /enter|discover/i }),
    ).not.toBeInTheDocument();
  });

  it('falls back to the atmospheric color treatment if the landscape cannot load', () => {
    const { container } = render(<WelcomePage />);
    const image = container.querySelector('img');

    if (!image) {
      throw new Error('The welcome landscape image was not rendered.');
    }

    fireEvent.error(image);

    expect(screen.getByRole('region', { name: 'VEENA welcome' })).toHaveClass(
      'welcome-screen--fallback',
    );
  });
});
