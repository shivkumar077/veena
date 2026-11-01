import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Petal {
  x: number;
  y: number;
  size: number;
  depth: number;
  phase: number;
  sway: number;
  fallSpeed: number;
  spin: number;
  rotation: number;
  opacity: number;
  color: string;
}

const petalColors = ['#f5c2cf', '#f4d0d5', '#eeb1c3', '#f8dce1'];

function createPetal(width: number, height: number): Petal {
  const depth = Math.random();

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 4.5 + depth * 4.5,
    depth,
    phase: Math.random() * Math.PI * 2,
    sway: 10 + depth * 25,
    fallSpeed: 12 + depth * 23,
    spin: (Math.random() - 0.5) * 1.4,
    rotation: Math.random() * Math.PI * 2,
    opacity: 0.34 + depth * 0.48,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
  };
}

function drawPetal(
  context: CanvasRenderingContext2D,
  petal: Petal,
  time: number,
) {
  const length = petal.size * 2;

  context.save();
  context.translate(petal.x, petal.y);
  context.rotate(petal.rotation + Math.sin(time / 1200 + petal.phase) * 0.12);
  context.globalAlpha = petal.opacity;
  context.fillStyle = petal.color;
  context.beginPath();
  context.moveTo(0, -length * 0.55);
  context.bezierCurveTo(
    petal.size,
    -length * 0.25,
    petal.size * 0.7,
    length * 0.4,
    0,
    length * 0.55,
  );
  context.bezierCurveTo(
    -petal.size * 0.7,
    length * 0.35,
    -petal.size,
    -length * 0.26,
    0,
    -length * 0.55,
  );
  context.fill();
  context.restore();
}

export function BlossomField() {
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

    let width = 0;
    let height = 0;
    let frameId = 0;
    let lastFrameTime = 0;
    const pixelsPerFrame = () => Math.min(window.devicePixelRatio || 1, 1.25);
    const resize = () => {
      const ratio = pixelsPerFrame();
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();

    const petalCount = width < 768 ? 12 : 26;
    const petals = Array.from({ length: petalCount }, () =>
      createPetal(width, height),
    );

    const renderFrame = (time: number) => {
      frameId = 0;

      if (document.hidden) {
        return;
      }

      if (time - lastFrameTime < 1000 / 30) {
        frameId = window.requestAnimationFrame(renderFrame);
        return;
      }

      const delta = Math.min((time - lastFrameTime) / 1000, 0.05);
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      for (const petal of petals) {
        petal.y += petal.fallSpeed * delta;
        petal.x +=
          (Math.sin(time / 1600 + petal.phase) * petal.sway + petal.depth * 5) *
          delta;
        petal.rotation += petal.spin * delta;

        if (petal.y > height + 24) {
          petal.y = -24;
          petal.x = Math.random() * width;
        } else if (petal.x > width + 24) {
          petal.x = -24;
        }

        drawPetal(context, petal, time);
      }

      frameId = window.requestAnimationFrame(renderFrame);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else if (!frameId) {
        lastFrameTime = performance.now();
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    frameId = window.requestAnimationFrame(renderFrame);

    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.cancelAnimationFrame(frameId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="blossom-field"
      data-testid="blossom-field"
    />
  );
}
