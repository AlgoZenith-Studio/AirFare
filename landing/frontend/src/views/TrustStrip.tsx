import React from 'react';

const PARTNERS = [
  { short: 'MoSPI', long: 'Ministry of Statistics' },
  { short: 'RBI', long: 'Reserve Bank of India' },
  { short: 'DGCA', long: 'Civil Aviation Regulator' },
];

export const TrustStrip: React.FC = () => (
  <section className="ed band-900 theme-dark trust" aria-label="Built for">
    <div className="ed-inner trust-grid">
      <p className="ed-label trust-label">
        Built for India&apos;s<br />official price statistics
      </p>
      {PARTNERS.map((p) => (
        <div className="trust-item" key={p.short}>
          <strong>{p.short}</strong>
          <span>{p.long}</span>
        </div>
      ))}
    </div>
  </section>
);
