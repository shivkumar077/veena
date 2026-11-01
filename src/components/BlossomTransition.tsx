import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type {
  BlossomTransitionFrame,
  SectionNavigationDirection,
} from '../hooks/useBlossomNavigation';

interface BlossomTransitionProps {
  transitionRef: { readonly current: BlossomTransitionFrame };
  direction: SectionNavigationDirection;
  sourceSection: string;
  destinationSection: string;
  intensity?: number;
}

interface Petal {
  active: boolean;
  x: number;
  y: number;
  previousX: number;
  previousY: number;
  velocityX: number;
  velocityY: number;
  age: number;
  lifetime: number;
  depth: number;
  size: number;
  width: number;
  rotation: number;
  spin: number;
  phase: number;
  stream: number;
  wind: number;
  opacity: number;
  color: string;
}

const petalColors = ['#f5c2cf', '#f4d0d5', '#eeb1c3', '#f8dce1', '#edacc0'];
const maximumIntensity = 1.5;

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}

function getEmissionRate(progress: number) {
  const points: [number, number][] = [
    [0, 0],
    [0.035, 18],
    [0.16, 110],
    [0.42, 285],
    [0.64, 310],
    [0.82, 185],
    [0.94, 60],
    [1, 0],
  ];

  for (let index = 1; index < points.length; index += 1) {
    const [endProgress, endRate] = points[index];
    const [startProgress, startRate] = points[index - 1];

    if (progress <= endProgress) {
      const position =
        (progress - startProgress) / (endProgress - startProgress);
      return startRate + (endRate - startRate) * position;
    }
  }

  return 0;
}

function createPetal(): Petal {
  return {
    active: false,
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    velocityX: 0,
    velocityY: 0,
    age: 0,
    lifetime: 1,
    depth: 0,
    size: 0,
    width: 0,
    rotation: 0,
    spin: 0,
    phase: 0,
    stream: 0,
    wind: 0,
    opacity: 0,
    color: petalColors[0],
  };
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const position = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return position * position * (3 - 2 * position);
}

function spawnPetal(
  petal: Petal,
  width: number,
  height: number,
  direction: SectionNavigationDirection,
) {
  const depth = Math.random();
  const forward = direction === 'forward';
  const lifetime = randomBetween(1.05, 1.85);
  const speed = (height * randomBetween(1.35, 2.2)) / lifetime;
  const streamAngle = randomBetween(-0.2, 0.2);
  const stream = randomBetween(0, Math.PI * 2);
  const lane = randomBetween(-width * 0.1, width * 1.1);
  petal.active = true;
  petal.x = lane;
  petal.y = forward
    ? randomBetween(-height * 0.16, -72)
    : height + randomBetween(72, height * 0.16);
  petal.previousX = petal.x;
  petal.previousY = petal.y;
  petal.velocityX = randomBetween(-42, 42);
  petal.velocityY = (forward ? 1 : -1) * speed * Math.cos(streamAngle);
  petal.age = 0;
  petal.lifetime = lifetime;
  petal.depth = depth;
  petal.size = 2.5 + depth * depth * 15;
  petal.width = petal.size * randomBetween(0.42, 0.78);
  petal.rotation = randomBetween(-Math.PI, Math.PI);
  petal.spin = randomBetween(-4.5, 4.5) * (0.55 + depth);
  petal.phase = Math.random() * Math.PI * 2;
  petal.stream = stream;
  petal.wind = randomBetween(20, 90) * (0.35 + depth);
  petal.opacity = 0.38 + depth * 0.55;
  petal.color = petalColors[Math.floor(Math.random() * petalColors.length)];
}

function drawPetal(
  context: CanvasRenderingContext2D,
  petal: Petal,
  time: number,
  visibility: number,
) {
  const length = petal.size * 2;
  const flutter = Math.sin(time / 330 + petal.phase) * 0.16;

  context.save();
  context.translate(petal.x, petal.y);
  context.rotate(petal.rotation + flutter);
  context.globalAlpha = petal.opacity * visibility;
  context.strokeStyle = petal.color;
  context.lineWidth = Math.max(0.65, petal.size * 0.1);
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(0, length * 0.48);
  context.quadraticCurveTo(
    petal.width * 0.18,
    length * 0.08,
    petal.width * 0.32,
    -length * 0.34,
  );
  context.stroke();
  context.fillStyle = petal.color;
  context.beginPath();
  context.moveTo(0, -length * 0.55);
  context.bezierCurveTo(
    petal.width * 1.4,
    -length * 0.45,
    petal.width * 1.28,
    length * 0.2,
    0,
    length * 0.55,
  );
  context.bezierCurveTo(
    -petal.width * 1.28,
    length * 0.2,
    -petal.width * 1.4,
    -length * 0.45,
    0,
    -length * 0.55,
  );
  context.fill();
  context.restore();
}

function clampProgress(progress: number) {
  return Math.min(1, Math.max(0, progress));
}

export function BlossomTransition({
  transitionRef,
  direction,
  sourceSection,
  destinationSection,
  intensity = 1,
}: BlossomTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });

    if (!canvas || !context) {
      return;
    }

    const lowPerformance = (navigator.hardwareConcurrency || 8) <= 4;
    const isMobile = window.innerWidth < 768;
    const intensityScale = Math.min(maximumIntensity, Math.max(0, intensity));
    const frameRate = lowPerformance ? 24 : 30;
    const mobileScale = isMobile ? 0.66 : 1;
    const performanceScale = lowPerformance ? 0.58 : 1;
    const emissionScale = mobileScale * performanceScale * intensityScale;
    const poolSize = Math.ceil(
      (isMobile ? 120 : 520) * performanceScale * intensityScale,
    );
    const pool = Array.from({ length: poolSize }, createPetal);
    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrameTime = 0;
    let emissionRemainder = 0;
    let nextPetal = 0;
    let scheduleFrame: () => void = () => {};

    const resize = () => {
      const ratio = Math.min(
        window.devicePixelRatio || 1,
        lowPerformance ? 0.9 : 1.25,
      );
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const emitPetal = (direction: SectionNavigationDirection) => {
      for (let offset = 0; offset < pool.length; offset += 1) {
        const index = (nextPetal + offset) % pool.length;
        if (!pool[index].active) {
          spawnPetal(pool[index], width, height, direction);
          nextPetal = (index + 1) % pool.length;
          return;
        }
      }
    };

    const clearAtDestination = (progress: number) => {
      for (let index = 0; index < pool.length; index += 1) {
        pool[index].active = false;
      }
      context.clearRect(0, 0, width, height);
      canvas.dataset.transitionProgress = progress.toFixed(2);
      canvas.dataset.transitionPhase = 'idle';
      canvas.dataset.activePetals = '0';
      canvas.dataset.waveIntensity = '0.00';
      canvas.dataset.emissionRate = '0';
    };

    const renderFrame = (time: number) => {
      frameId = 0;

      if (document.hidden) {
        return;
      }

      if (time - lastFrameTime < 1000 / frameRate) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      const delta = lastFrameTime
        ? Math.min((time - lastFrameTime) / 1000, 0.05)
        : 1 / frameRate;
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      const frame = transitionRef.current;
      const progress = clampProgress(frame.current);
      const progressWave = Math.sin(progress * Math.PI);

      if (frame.state === 'idle' || progress >= 0.999) {
        clearAtDestination(progress);
        canvas.dataset.navigationState = frame.state;
        return;
      }

      const phase =
        progress < 0.12
          ? 'breeze'
          : progress < 0.36
            ? 'surge'
            : progress < 0.72
              ? 'wave'
              : progress < 0.96
                ? 'disperse'
                : 'reveal';
      const phaseStrength =
        progress < 0.12
          ? smoothstep(0, 0.12, progress) * 0.2
          : progress < 0.72
            ? 0.2 + smoothstep(0.12, 0.6, progress) * 0.8
            : progress < 0.96
              ? 1 - smoothstep(0.72, 0.96, progress)
              : 0;
      const reveal = 1 - smoothstep(0.72, 0.96, progress);
      const emissionRate = getEmissionRate(progress) * emissionScale * reveal;
      emissionRemainder += emissionRate * delta;

      while (emissionRemainder >= 1) {
        emitPetal(frame.direction);
        emissionRemainder -= 1;
      }

      let activePetals = 0;
      const windTime = time / 1000;

      for (let index = 0; index < pool.length; index += 1) {
        const petal = pool[index];

        if (!petal.active) {
          continue;
        }

        petal.age += delta;
        if (petal.age >= petal.lifetime) {
          petal.active = false;
          continue;
        }

        petal.previousX = petal.x;
        petal.previousY = petal.y;
        const windField =
          Math.sin(
            windTime * (0.72 + petal.depth * 0.42) +
              petal.y * 0.006 +
              petal.stream,
          ) * petal.wind;
        const crosswind =
          Math.sin(windTime * 0.46 + petal.stream * 1.7) * petal.wind * 0.32;
        petal.velocityX +=
          (windField + crosswind - petal.velocityX * 0.12) * delta;
        petal.velocityY +=
          (Math.sin(windTime * 0.58 + petal.stream + petal.x * 0.002) *
            petal.wind *
            0.1 -
            petal.velocityY * 0.025) *
          delta;
        petal.x += petal.velocityX * delta;
        petal.y += petal.velocityY * delta;
        petal.rotation += petal.spin * delta;

        const exitedVertically =
          frame.direction === 'forward'
            ? petal.y > height + petal.size * 3
            : petal.y < -petal.size * 3;
        if (
          exitedVertically ||
          petal.x < -petal.size * 4 ||
          petal.x > width + petal.size * 4
        ) {
          petal.active = false;
          continue;
        }

        const lifetimeEnvelope = Math.min(
          1,
          petal.age / 0.18,
          (petal.lifetime - petal.age) / 0.24,
        );
        const depthVisibility = 0.54 + petal.depth * 0.46;
        const visibility = lifetimeEnvelope * depthVisibility * phaseStrength;

        if (visibility <= 0.05) {
          continue;
        }

        activePetals += 1;
        const motionAngle = Math.atan2(petal.velocityY, petal.velocityX);
        const alongMotion = Math.cos(motionAngle) * petal.size * 1.5;
        const acrossMotion = Math.sin(motionAngle) * petal.size * 1.5;
        context.save();
        context.globalAlpha = visibility * petal.opacity * 0.3;
        context.strokeStyle = petal.color;
        context.lineWidth = Math.max(0.5, petal.size * 0.12);
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(petal.x - alongMotion, petal.y - acrossMotion);
        context.lineTo(petal.x, petal.y);
        context.stroke();
        context.restore();
        drawPetal(context, petal, time, visibility);
      }

      canvas.dataset.transitionProgress = progress.toFixed(2);
      canvas.dataset.transitionPhase = phase;
      canvas.dataset.navigationState = frame.state;
      canvas.dataset.activePetals = String(activePetals);
      canvas.dataset.direction =
        frame.direction === 'forward' ? 'top-to-bottom' : 'bottom-to-top';
      canvas.dataset.entryEdge =
        frame.direction === 'forward' ? 'top' : 'bottom';
      canvas.dataset.sourceSection = frame.sourceSection;
      canvas.dataset.destinationSection = frame.destinationSection;
      canvas.dataset.waveIntensity = (progressWave * phaseStrength).toFixed(2);
      canvas.dataset.emissionRate = String(Math.round(emissionRate));
      scheduleFrame();
    };

    scheduleFrame = () => {
      if (!frameId && !document.hidden) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handleResize = () => {
      resize();
      if (transitionRef.current.state !== 'idle') {
        scheduleFrame();
      }
    };

    const handleTransitionStart = () => {
      emissionRemainder = 0;
      for (let index = 0; index < pool.length; index += 1) {
        pool[index].active = false;
      }
      lastFrameTime = 0;
      scheduleFrame();
    };

    const handleTransitionEnd = () => {
      clearAtDestination(0);
      canvas.dataset.navigationState = 'idle';
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        lastFrameTime = 0;
        scheduleFrame();
      }
    };

    resize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener(
      'veena:blossom-transition-start',
      handleTransitionStart,
    );
    window.addEventListener(
      'veena:blossom-transition-end',
      handleTransitionEnd,
    );
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.dataset.intensity = String(intensityScale);
    canvas.dataset.transitionPhase = 'idle';
    canvas.dataset.navigationState = 'idle';
    canvas.dataset.transitionProgress = '0.00';
    canvas.dataset.activePetals = '0';
    canvas.dataset.waveIntensity = '0.00';
    canvas.dataset.emissionRate = '0';

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener(
        'veena:blossom-transition-start',
        handleTransitionStart,
      );
      window.removeEventListener(
        'veena:blossom-transition-end',
        handleTransitionEnd,
      );
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
    };
  }, [intensity, transitionRef, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return null;
  }

  const forward = direction === 'forward';

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="blossom-field"
      data-testid="blossom-transition"
      data-transition-phase="idle"
      data-transition-progress="0.00"
      data-active-petals="0"
      data-wave-intensity="0.00"
      data-navigation-state="idle"
      data-direction={forward ? 'top-to-bottom' : 'bottom-to-top'}
      data-entry-edge={forward ? 'top' : 'bottom'}
      data-source-section={sourceSection}
      data-destination-section={destinationSection}
      data-intensity={intensity}
      data-emission-rate="0"
    />
  );
}
