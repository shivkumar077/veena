import { lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BrandMark } from '../../components/BrandMark';

const AtmosphericScene = lazy(
  () => import('../visualization/AtmosphericScene'),
);

const experiences = [
  {
    number: '01',
    title: 'A world for every song',
    description:
      'Color, space, and motion become part of the way a track makes you feel.',
  },
  {
    number: '02',
    title: 'Words, in their own time',
    description:
      'Lyrics find their place in the composition instead of competing with it.',
  },
  {
    number: '03',
    title: 'Sound made visible',
    description:
      'An expressive visual language gives listening a different kind of presence.',
  },
];

export default function WelcomePage() {
  const shouldReduceMotion = useReducedMotion();
  const entrance = shouldReduceMotion
    ? undefined
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header" id="top">
        <BrandMark />
        <span className="site-header__tagline">Beyond What You Hear.</span>
        <a className="site-header__link" href="#experience">
          The experience
          <span aria-hidden="true">↗</span>
        </a>
      </header>

      <main className="min-h-screen" id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__scene" aria-hidden="true">
            <Suspense fallback={<div className="hero__scene-fallback" />}>
              <AtmosphericScene />
            </Suspense>
          </div>
          <div className="hero__grain" aria-hidden="true" />
          <motion.div className="hero__content" {...entrance}>
            <p className="eyebrow">A new dimension of listening</p>
            <h1 id="hero-title">
              Music deserves
              <br />
              <span>a world of its own.</span>
            </h1>
            <p className="hero__description">
              A song is more than something you hear. VEENA brings its feeling
              into focus through living environments, expressive visuals, and
              lyrics in sync.
            </p>
            <a className="text-link hero__link" href="#experience">
              Discover the experience
              <span aria-hidden="true">↗</span>
            </a>
          </motion.div>
          <div className="hero__caption" aria-hidden="true">
            <span>LISTEN</span>
            <span className="hero__caption-line" />
            <span>FEEL</span>
            <span className="hero__caption-line" />
            <span>SEE</span>
          </div>
          <a className="hero__scroll" href="#experience">
            <span>Scroll to explore</span>
            <span className="hero__scroll-line" aria-hidden="true" />
          </a>
        </section>

        <section
          className="experience section-shell"
          id="experience"
          aria-labelledby="experience-title"
        >
          <div className="experience__intro">
            <p className="eyebrow">The VEENA point of view</p>
            <h2 id="experience-title">
              Not a player.
              <br />
              <span>A place to listen.</span>
            </h2>
          </div>
          <div className="experience__list">
            {experiences.map((experience) => (
              <article className="experience-card" key={experience.number}>
                <span className="experience-card__number">
                  {experience.number}
                </span>
                <div>
                  <h3>{experience.title}</h3>
                  <p>{experience.description}</p>
                </div>
                <span className="experience-card__mark" aria-hidden="true">
                  +
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <BrandMark />
        <p>Every song, a world of its own.</p>
        <span>VEENA — Beyond What You Hear.</span>
      </footer>
    </>
  );
}
