# VEENA

**Beyond What You Hear.**

VEENA is a premium, immersive visual music experience. Its ambition is to give every song a world of its own: adaptive environments, expressive typography, animated compositions, and lyrics that move with the music. It is being built as an artistic listening space, not a conventional music-player dashboard.

> **Milestones 1–3 — Foundation, cinematic welcome, and listening workspace.** VEENA is guest-first and does not require an account. Provider authorization, playback, lyrics services, and adaptive visual engines are planned—not implemented.

## Vision

Listening should feel like entering a place. VEENA explores how color, light, motion, language, and sound can work together to make a song feel personal and present. The interface starts dark and editorial, with midnight `#111722`, muted gold `#D6BD91`, ivory `#EDE8DE`, and deep teal `#344C50`.

## Planned experience

- **Adaptive environments** that give each track a distinct visual atmosphere.
- **Expressive visual compositions** shaped by musical energy and mood.
- **Synchronized lyrics** with clear, readable timing and typography.
- **Playback across music providers**, behind provider-neutral contracts.
- **A considered mobile experience**, from compact phones to large displays.
- **Guest-first access** with no VEENA registration or profile collection.

These are product goals, not claims of currently available playback features.

## Architecture

The application separates the presentation layer, feature areas, domain contracts, and replaceable engine/provider boundaries:

```text
src/
  app/                 Application entry, error boundary, loading states
  components/          Shared interface components
  features/
    welcome/           Landscape, centered brand, petals, and scroll transition
    workspace/         Guest-first source selection and listening/lyrics areas
    visualization/     Future track-responsive visual experience
    playback/          Future playback experience
    lyrics/            Future synchronized-lyrics experience
    environments/      Future environment experience
  engines/
    playback/          Playback engine contract
    lyrics/            Lyrics engine contract
    visual-composition/ Visual composition engine contract
    environment/       Environment engine contract
  providers/           Future external-service adapters
  hooks/               Shared React hooks
  lib/                 Framework-independent helpers
  styles/              Design tokens and global styles
  types/               Provider-neutral domain contracts
  config/              Public runtime configuration
```

Engine interfaces describe what the application needs; provider interfaces describe what an external music source may offer. Implementations can be added later without coupling the UI to Supabase, LRCLIB, or a specific music provider.

The opening scene is an original, locally hosted vector illustration with separate art direction for portrait and landscape screens. Animated musical notes, ambient lighting, and drifting blossoms bring the scene to life; direction-aware navigation carries visitors into the listening workspace. The workspace offers Apple Music, YouTube Music, and local audio as source choices, plus a guest path. Provider choices are not connected, local files are not uploaded or played, and no VEENA account or provider authorization is requested. Listening and lyrics areas are structural placeholders. Reduced-motion users get immediate section navigation and no animated petals. Shared design tokens define palette, type, spacing, motion, and layout; Tailwind breakpoints cover 320, 375, 430, 768, 1024, 1440, and 1920 pixels. Native semantic HTML, visible keyboard focus, a skip link, image fallback behavior, reduced-motion handling, and an application error boundary are part of the baseline. Three.js and React Three Fiber remain installed for the planned visual-composition experience; they are not used by the welcome page.

VEENA does not use VEENA identity accounts. A future music provider may separately request its own authorization to enable provider-specific features; that authorization is not VEENA registration.

## Technology

- React, TypeScript, and Vite
- Tailwind CSS 3 with PostCSS
- Three.js and React Three Fiber
- Framer Motion
- Vitest, React Testing Library, and Playwright
- ESLint and Prettier

## Local development

**Prerequisites:** Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

Playwright smoke tests are available with `npm run test:e2e`. Install its browser once with `npx playwright install chromium` if it is not already present.

## Configuration and integrations

Copy `.env.example` to `.env.local` when local public configuration is needed. Vite exposes `VITE_*` variables to browser code: use them only for public values. Never put service-role keys, provider secrets, or other credentials in frontend environment variables. No external service credentials are required to run the foundation.

## Roadmap

1. **Foundation and architecture** — complete: frontend scaffold, design tokens, domain and engine contracts, and quality tooling.
2. **Cinematic welcome and branding** — complete: responsive local landscape, centered bilingual brand, petal motion, reduced-motion behavior, and scroll transition.
3. **Responsive listening workspace** — complete: guest-first shell, honest source-selection states, local-file entry point, and listening/lyrics placeholders. Actual playback and provider authorization are not implemented.
4. **Lyrics and synchronization** — lyrics retrieval, timed-line contracts in use, and accessible lyric presentation.
5. **Visual composition** — audio-informed compositions and track-responsive environments.
6. **Privacy-conscious preferences** — optional local preferences only where useful; no VEENA account or profile.
7. **Hardening and release** — device/browser validation, performance, and production operations.

Roadmap stages are plans; completion should be reported only after implementation and verification.
