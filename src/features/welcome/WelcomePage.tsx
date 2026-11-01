import { useState } from 'react';
import { BlossomField } from './BlossomField';
import { WelcomeBrand } from './WelcomeBrand';
import { WelcomeLandscape } from './WelcomeLandscape';

export default function WelcomePage() {
  const [landscapeUnavailable, setLandscapeUnavailable] = useState(false);

  return (
    <>
      <a className="skip-link" href="#explore">
        Skip to the next section
      </a>
      <main id="main">
        <section
          aria-label="VEENA welcome"
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
          <BlossomField />
          <WelcomeBrand />
          <a
            aria-label="Scroll down to explore"
            className="welcome-scroll"
            href="#explore"
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
        </section>
      </main>
    </>
  );
}
