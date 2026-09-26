import React, { useRef, useState } from 'react';
import { Check, PlayCircle } from 'lucide-react';
import { EdHead } from '../components/EdHead';
import { FEATURES, type Feature } from '../data/features';

/**
 * Features with a preview panel.
 * Desktop: numbered list on the left, sticky preview on the right.
 * Mobile:  the preview opens inline under the selected feature.
 * Accessible tabs: arrow keys / Home / End move between features.
 */

const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);

const FeatureMedia: React.FC<{ feature: Feature; index: number }> = ({ feature, index }) => {
  if (feature.media) {
    return isVideo(feature.media) ? (
      <video className="ft-media-fill" src={feature.media} autoPlay muted loop playsInline />
    ) : (
      <img className="ft-media-fill" src={feature.media} alt={feature.title} />
    );
  }
  const Icon = feature.icon;
  return (
    <div className="ft-soon">
      <div className="ft-soon-top">
        <span className="ed-label">[{String(index + 1).padStart(2, '0')}] {feature.audience}</span>
        <span className="ft-soon-pill"><PlayCircle size={14} aria-hidden="true" /> Demo coming soon</span>
      </div>

      <div className="ft-soon-head">
        <span className="ft-soon-icon"><Icon size={22} aria-hidden="true" /></span>
        <p className="ft-soon-title">{feature.title}</p>
      </div>

      <p className="ft-soon-text">{feature.details}</p>

      <ul className="ft-soon-points">
        {feature.points.map((pt) => (
          <li key={pt}><Check size={16} aria-hidden="true" /> {pt}</li>
        ))}
      </ul>

      <div className="ft-soon-example">
        <span className="ed-label">Example</span>
        <p>{feature.example}</p>
      </div>
    </div>
  );
};

export const Features: React.FC = () => {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const focusTab = (i: number) => {
    const next = (i + FEATURES.length) % FEATURES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusTab(i + 1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusTab(i - 1); }
    if (e.key === 'Home') { e.preventDefault(); focusTab(0); }
    if (e.key === 'End') { e.preventDefault(); focusTab(FEATURES.length - 1); }
  };

  const current = FEATURES[active];

  return (
    <section className="ed band-100" id="features" aria-labelledby="features-title">
      <div className="ed-inner">
        <EdHead
          id="features-title"
          index="01"
          label="Features"
          title="Everything AeroFareX gives you"
          lead="Six simple tools that show what flying in India really costs. Pick one to see what it does."
        />

        <div className="ft">
          <div className="ft-list" role="tablist" aria-orientation="vertical" aria-label="AeroFareX features">
            {FEATURES.map((f, i) => {
              const on = i === active;
              return (
                <div className={`ft-item${on ? ' is-active' : ''}`} key={f.id}>
                  <button
                    ref={(el) => { tabRefs.current[i] = el; }}
                    role="tab"
                    id={`ft-tab-${f.id}`}
                    aria-selected={on}
                    aria-controls="ft-panel"
                    tabIndex={on ? 0 : -1}
                    className="ft-tab"
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                  >
                    <span className="ft-num num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ft-title">{f.title}</span>
                    <span className="ft-aud">{f.audience}</span>
                  </button>

                  <div className="ft-expand" aria-hidden={!on}>
                    <div className="ft-expand-inner">
                      <p className="ft-desc">{f.description}</p>
                      {/* mobile-only inline preview */}
                      <div className={`ft-inline-media${f.media ? ' has-media' : ''}`}>
                        {on && <FeatureMedia feature={f} index={i} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ft-panel-wrap">
            <div className={`ft-panel${current.media ? ' has-media' : ''}`} id="ft-panel" role="tabpanel" aria-labelledby={`ft-tab-${current.id}`}>
              <div className="ft-panel-anim" key={current.id}>
                <FeatureMedia feature={current} index={active} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
