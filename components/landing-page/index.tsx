'use client';

import { Header } from './header';
import { Hero } from './hero';
import { Features } from './features';
import { CTA } from './cta';
import { Footer } from './footer';

/**
 * Main landing page component that integrates all sections
 */
export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
} 