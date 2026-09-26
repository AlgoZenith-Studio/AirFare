import React from 'react';
import { FARE_BREAKDOWN, HEADLINE } from '../data/mockData';
import { paiseToINR } from '../lib/format';

const totalPaise = FARE_BREAKDOWN.reduce((sum, p) => sum + p.paise, 0);
const basePaise = FARE_BREAKDOWN[0].paise;
const extraPaise = totalPaise - basePaise;

export const HiddenGap: React.FC = () => (
  <section className="ed band-500" id="gap" aria-labelledby="gap-title">
    <div className="ed-inner gap-split">
      <div className="gap-left">
        <p className="ed-label"><span className="ed-idx">[03]</span> Hidden fees</p>
        <div className="gap-giant num">{HEADLINE.dripGap}</div>
        <h2 className="gap-title" id="gap-title">The price you see isn&apos;t the price you pay.</h2>
        <p className="ed-lead">
          That&apos;s how much more people pay, on average, than the fare they were first shown.
          Old monthly surveys missed this gap. AeroFareX measures it every day.
        </p>
      </div>

      <div className="gap-right">
        <div className="ledger-head">
          <span className="ed-label">A typical Delhi &rarr; Mumbai ticket</span>
          <span className="ledger-total num">{paiseToINR(totalPaise)}</span>
        </div>

        <div className="ledger-bar" role="img" aria-label={`Ticket breakdown totalling ${paiseToINR(totalPaise)}`}>
          {FARE_BREAKDOWN.map((p) => (
            <span key={p.key} className={`seg-${p.seg}`} style={{ width: `${(p.paise / totalPaise) * 100}%` }} />
          ))}
        </div>

        <ul className="ledger">
          {FARE_BREAKDOWN.map((p, i) => (
            <li key={p.key}>
              <span className="ledger-idx num">0{i + 1}</span>
              <span className={`sw seg-${p.seg}`} aria-hidden="true" />
              <span className="ledger-name">{p.label}</span>
              <span className="num">{paiseToINR(p.paise)}</span>
            </li>
          ))}
          <li className="ledger-sum">
            <span />
            <span />
            <span className="ledger-name">Added on top of the fare</span>
            <span className="num">+{paiseToINR(extraPaise)}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
);
