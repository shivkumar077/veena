import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import WelcomePage from './WelcomePage';

vi.mock('../visualization/AtmosphericScene', () => ({
  default: () => null,
}));

describe('WelcomePage', () => {
  it('introduces VEENA and its visual music vision', () => {
    render(<WelcomePage />);

    expect(
      screen.getByRole('heading', {
        name: /music deserves a world of its own/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Beyond What You Hear.', { exact: true }),
    ).toBeInTheDocument();
  });

  it('provides a skip link and in-page experience navigation', () => {
    render(<WelcomePage />);

    expect(
      screen.getByRole('link', { name: /skip to content/i }),
    ).toHaveAttribute('href', '#main');
    expect(
      screen.getAllByRole('link', { name: /discover the experience/i }),
    ).toHaveLength(1);
    expect(
      screen.getByRole('heading', { name: /a place to listen/i }),
    ).toBeVisible();
  });
});
