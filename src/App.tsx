import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import HomePage from './pages/HomePage';
import { Footer } from './components/Footer';
import { useViewportIntelligence } from './lib/runtime/viewport';
import { useApplicationLifecycle } from './lib/runtime/lifecycle';
import { useRuntimeObservability } from './lib/runtime/observability';

const VideoStudioPage = lazy(() => import('./pages/VideoStudioPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

export default function App() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');

  useViewportIntelligence();
  useApplicationLifecycle();
  useRuntimeObservability();

  return (
    <div className={`${isStudio ? "min-h-[100dvh] md:h-[100dvh] overflow-x-hidden md:overflow-hidden" : "min-h-screen overflow-x-hidden"} flex flex-col bg-cream selection:bg-gold w-full max-w-full overflow-x-hidden`}>
      <main className={`flex-1 min-h-0 w-full overflow-x-hidden ${isStudio ? "flex flex-col relative overflow-x-hidden md:overflow-hidden" : "relative"}`}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-cream"><div className="w-8 h-8 border-4 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></div></div>}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/studio" element={<VideoStudioPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      {!isStudio && <Footer />}
    </div>
  );
}
