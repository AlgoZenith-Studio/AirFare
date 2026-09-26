import React from 'react';
import { EdHead } from '../components/EdHead';

const STEPS = [
  {
    label: 'Collect',
    title: 'We check prices daily',
    body: 'Four times a day, we look up real fares on India’s busiest routes across the major airlines.',
  },
  {
    label: 'Unbundle',
    title: 'We add up the real total',
    body: 'Each price is split into its parts: fare, fuel charge, airport fees, GST and booking fees.',
  },
  {
    label: 'Publish',
    title: 'We publish it openly',
    body: 'The numbers go live the same day, and every one can be traced back to the original price.',
  },
];

export const HowItWorks: React.FC = () => (
  <section className="ed band-300" id="how" aria-labelledby="how-title">
    <div className="ed-inner">
      <EdHead
        id="how-title"
        index="05"
        label="How it works"
        title="Honest prices in three steps"
        lead="No guesswork and no black box. Here's how a flight price becomes a number you can rely on."
      />
      <ol className="steps-ed">
        {STEPS.map((s, i) => (
          <li className="step-ed reveal" key={s.title}>
            <span className="ed-label">{s.label}</span>
            <span className="step-ed-num num">0{i + 1}</span>
            <h3 className="step-ed-title">{s.title}</h3>
            <p className="step-ed-body">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
