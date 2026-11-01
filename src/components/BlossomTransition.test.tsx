import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BlossomTransition } from './BlossomTransition';
import type { BlossomTransitionFrame } from '../hooks/useBlossomNavigation';

vi.mock('framer-motion', () => ({
  useReducedMotion: () => false,
}));

const canvasContext = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  stroke: vi.fn(),
  bezierCurveTo: vi.fn(),
  fill: vi.fn(),
};

function createTransitionRef(
  direction: BlossomTransitionFrame['direction'] = 'forward',
  current = 0,
  state: BlossomTransitionFrame['state'] = 'idle',
) {
  return {
    current: {
      current,
      direction,
      state,
      sourceSection: direction === 'forward' ? 'top' : 'explore',
      destinationSection: direction === 'forward' ? 'explore' : 'top',
    },
  };
}

function renderTransition(
  transitionRef: ReturnType<typeof createTransitionRef>,
  intensity = 1,
) {
  return render(
    <BlossomTransition
      transitionRef={transitionRef}
      direction={transitionRef.current.direction}
      sourceSection={transitionRef.current.sourceSection}
      destinationSection={transitionRef.current.destinationSection}
      intensity={intensity}
    />,
  );
}

describe('BlossomTransition', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      canvasContext as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    vi.spyOn(window, 'cancelAnimationFrame');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    canvasContext.translate.mockClear();
  });

  it('cleans up its animation frame and transition listeners on unmount', () => {
    const removeWindowListener = vi.spyOn(window, 'removeEventListener');
    const removeDocumentListener = vi.spyOn(document, 'removeEventListener');
    const transitionRef = createTransitionRef();
    const { unmount } = renderTransition(transitionRef);

    window.dispatchEvent(new Event('veena:blossom-transition-start'));
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    unmount();

    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(42);
    expect(removeWindowListener).toHaveBeenCalledWith(
      'veena:blossom-transition-start',
      expect.any(Function),
    );
    expect(removeWindowListener).toHaveBeenCalledWith(
      'veena:blossom-transition-end',
      expect.any(Function),
    );
    expect(removeDocumentListener).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });

  it('exposes configurable intensity and navigation endpoints', () => {
    const transitionRef = createTransitionRef('backward', 0.5, 'petal-wave');
    const { getByTestId } = renderTransition(transitionRef, 1.3);

    const canvas = getByTestId('blossom-transition');
    expect(canvas).toHaveAttribute('data-intensity', '1.3');
    expect(canvas).toHaveAttribute('data-direction', 'bottom-to-top');
  });

  it('enters from above and moves continuously downward for forward navigation', () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame += 1;
      callbacks.set(nextFrame, callback);
      return nextFrame;
    });
    const transitionRef = createTransitionRef('forward', 0.5, 'petal-wave');
    const { getByTestId } = renderTransition(transitionRef);
    const canvas = getByTestId('blossom-transition');

    window.dispatchEvent(new Event('veena:blossom-transition-start'));
    callbacks.get(1)?.(1000);
    const firstY = canvasContext.translate.mock.calls[0]?.[1];
    expect(firstY).toBeLessThan(0);
    expect(canvas).toHaveAttribute('data-entry-edge', 'top');
    expect(canvas).toHaveAttribute('data-direction', 'top-to-bottom');

    canvasContext.translate.mockClear();
    callbacks.get(2)?.(1034);
    const secondY = canvasContext.translate.mock.calls[0]?.[1];

    expect(secondY).toBeGreaterThan(firstY);
  });

  it('enters from below and moves continuously upward for backward navigation', () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let nextFrame = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      nextFrame += 1;
      callbacks.set(nextFrame, callback);
      return nextFrame;
    });
    const transitionRef = createTransitionRef('backward', 0.5, 'petal-wave');
    const { getByTestId } = renderTransition(transitionRef);
    const canvas = getByTestId('blossom-transition');

    window.dispatchEvent(new Event('veena:blossom-transition-start'));
    callbacks.get(1)?.(1000);
    const firstY = canvasContext.translate.mock.calls[0]?.[1];
    expect(firstY).toBeGreaterThan(window.innerHeight);
    expect(canvas).toHaveAttribute('data-entry-edge', 'bottom');
    expect(canvas).toHaveAttribute('data-direction', 'bottom-to-top');

    canvasContext.translate.mockClear();
    callbacks.get(2)?.(1034);
    const secondY = canvasContext.translate.mock.calls[0]?.[1];

    expect(secondY).toBeLessThan(firstY);
  });
});
