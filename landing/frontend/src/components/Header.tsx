import React, { useEffect, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { PORTAL_URL } from '../lib/format';
import { NAV_LINKS } from '../data/nav';

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="header theme-dark">
      <div className="container header-shell">
        <div className="header-bar">
          <a className="brand" href="#top" aria-label="AeroFareX home">
            <img className="brand-logo" src="/long_logo.svg" alt="AeroFareX" />
          </a>

          <nav className="nav" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>

          <div className="header-actions">
            <a className="btn btn-primary btn-sm" href={PORTAL_URL} target="_blank" rel="noreferrer">
              Analyst login <ArrowRight size={16} aria-hidden="true" />
            </a>
            <button
              className="menu-btn"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
            ))}
            <a className="btn btn-primary" href={PORTAL_URL} target="_blank" rel="noreferrer">
              Analyst login <ArrowRight size={16} aria-hidden="true" />
            </a>
          </nav>
        )}
      </div>
    </header>
  );
};
