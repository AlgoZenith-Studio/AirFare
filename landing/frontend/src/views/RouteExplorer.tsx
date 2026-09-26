import React, { useState } from 'react';
import { ROUTES, BOOKING_WINDOWS, type BookingWindow } from '../data/mockData';
import { paiseToINR, scalePaise } from '../lib/format';
import { EdHead } from '../components/EdHead';

const WINDOWS = Object.keys(BOOKING_WINDOWS) as BookingWindow[];

export const RouteExplorer: React.FC = () => {
  const [routeId, setRouteId] = useState<string>(ROUTES[0].id);
  const [win, setWin] = useState<BookingWindow>('T+15');

  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const { label: winLabel, multiplier } = BOOKING_WINDOWS[win];

  const advertised = scalePaise(route.baseFarePaise, multiplier);
  const youPay = scalePaise(route.totalOutlayPaise, multiplier);
  const extra = youPay - advertised;
  const extraPct = ((extra / advertised) * 100).toFixed(1);
  const saving =
    scalePaise(route.totalOutlayPaise, BOOKING_WINDOWS['T+1'].multiplier) -
    scalePaise(route.totalOutlayPaise, BOOKING_WINDOWS['T+30'].multiplier);

  return (
    <section className="ed band-100" id="routes" aria-labelledby="routes-title">
      <div className="ed-inner">
        <EdHead
          id="routes-title"
          index="04"
          label="Check a route"
          title="See the real price for yourself"
          lead="Pick one of India's five busiest routes and when you plan to book. We'll show the advertised fare next to what you'd actually pay."
        />

        <div className="rx">
          <div className="rx-picker">
            <p className="ed-label" id="route-label">Route</p>
            <div className="rx-routes" role="group" aria-labelledby="route-label">
              {ROUTES.map((r, i) => (
                <button key={r.id} className="rx-route" aria-pressed={r.id === routeId} onClick={() => setRouteId(r.id)}>
                  <span className="rx-route-idx num">0{i + 1}</span>
                  <span className="rx-route-name">{r.label}</span>
                  <span className="rx-route-share">{r.paxShare}</span>
                </button>
              ))}
            </div>

            <p className="ed-label rx-when" id="when-label">When do you book?</p>
            <div className="rx-windows" role="group" aria-labelledby="when-label">
              {WINDOWS.map((w) => (
                <button key={w} className="rx-window" aria-pressed={w === win} onClick={() => setWin(w)}>
                  {BOOKING_WINDOWS[w].label}
                </button>
              ))}
            </div>
          </div>

          <div className="rx-result" aria-live="polite">
            <div className="rx-result-head">
              <div>
                <p className="ed-label">Booking {winLabel.toLowerCase()} &middot; one-way, economy</p>
                <h3 className="rx-title">{route.label}</h3>
              </div>
              <div className="rx-trend">
                <p className="ed-label">Since yesterday</p>
                <p className="rx-trend-v num">{route.change24h}</p>
              </div>
            </div>

            <dl className="rx-stats">
              <div>
                <dt className="ed-label">Advertised fare</dt>
                <dd className="rx-stat num">{paiseToINR(advertised)}</dd>
                <dd className="rx-note">What you see first</dd>
              </div>
              <div>
                <dt className="ed-label">What you pay</dt>
                <dd className="rx-stat num">{paiseToINR(youPay)}</dd>
                <dd className="rx-note">With all taxes and fees</dd>
              </div>
              <div className="rx-stat-hl">
                <dt className="ed-label">Added at checkout</dt>
                <dd className="rx-stat num">+{extraPct}%</dd>
                <dd className="rx-note">{paiseToINR(extra)} extra</dd>
              </div>
            </dl>

            <div className="rx-bars" aria-hidden="true">
              <div className="rx-bar-row">
                <span className="ed-label">Advertised</span>
                <div className="rx-track"><span className="adv" style={{ width: `${(advertised / youPay) * 100}%` }} /></div>
              </div>
              <div className="rx-bar-row">
                <span className="ed-label">You pay</span>
                <div className="rx-track"><span className="pay" style={{ width: '100%' }} /></div>
              </div>
            </div>

            <div className="rx-foot">
              <span className="ed-label">Tip</span>
              <p>
                Booking <strong>{BOOKING_WINDOWS['T+30'].label.toLowerCase()}</strong> instead of{' '}
                <strong>{BOOKING_WINDOWS['T+1'].label.toLowerCase()}</strong> on this route saves about{' '}
                <strong>{paiseToINR(saving)}</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
