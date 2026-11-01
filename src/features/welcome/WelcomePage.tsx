import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BlossomTransition } from '../../components/BlossomTransition';
import {
  useBlossomNavigation,
  type BlossomTransitionFrame,
} from '../../hooks/useBlossomNavigation';
import { WorkspacePage } from '../workspace/WorkspacePage';
import { WelcomeBrand } from './WelcomeBrand';
import { WelcomeLandscape } from './WelcomeLandscape';

const sectionIds = ['top', 'explore'] as const;

export default function WelcomePage() {
  const [landscapeUnavailable, setLandscapeUnavailable] = useState(false);
  const openingSceneRef = useRef<HTMLElement>(null);
  const transitionRef = useRef<BlossomTransitionFrame>({
    current: 0,
    direction: 'forward',
    state: 'idle',
    sourceSection: 'top',
    destinationSection: 'explore',
  });
  const shouldReduceMotion = useReducedMotion();
  const updateSceneProgress = useCallback((progress: number) => {
    openingSceneRef.current?.style.setProperty(
      '--scene-progress',
      progress.toFixed(3),
    );
  }, []);
  const { navigation, navigate } = useBlossomNavigation({
    sectionIds,
    transitionRef,
    duration: 1100,
    reducedMotion: Boolean(shouldReduceMotion),
    onProgress: updateSceneProgress,
  });

  const navigateFromLink = (
    event: MouseEvent<HTMLAnchorElement>,
    direction: 'forward' | 'backward',
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(direction);
  };

  return (
    <>
      <a
        className="skip-link"
        href="#explore"
        onClick={(event) => navigateFromLink(event, 'forward')}
      >
        Skip to the next section
      </a>
      <main
        id="main"
        data-navigation-state={navigation.state}
        data-navigation-direction={navigation.direction}
        data-source-section={navigation.sourceSection}
        data-destination-section={navigation.destinationSection}
        data-transition-count={navigation.transitionCount}
      >
        <section
          aria-label="VEENA welcome"
          ref={openingSceneRef}
          className={
            landscapeUnavailable
              ? 'welcome-screen welcome-screen--fallback'
              : 'welcome-screen'
          }
          id="top"
        >
          <WelcomeLandscape
            className="welcome-landscape welcome-landscape--opening"
            loading="eager"
            onError={() => setLandscapeUnavailable(true)}
          />
          <div className="welcome-screen__veil" aria-hidden="true" />
          <div className="welcome-screen__light" aria-hidden="true" />
          <div className="welcome-sky-notes" aria-hidden="true">
            <span>♪</span>
            <span>♫</span>
            <span>♬</span>
            <span>♪</span>
            <span>♫</span>
          </div>
          <WelcomeBrand />
          <a
            aria-label="Scroll down to explore"
            className="welcome-scroll"
            href="#explore"
            onClick={(event) => navigateFromLink(event, 'forward')}
          >
            <span>SCROLL DOWN TO EXPLORE</span>
            <span className="welcome-scroll__arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </section>

        <section
          aria-label="Continue exploring VEENA"
          className={
            landscapeUnavailable
              ? 'welcome-transition welcome-transition--fallback'
              : 'welcome-transition'
          }
          id="explore"
          tabIndex={-1}
        >
          <WelcomeLandscape
            className="welcome-landscape welcome-landscape--continuation"
            onError={() => setLandscapeUnavailable(true)}
          />
          <div className="welcome-transition__veil" aria-hidden="true" />
          <WorkspacePage onReturnToWelcome={() => navigate('backward')} />
        </section>
        <BlossomTransition
          transitionRef={transitionRef}
          direction={navigation.direction}
          sourceSection={navigation.sourceSection}
          destinationSection={navigation.destinationSection}
          intensity={1}
        />
      </main>
    </>
  );
}
