import React from 'react';
import { Ticket, Wallet, Luggage, ArrowUpRight } from 'lucide-react';
import { EdHead } from '../components/EdHead';

const ITEMS = [
  {
    icon: Ticket,
    tag: 'Ticket price',
    title: 'The advertised fare',
    body: 'The price airlines show first when you search. It is what most price trackers stop at.',
    index: 'AFI',
  },
  {
    icon: Wallet,
    tag: 'Total cost',
    title: 'What you actually pay',
    body: 'The full amount at checkout: the fare plus fuel charges, airport fees, GST and booking fees.',
    index: 'TCT-AFI',
  },
  {
    icon: Luggage,
    tag: 'Extras',
    title: 'The optional extras',
    body: 'Seat selection, extra bags and meals. These add-ons quietly get pricier, so we track them too.',
    index: 'ANC-AFI',
  },
];

export const WhatWeTrack: React.FC = () => (
  <section className="ed band-200" id="track" aria-labelledby="track-title">
    <div className="ed-inner">
      <EdHead
        id="track-title"
        index="02"
        label="What we track"
        title="Three simple numbers, updated every day"
        lead="A plane ticket is never just one price. We follow all three parts, so you see the whole picture and not just the eye-catching fare."
      />

      <div className="ed-grid-3">
        {ITEMS.map(({ icon: Icon, tag, title, body, index }, i) => (
          <article className="ed-box" key={title}>
            <div className="ed-box-top">
              <span className="ed-label">{tag}</span>
              <span className="ed-box-num">0{i + 1}</span>
            </div>
            <h3 className="ed-box-title">{title}</h3>
            <p className="ed-box-body">{body}</p>
            <div className="ed-box-foot">
              <span className="ed-label">Index &middot; {index}</span>
              <Icon size={20} aria-hidden="true" />
            </div>
          </article>
        ))}
      </div>

      <a className="ed-link" href="#routes">
        See these numbers for a real route <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </div>
  </section>
);
