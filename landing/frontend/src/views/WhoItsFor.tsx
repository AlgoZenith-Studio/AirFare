import React from 'react';
import { Users, Landmark, LineChart, GraduationCap } from 'lucide-react';
import { EdHead } from '../components/EdHead';

const AUDIENCE = [
  { icon: Users, title: 'Travellers', body: 'See the real cost of a trip and the cheapest time to book.' },
  { icon: Landmark, title: 'Government', body: 'Faster, more accurate travel prices for national statistics.' },
  { icon: LineChart, title: 'Economists', body: 'Daily, reliable data on how airfares move across India.' },
  { icon: GraduationCap, title: 'Researchers', body: 'Open access to the method and history behind every number.' },
];

export const WhoItsFor: React.FC = () => (
  <section className="ed band-800 theme-dark" id="who" aria-labelledby="who-title">
    <div className="ed-inner">
      <EdHead
        id="who-title"
        index="06"
        label="Who it's for"
        title="Made for everyone who flies, and everyone who counts"
        lead="From a family planning a holiday to the teams behind national policy, everyone gets the same clear numbers."
      />
      <div className="aud-ed">
        {AUDIENCE.map(({ icon: Icon, title, body }, i) => (
          <article className="aud-box" key={title}>
            <div className="aud-box-left">
              <span className="ed-label">0{i + 1}</span>
              <h3 className="aud-box-title">{title}</h3>
              <Icon size={22} aria-hidden="true" />
            </div>
            <p className="aud-box-right">{body}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
