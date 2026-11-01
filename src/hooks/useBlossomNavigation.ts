import { useCallback, useEffect, useRef, useState } from 'react';

export type SectionNavigationDirection = 'forward' | 'backward';
export type NavigationState =
  | 'idle'
  | 'preparing'
  | 'petal-wave'
  | 'section-movement'
  | 'reveal'
  | 'completed';

export interface BlossomTransitionFrame {
  current: number;
  direction: SectionNavigationDirection;
  state: NavigationState;
  sourceSection: string;
  destinationSection: string;
}

interface NavigationSnapshot {
  state: NavigationState;
  direction: SectionNavigationDirection;
  sourceSection: string;
  destinationSection: string;
  transitionCount: number;
}

interface UseBlossomNavigationOptions {
  sectionIds: readonly string[];
  transitionRef: { current: BlossomTransitionFrame };
  duration?: number;
  reducedMotion: boolean;
  onProgress?: (progress: number) => void;
}

const wheelThreshold = 4;
const wheelGestureWindow = 140;
const wheelMomentumCooldown = 170;
const touchThreshold = 24;
const transitionEvent = 'veena:blossom-transition-start';

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        'input, textarea, select, [contenteditable="true"], [role="textbox"]',
      ),
    )
  );
}

function canScrollWithinTarget(target: EventTarget | null, deltaY: number) {
  if (!(target instanceof Element)) {
    return false;
  }

  let element: Element | null = target;

  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const isScrollable = /auto|scroll|overlay/.test(style.overflowY);

    if (isScrollable && element.scrollHeight > element.clientHeight + 1) {
      const scrollable = element as HTMLElement;
      const canScrollDown =
        scrollable.scrollTop + scrollable.clientHeight <
        scrollable.scrollHeight - 1;
      const canScrollUp = scrollable.scrollTop > 1;

      if (deltaY > 0 ? canScrollDown : canScrollUp) {
        return true;
      }
    }

    element = element.parentElement;
  }

  return false;
}

function easeInOut(value: number) {
  return value * value * (3 - 2 * value);
}

export function useBlossomNavigation({
  sectionIds,
  transitionRef,
  duration = 1100,
  reducedMotion,
  onProgress,
}: UseBlossomNavigationOptions) {
  const firstSection = sectionIds[0] ?? '';
  const [navigation, setNavigation] = useState<NavigationSnapshot>({
    state: 'idle',
    direction: 'forward',
    sourceSection: firstSection,
    destinationSection: sectionIds[1] ?? firstSection,
    transitionCount: 0,
  });
  const navigationRef = useRef(navigation);
  const reducedMotionRef = useRef(reducedMotion);
  const frameIdRef = useRef(0);
  const completionTimerRef = useRef(0);
  const wheelCooldownUntilRef = useRef(0);
  const wheelCooldownDirectionRef = useRef(0);
  const finishRef = useRef<(() => void) | null>(null);
  const resumeAnimationRef = useRef<(() => void) | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const wheelGestureRef = useRef({ delta: 0, direction: 0, timer: 0 });

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  const publishNavigation = useCallback(
    (snapshot: NavigationSnapshot) => {
      navigationRef.current = snapshot;
      transitionRef.current.state = snapshot.state;
      transitionRef.current.direction = snapshot.direction;
      transitionRef.current.sourceSection = snapshot.sourceSection;
      transitionRef.current.destinationSection = snapshot.destinationSection;
      setNavigation(snapshot);
    },
    [transitionRef],
  );

  const finishRefocus = useCallback(() => {
    const frame = transitionRef.current;
    const target = document.getElementById(frame.destinationSection);

    if (target) {
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: targetY, behavior: 'instant' });
      target.focus({ preventScroll: true });

      const destinationHash =
        frame.destinationSection === firstSection
          ? `${window.location.pathname}${window.location.search}`
          : `#${frame.destinationSection}`;
      window.history.replaceState(null, '', destinationHash);
    }

    onProgress?.(frame.direction === 'forward' ? 1 : 0);
    wheelCooldownUntilRef.current = performance.now() + wheelMomentumCooldown;
    wheelCooldownDirectionRef.current = frame.direction === 'forward' ? 1 : -1;
    frame.current = 1;
    publishNavigation({
      ...navigationRef.current,
      state: 'completed',
    });

    window.clearTimeout(completionTimerRef.current);
    completionTimerRef.current = window.setTimeout(() => {
      frame.current = 0;
      publishNavigation({
        ...navigationRef.current,
        state: 'idle',
      });
      window.dispatchEvent(new Event('veena:blossom-transition-end'));
    }, 90);
    frameIdRef.current = 0;
  }, [firstSection, onProgress, publishNavigation, transitionRef]);

  const navigate = useCallback(
    (direction: SectionNavigationDirection) => {
      if (navigationRef.current.state !== 'idle') {
        return false;
      }

      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => section !== null);
      if (sections.length < 2) {
        return false;
      }

      const sourceIndex = sections.reduce((closestIndex, section, index) => {
        const closest = sections[closestIndex];
        const distance = Math.abs(section.getBoundingClientRect().top);
        const closestDistance = Math.abs(closest.getBoundingClientRect().top);
        return distance < closestDistance ? index : closestIndex;
      }, 0);
      const destinationIndex = sourceIndex + (direction === 'forward' ? 1 : -1);
      const source = sections[sourceIndex];
      const destination = sections[destinationIndex];

      if (!source || !destination) {
        return false;
      }

      const sourceY = source.getBoundingClientRect().top + window.scrollY;
      const destinationY =
        destination.getBoundingClientRect().top + window.scrollY;
      const transitionFrame = transitionRef.current;
      transitionFrame.current = 0;
      transitionFrame.direction = direction;
      transitionFrame.sourceSection = source.id;
      transitionFrame.destinationSection = destination.id;

      const nextSnapshot: NavigationSnapshot = {
        state: 'preparing',
        direction,
        sourceSection: source.id,
        destinationSection: destination.id,
        transitionCount: navigationRef.current.transitionCount + 1,
      };

      if (reducedMotionRef.current) {
        publishNavigation({ ...nextSnapshot, state: 'completed' });
        window.scrollTo({ top: destinationY, behavior: 'instant' });
        onProgress?.(direction === 'forward' ? 1 : 0);
        destination.focus({ preventScroll: true });
        const destinationHash =
          destination.id === firstSection
            ? `${window.location.pathname}${window.location.search}`
            : `#${destination.id}`;
        window.history.replaceState(null, '', destinationHash);
        transitionFrame.current = 0;
        publishNavigation({ ...nextSnapshot, state: 'idle' });
        return true;
      }

      publishNavigation(nextSnapshot);
      window.dispatchEvent(new Event(transitionEvent));

      let elapsed = 0;
      let previousTime = 0;
      let completed = false;

      const finish = () => {
        if (completed) {
          return;
        }
        completed = true;
        finishRefocus();
      };

      finishRef.current = finish;

      const animate = (time: number) => {
        frameIdRef.current = 0;
        if (document.hidden || completed) {
          return;
        }

        if (previousTime) {
          elapsed += Math.min(time - previousTime, 50);
        }
        previousTime = time;
        const progress = Math.min(1, elapsed / Math.max(1, duration));
        transitionFrame.current = progress;
        onProgress?.(direction === 'forward' ? progress : 1 - progress);

        const nextState: NavigationState =
          progress < 0.12
            ? 'preparing'
            : progress < 0.36
              ? 'petal-wave'
              : progress < 0.72
                ? 'section-movement'
                : progress < 0.96
                  ? 'reveal'
                  : 'completed';

        if (navigationRef.current.state !== nextState) {
          publishNavigation({
            ...navigationRef.current,
            state: nextState,
          });
        }

        const movementProgress = Math.min(
          1,
          Math.max(0, (progress - 0.28) / 0.44),
        );
        const scrollPosition =
          sourceY + (destinationY - sourceY) * easeInOut(movementProgress);
        window.scrollTo({ top: scrollPosition, behavior: 'instant' });

        if (progress >= 1) {
          finish();
          return;
        }

        frameIdRef.current = window.requestAnimationFrame(animate);
      };

      resumeAnimationRef.current = () => {
        if (!frameIdRef.current && !document.hidden && !completed) {
          frameIdRef.current = window.requestAnimationFrame(animate);
        }
      };
      frameIdRef.current = window.requestAnimationFrame(animate);
      return true;
    },
    [
      duration,
      firstSection,
      finishRefocus,
      onProgress,
      publishNavigation,
      sectionIds,
      transitionRef,
    ],
  );

  useEffect(() => {
    const wheelGesture = wheelGestureRef.current;

    const findNavigationDirection = (direction: number) => {
      if (navigationRef.current.state !== 'idle') {
        return direction > 0 ? 'forward' : 'backward';
      }

      const nearestIndex = sectionIds.reduce((closestIndex, id, index) => {
        const section = document.getElementById(id);
        const closest = document.getElementById(sectionIds[closestIndex]);

        if (!section || !closest) {
          return closestIndex;
        }

        const distance = Math.abs(section.getBoundingClientRect().top);
        const closestDistance = Math.abs(closest.getBoundingClientRect().top);
        return distance < closestDistance ? index : closestIndex;
      }, 0);
      const nextIndex = nearestIndex + (direction > 0 ? 1 : -1);
      return nextIndex >= 0 && nextIndex < sectionIds.length
        ? direction > 0
          ? 'forward'
          : 'backward'
        : null;
    };

    const resetWheelGesture = () => {
      window.clearTimeout(wheelGesture.timer);
      wheelGesture.delta = 0;
      wheelGesture.direction = 0;
      wheelGesture.timer = 0;
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        return;
      }

      if (navigationRef.current.state !== 'idle') {
        wheelCooldownDirectionRef.current =
          navigationRef.current.direction === 'forward' ? 1 : -1;
        wheelCooldownUntilRef.current =
          performance.now() + wheelMomentumCooldown;
        event.preventDefault();
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const deltaScale =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1;
      const delta = event.deltaY * deltaScale;

      if (
        Math.abs(delta) < 0.1 ||
        canScrollWithinTarget(event.target, delta) ||
        !findNavigationDirection(delta)
      ) {
        return;
      }

      event.preventDefault();
      const direction = Math.sign(delta);
      if (
        performance.now() < wheelCooldownUntilRef.current &&
        direction === wheelCooldownDirectionRef.current
      ) {
        return;
      }
      wheelCooldownUntilRef.current = 0;

      const gesture = wheelGesture;

      if (gesture.direction !== direction) {
        gesture.delta = 0;
        gesture.direction = direction;
      }

      gesture.delta += delta;
      window.clearTimeout(gesture.timer);
      gesture.timer = window.setTimeout(resetWheelGesture, wheelGestureWindow);

      if (Math.abs(gesture.delta) >= wheelThreshold) {
        const navigationDirection =
          gesture.direction > 0 ? 'forward' : 'backward';
        resetWheelGesture();
        navigate(navigationDirection);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1 || isEditableTarget(event.target)) {
        touchStartRef.current = null;
        return;
      }

      const touch = event.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const start = touchStartRef.current;

      if (navigationRef.current.state !== 'idle') {
        event.preventDefault();
        return;
      }

      if (!start || event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      const deltaY = start.y - touch.clientY;
      const deltaX = start.x - touch.clientX;

      if (canScrollWithinTarget(event.target, deltaY)) {
        touchStartRef.current = null;
        return;
      }

      if (
        Math.abs(deltaY) >= 8 &&
        Math.abs(deltaY) > Math.abs(deltaX) &&
        findNavigationDirection(deltaY)
      ) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;

      if (!start || event.changedTouches.length !== 1) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaY = start.y - touch.clientY;
      const deltaX = start.x - touch.clientX;

      if (
        Math.abs(deltaY) < touchThreshold ||
        Math.abs(deltaY) <= Math.abs(deltaX) ||
        !findNavigationDirection(deltaY)
      ) {
        return;
      }

      navigate(deltaY > 0 ? 'forward' : 'backward');
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        isEditableTarget(event.target) ||
        event.repeat
      ) {
        return;
      }

      const activeElement =
        event.target instanceof Element ? event.target : null;
      const direction =
        event.key === 'ArrowDown' ||
        event.key === 'PageDown' ||
        event.key === ' '
          ? 'forward'
          : event.key === 'ArrowUp' || event.key === 'PageUp'
            ? 'backward'
            : null;

      if (
        event.key === ' ' &&
        activeElement?.closest('a, button, [role="button"]')
      ) {
        return;
      }

      if (navigationRef.current.state !== 'idle') {
        if (direction) {
          event.preventDefault();
        }
        return;
      }

      if (
        direction &&
        canScrollWithinTarget(event.target, direction === 'forward' ? 1 : -1)
      ) {
        return;
      }

      if (
        direction &&
        findNavigationDirection(direction === 'forward' ? 1 : -1)
      ) {
        event.preventDefault();
        navigate(direction);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = 0;
      } else if (navigationRef.current.state !== 'idle') {
        resumeAnimationRef.current?.();
      }
    };

    window.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false,
    });
    window.addEventListener('touchstart', handleTouchStart, {
      capture: true,
      passive: true,
    });
    window.addEventListener('touchmove', handleTouchMove, {
      capture: true,
      passive: false,
    });
    window.addEventListener('touchend', handleTouchEnd, {
      capture: true,
      passive: true,
    });
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('wheel', handleWheel, true);
      window.removeEventListener('touchstart', handleTouchStart, true);
      window.removeEventListener('touchmove', handleTouchMove, true);
      window.removeEventListener('touchend', handleTouchEnd, true);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearTimeout(wheelGesture.timer);
      window.clearTimeout(completionTimerRef.current);
      window.cancelAnimationFrame(frameIdRef.current);
    };
  }, [navigate, sectionIds]);

  useEffect(() => {
    if (reducedMotion && navigationRef.current.state !== 'idle') {
      finishRef.current?.();
    }
  }, [reducedMotion]);

  return { navigation, navigate };
}
