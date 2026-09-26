import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * Smooth, eased wheel scrolling for the whole page (Lenis).
 *
 * Lenis drives the real window scroll position, so everything that reads scroll
 * (the pinned plane transition, the sticky feature panel, the two-way reveal
 * animations) keeps working unchanged. Touch devices keep their native scrolling.
 *
 * In-page links (#features, #routes, ...) glide with the same easing and stop just
 * below the floating header. Disabled when the visitor prefers reduced motion.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      lerp: 0.09, // lower = smoother / floatier
      smoothWheel: true,
      wheelMultiplier: 1,
      autoRaf: true,
    });

    // Offset for anchor jumps: bottom edge of the floating header pill + breathing room.
    const headerOffset = (): number => {
      const bar = document.querySelector('.header-bar');
      return bar ? bar.getBoundingClientRect().bottom + 16 : 0;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute('href') ?? '';
      if (hash === '#top' || hash === '#') {
        e.preventDefault();
        lenis.scrollTo(0);
        return;
      }
      const target = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -headerOffset() });
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
    };
  }, []);
}
