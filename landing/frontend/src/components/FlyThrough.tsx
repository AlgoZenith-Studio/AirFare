import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Scroll-scrubbed transition between the hero and the next section.
 *
 * The section is taller than the screen; its inner "stage" sticks to the viewport
 * while you scroll through it. Scroll progress (0 -> 1) drives the scene:
 *   - scrolling down: the plane climbs up and past you, the sky shifts from the
 *     hero's ink to the next section's sky blue
 *   - scrolling up:   the exact reverse, frame for frame
 *
 * VIDEO MODE: drop a file at public/TRANSITION_VIDEO.mp4 and it is scrubbed
 * frame-by-frame by scroll (currentTime = progress x duration).
 * CSS MODE (fallback, no file): a built-in plane/clouds/sky scene driven by the
 * same progress value.
 *
 * Smoothness: progress is eased toward the scroll position every animation frame
 * (lerp), written to a CSS variable (--p) so React never re-renders mid-scroll.
 * Both ends fade to solid colours matching the neighbouring sections, so the
 * joins are seamless in either direction.
 */

const TRANSITION_SRC = '/TRANSITION_VIDEO.mp4';
const EASE = 0.12; // 0..1 — lower = silkier but laggier

type Mode = 'css' | 'video';

interface Cloud {
  top: number; // vh
  left: number; // %
  width: number; // vmin
  opacity: number;
  speed: number; // vh travelled downward across the whole transition
}

// Deterministic layout (no randomness at render time)
const CLOUDS: Cloud[] = [
  { top: -20, left: 8, width: 38, opacity: 0.55, speed: 90 },
  { top: 5, left: 62, width: 46, opacity: 0.45, speed: 120 },
  { top: 30, left: -6, width: 30, opacity: 0.35, speed: 70 },
  { top: 48, left: 70, width: 34, opacity: 0.5, speed: 140 },
  { top: 62, left: 22, width: 52, opacity: 0.6, speed: 160 },
  { top: 85, left: 55, width: 40, opacity: 0.4, speed: 110 },
  { top: 100, left: -10, width: 48, opacity: 0.55, speed: 150 },
  { top: 120, left: 40, width: 60, opacity: 0.65, speed: 180 },
];

type CSSVars = React.CSSProperties & Record<`--${string}`, string | number>;

export const FlyThrough: React.FC = () => {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>('css');

  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let running = false;
    let current = 0;

    // Progress starts the moment the section's top enters the bottom of the
    // viewport (no dead scroll while it slides in) and ends when its bottom
    // reaches the bottom of the viewport, i.e. just as the stage un-pins.
    const targetProgress = (): number => {
      const r = section.getBoundingClientRect();
      const travel = r.height;
      return travel > 0 ? Math.min(1, Math.max(0, (window.innerHeight - r.top) / travel)) : 0;
    };

    const tick = () => {
      const target = targetProgress();
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0005) current = target;
      section.style.setProperty('--p', current.toFixed(4));

      const v = videoRef.current;
      if (v && v.readyState >= 1 && Number.isFinite(v.duration) && !v.seeking) {
        const t = current * Math.max(0, v.duration - 0.04);
        if (Math.abs(v.currentTime - t) > 1 / 90) v.currentTime = t;
      }
      raf = running ? requestAnimationFrame(tick) : 0;
    };

    // Only animate while the section is on (or near) screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running && !raf) {
          current = targetProgress(); // no catch-up jump when re-entering
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(section);

    return () => {
      running = false;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  if (reduced) return null;

  return (
    <section ref={sectionRef} className="fly" aria-hidden="true" data-mode={mode}>
      <div className="fly-stage">
        <div className="fly-sky" />

        <video
          ref={videoRef}
          className="fly-video"
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => setMode('video')}
          onError={() => setMode('css')}
        >
          <source src={TRANSITION_SRC} type="video/mp4" onError={() => setMode('css')} />
        </video>

        <div className="fly-clouds">
          {CLOUDS.map((c, i) => (
            <span
              key={i}
              className="fly-cloud"
              style={{
                top: `${c.top}vh`,
                left: `${c.left}%`,
                width: `${c.width}vmin`,
                height: `${c.width * 0.45}vmin`,
                '--o': c.opacity,
                '--speed': c.speed,
              } as CSSVars}
            />
          ))}
        </div>

        <div className="fly-plane">
          <span className="fly-trail fly-trail--l" />
          <span className="fly-trail fly-trail--r" />
          <PlaneTopView />
        </div>

        <div className="fly-fade fly-fade--in" />
        <div className="fly-fade fly-fade--out" />
      </div>
    </section>
  );
};

/** Top-down airliner silhouette, nose pointing up. */
const PlaneTopView: React.FC = () => (
  <svg className="fly-plane-svg" viewBox="0 0 100 120" fill="currentColor">
    <path d="M50 3c3.2 0 5 6 5 15v24l40 24v7l-40-10v25l14 10v5l-19-5-19 5v-5l14-10V63L5 73v-7l40-24V18c0-9 1.8-15 5-15z" />
    <rect x="22" y="56" width="6" height="12" rx="3" />
    <rect x="72" y="56" width="6" height="12" rx="3" />
  </svg>
);
