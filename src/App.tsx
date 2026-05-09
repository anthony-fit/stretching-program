import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import HomePage from './pages/HomePage';
import VideoStudioPage from './pages/VideoStudioPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import { Footer } from './components/Footer';
import { useViewportIntelligence } from './lib/runtime/viewport';
import { useApplicationLifecycle } from './lib/runtime/lifecycle';
import { useRuntimeObservability } from './lib/runtime/observability';

export default function App() {
  const location = useLocation();
  const isStudio = location.pathname.startsWith('/studio');

  useViewportIntelligence();
  useApplicationLifecycle();
  useRuntimeObservability();

  return (
    <div className={`${isStudio ? "h-[100dvh] overflow-hidden" : "min-h-screen overflow-x-hidden"} flex flex-col bg-cream selection:bg-gold w-full max-w-full overflow-x-hidden`}>
      <main className={`flex-1 min-h-0 w-full overflow-x-hidden ${isStudio ? "flex flex-col relative overflow-hidden" : "relative"}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/studio" element={<VideoStudioPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isStudio && <Footer />}
    </div>
  );
}
