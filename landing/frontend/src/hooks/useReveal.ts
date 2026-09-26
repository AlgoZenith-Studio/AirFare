import { useEffect } from 'react';

/**
 * Two-way scroll animation for the whole page.
 *
 * Every element matched by REVEAL_TARGETS animates:
 *   - entering while scrolling DOWN: rises in from below
 *   - leaving while scrolling DOWN:  drifts up and fades out at the top
 *   - scrolling UP: the exact mirror (drops in from above, sinks out below)
 * Siblings stagger in (cards, rows, steps, columns) and leave with no delay.
 *
 * State lives in data attributes (data-reveal / data-revealed / data-reveal-from),
 * never in className: React rewrites className on re-render (e.g. selecting a
 * feature), which would wipe an added class.
 *
 * Targets are chosen so none is nested inside another (no double animation).
 * Skipped entirely when the visitor prefers reduced motion.
 */
const REVEAL_TARGETS = [
  // hero
  '.hero-title', '.hero-sub', '.hero .hero-ctas',
  // manifesto
  '.manifesto-title > span', '.crop-marks', '.m-col', '.m-ticker',
  // built-for strip
  '.trust-label', '.trust-item',
  // every editorial section header
  '.ed-head .ed-label', '.ed-head .ed-title', '.ed-head .ed-lead',
  // features
  '.ft-item', '.ft-panel-wrap',
  // what we track
  '.ed-box', '.ed-link',
  // hidden fees
  '.gap-left > *', '.ledger-head', '.ledger-bar', '.ledger li',
  // route explorer
  '.rx-picker', '.rx-result',
  // how it works / who it's for
  '.step-ed', '.aud-box',
  // closing banner
  '.cta-ed-label', '.cta-ed-title > span', '.cta-ed-row .ed-lead', '.cta-ed-row .hero-ctas',
  // footer
  '.foot-logo', '.foot-tagline', '.foot-col', '.foot-bottom > *',
].join(',');

const STAGGER_MS = 80;
const STAGGER_MAX = 7;

export function useReveal(): void {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const els: HTMLElement[] = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_TARGETS));

    // Stagger: position among sibling targets under the same parent.
    const seen = new Map<Element, number>();
    els.forEach((el) => {
      const parent = el.parentElement ?? document.body;
      const i = seen.get(parent) ?? 0;
      seen.set(parent, i + 1);
      el.style.setProperty('--reveal-delay', `${Math.min(i, STAGGER_MAX) * STAGGER_MS}ms`);
      el.setAttribute('data-reveal', '');
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const el = e.target;
          if (e.isIntersecting) {
            el.setAttribute('data-revealed', '');
          } else {
            el.removeAttribute('data-revealed');
            // Hidden above the viewport -> it will come back down; below -> it will rise up.
            const rootTop = e.rootBounds?.top ?? 0;
            el.setAttribute('data-reveal-from', e.boundingClientRect.bottom <= rootTop ? 'above' : 'below');
          }
        });
      },
      { rootMargin: '-4% 0px -8% 0px', threshold: 0 },
    );
    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      els.forEach((el) => {
        el.removeAttribute('data-reveal');
        el.removeAttribute('data-revealed');
        el.removeAttribute('data-reveal-from');
      });
    };
  }, []);
}
