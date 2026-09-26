import React from 'react';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useReveal } from './hooks/useReveal';
import { Hero } from './views/Hero';
import { FlyThrough } from './components/FlyThrough';
import { Manifesto } from './views/Manifesto';
import { TrustStrip } from './views/TrustStrip';
import { Features } from './views/Features';
import { WhatWeTrack } from './views/WhatWeTrack';
import { HiddenGap } from './views/HiddenGap';
import { RouteExplorer } from './views/RouteExplorer';
import { HowItWorks } from './views/HowItWorks';
import { WhoItsFor } from './views/WhoItsFor';
import { CtaBand } from './views/CtaBand';
import { SiteFooter } from './views/SiteFooter';

export const App: React.FC = () => {
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <ErrorBoundary>
        <main id="main">
          <Hero />
          <FlyThrough />
          <Manifesto />
          <TrustStrip />
          <Features />
          <WhatWeTrack />
          <HiddenGap />
          <RouteExplorer />
          <HowItWorks />
          <WhoItsFor />
          <CtaBand />
        </main>
      </ErrorBoundary>
      <SiteFooter />
    </>
  );
};
