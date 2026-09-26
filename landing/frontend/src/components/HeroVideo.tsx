import React, { useState } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

type VideoState = 'loading' | 'ready' | 'error';

const HERO_VIDEO_SRC = '/HERO_VIDEO.mp4';

/**
 * Full-bleed looping hero video.
 * - loading: the sky-glow gradient on .hero-media shows underneath
 * - ready:   the video fades in
 * - error:   the video is removed and the gradient stays (page never breaks)
 * - reduced motion: the video is not rendered at all
 */
export const HeroVideo: React.FC = () => {
  const [state, setState] = useState<VideoState>('loading');
  const reduced = useReducedMotion();

  return (
    <div className="hero-media" aria-hidden="true">
      {!reduced && state !== 'error' && (
        <video
          className={`hero-video${state === 'ready' ? ' is-ready' : ''}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => setState('ready')}
          onError={() => setState('error')}
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" onError={() => setState('error')} />
        </video>
      )}
      <div className="hero-scrim" />
    </div>
  );
};
