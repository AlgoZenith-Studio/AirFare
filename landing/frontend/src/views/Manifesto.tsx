import React from 'react';
import { ROUTES, HEADLINE } from '../data/mockData';
import { paiseToINR } from '../lib/format';

/**
 * Editorial statement section directly under the hero: a full-width display
 * headline with crop marks, then three ruled columns. The right column is a
 * dense "ticker" of today's real numbers (the reference's decorative code block,
 * made useful).
 */
export const Manifesto: React.FC = () => (
  <section className="manifesto" aria-labelledby="manifesto-title">
    <div className="manifesto-inner">
      <h2 className="manifesto-title" id="manifesto-title">
        <span>Every Fee.</span>
        <span>Every Route.</span>
        <span>Every Day.</span>
      </h2>

      <div className="crop-marks" aria-hidden="true">
        <span className="crop crop--left" />
        <span className="crop crop--right" />
      </div>

      <div className="manifesto-cols">
        <article className="m-col">
          <p className="m-label">The Problem</p>
          <p className="m-body">
            Airlines show you one price, but you pay another. Fuel charges, airport fees, GST and
            booking fees are added at checkout. Official figures still record only the first
            number, once a month, from a few ticket counters.
          </p>
        </article>

        <article className="m-col">
          <p className="m-label">Our Answer</p>
          <p className="m-body">
            AeroFareX checks real fares on India&apos;s busiest routes every day and adds up everything
            you actually pay. The result is a daily, honest price index that anyone can use and
            anyone can check.
          </p>
        </article>

        <aside className="m-ticker" aria-label="Today's fares">
          <p className="m-label">[Today &middot; {HEADLINE.asOf}]</p>
          <dl className="ticker">
            {ROUTES.map((r) => (
              <div className="ticker-row" key={r.id}>
                <dt>{r.id.replace('-', '→')}</dt>
                <dd className="num">{paiseToINR(r.totalOutlayPaise)}</dd>
                <dd className="num">{r.change24h}</dd>
              </div>
            ))}
            <div className="ticker-row ticker-row--sum">
              <dt>Fare index</dt>
              <dd className="num">{HEADLINE.afi}</dd>
              <dd />
            </div>
            <div className="ticker-row ticker-row--sum">
              <dt>You-pay index</dt>
              <dd className="num">{HEADLINE.tctAfi}</dd>
              <dd />
            </div>
            <div className="ticker-row ticker-row--sum">
              <dt>Hidden extra</dt>
              <dd className="num">{HEADLINE.dripGap}</dd>
              <dd />
            </div>
          </dl>
        </aside>
      </div>
    </div>
  </section>
);
