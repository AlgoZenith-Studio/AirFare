import React from 'react';
import { ArrowRight } from 'lucide-react';
import { HeroVideo } from '../components/HeroVideo';
import { HEADLINE, ROUTES } from '../data/mockData';

/** Three live figures instead of generic check-mark claims: the hero shows the product working. */
const STATS = [
  { value: String(HEADLINE.afi), label: 'Airfare index today', note: '100 = Sept 2026 prices' },
  { value: HEADLINE.dripGap, label: 'Added at checkout', note: 'On average, over the fare shown' },
  { value: String(ROUTES.length), label: 'Busiest routes tracked', note: 'Checked every day' },
];

export const Hero: React.FC = () => (
  <section className="hero theme-dark" id="top" aria-labelledby="hero-title">
    <HeroVideo />

    <div className="container">
      <div className="hero-copy">
        <h1 className="hero-title hero-in" id="hero-title">
          Know the <span className="grad">real cost</span> of flying in India.
        </h1>

        <p className="hero-sub hero-in">
          We check airfares on India&apos;s busiest routes every day and show what you really pay,
          with every tax and fee included. Free for everyone.
        </p>

        <div className="hero-ctas hero-in">
          <a className="btn btn-primary btn-pill" href="#routes">
            Check a route <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a className="btn btn-ghost btn-pill" href="#how">See how it works</a>
        </div>

        <dl className="hero-stats hero-in">
          {STATS.map((s) => (
            <div className="hero-stat" key={s.label}>
              <dt className="hero-stat-label">{s.label}</dt>
              <dd className="hero-stat-value num">{s.value}</dd>
              <dd className="hero-stat-note">{s.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);
