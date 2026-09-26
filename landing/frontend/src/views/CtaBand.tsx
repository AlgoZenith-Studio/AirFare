import React from 'react';
import { ArrowRight } from 'lucide-react';
import { PORTAL_URL } from '../lib/format';

export const CtaBand: React.FC = () => (
  <section className="ed band-400 cta-ed" aria-labelledby="cta-title">
    <div className="ed-inner">
      <p className="ed-label cta-ed-label"><span className="ed-idx">[07]</span> Free and open</p>
      <h2 className="cta-ed-title" id="cta-title">
        <span>Every number,</span>
        <span>open to <span className="grad">everyone</span>.</span>
      </h2>

      <div className="crop-marks" aria-hidden="true">
        <span className="crop crop--left" />
        <span className="crop crop--right" />
      </div>

      <div className="cta-ed-row">
        <p className="ed-lead">
          No sign-up, no ads, nothing to sell. Check today&apos;s prices, or open the full dashboard for
          deeper analysis.
        </p>
        <div className="hero-ctas">
          <a className="btn btn-dark" href="#routes">
            Check a route <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="btn btn-ghost" href={PORTAL_URL} target="_blank" rel="noreferrer">
            Open analyst dashboard
          </a>
        </div>
      </div>
    </div>
  </section>
);
