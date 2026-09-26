import { useEffect } from 'react';

/**
 * Fades in every `.reveal` element once it scrolls into view.
 * Uses a data attribute, not a class: React rewrites `className` on re-render
 * (e.g. when a feature is selected), which would wipe an added class and hide it again.
 */
export function useReveal(): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.setAttribute('data-revealed', ''));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', '');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
