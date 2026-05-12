import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import HomePage from './pages/HomePage';
import { Footer } from './components/Footer';
import { useViewportIntelligence } from './lib/runtime/viewport';
import { useApplicationLifecycle } from './lib/runtime/lifecycle';
import { useRuntimeObservability } from './lib/runtime/observability';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { PageLoader } from './components/system/PageLoader';
import { useNetworkStatus } from './hooks/useNetworkStatus';

import { GlobalHeader } from './components/navigation/GlobalHeader';
import { MobileBottomNav } from './components/navigation/MobileBottomNav';
import { Breadcrumbs } from './components/navigation/Breadcrumbs';

const VideoStudioPage = lazy(() => import('./pages/VideoStudioPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Nutrition Features
const NutritionDashboardPage = lazy(() => import('./features/nutrition/pages/NutritionDashboardPage'));
const CaloriesBurnedCalculatorPage = lazy(() => import('./features/nutrition/pages/CaloriesBurnedCalculatorPage'));
const MacroCalculatorPage = lazy(() => import('./features/nutrition/pages/MacroCalculatorPage'));

// Recovery Features
const RecoveryDashboardPage = lazy(() => import('./features/recovery/pages/RecoveryDashboardPage'));

// Athlete Features
const AthleteDashboardPage = lazy(() => import('./features/athlete/pages/AthleteDashboardPage'));

export default function App() {
  const location = useLocation();
  const isOnline = useNetworkStatus();
  
  const isStudio = location.pathname.startsWith('/studio');
  const isAthlete = location.pathname.startsWith('/athlete') ||
                    location.pathname.startsWith('/dashboard') ||
                    location.pathname.startsWith('/nutrition') || 
                    location.pathname.startsWith('/calories-burned-calculator') || 
                    location.pathname.startsWith('/macro-calculator') ||
                    location.pathname.startsWith('/recovery') ||
                    location.pathname.startsWith('/mobility-recovery');

  useViewportIntelligence();
  useApplicationLifecycle();
  useRuntimeObservability();

  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.warn("Unhandled Promise Rejection caught globally:", event.reason);
    };

    const handleError = (event: ErrorEvent) => {
      console.warn("Unhandled Error caught globally:", event.error);
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`${isStudio ? "min-h-[100dvh] md:h-[100dvh] overflow-x-hidden md:overflow-hidden" : "min-h-screen overflow-x-hidden pb-16 md:pb-0"} flex flex-col bg-cream selection:bg-gold w-full max-w-full overflow-x-hidden`}>
      {!isOnline && (
        <div className="bg-charcoal text-cream text-xs py-1 px-4 text-center w-full z-50">
          You are currently offline. Changes may not be saved.
        </div>
      )}
      {!isStudio && <GlobalHeader />}
      {!isStudio && <Breadcrumbs />}
      <AppErrorBoundary>
        <main className={`flex-1 min-h-0 w-full overflow-x-hidden ${(isStudio || isAthlete) ? "flex flex-col relative overflow-x-hidden md:overflow-hidden" : "relative"}`}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<HomePage />} />
              <Route path="/studio" element={<Suspense fallback={<PageLoader />}><VideoStudioPage /></Suspense>} />
              
              {/* Athlete Routes */}
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><AthleteDashboardPage /></Suspense>} />
              <Route path="/athlete-readiness" element={<Suspense fallback={<PageLoader />}><AthleteDashboardPage /></Suspense>} />
              <Route path="/mobility-streak" element={<Suspense fallback={<PageLoader />}><AthleteDashboardPage /></Suspense>} />

              {/* Nutrition Routes */}
              <Route path="/nutrition" element={<Suspense fallback={<PageLoader />}><NutritionDashboardPage /></Suspense>} />
              <Route path="/calories-burned-calculator" element={<Suspense fallback={<PageLoader />}><CaloriesBurnedCalculatorPage /></Suspense>} />
              <Route path="/macro-calculator" element={<Suspense fallback={<PageLoader />}><MacroCalculatorPage /></Suspense>} />

              {/* Recovery Routes */}
              <Route path="/recovery" element={<Suspense fallback={<PageLoader />}><RecoveryDashboardPage /></Suspense>} />
              <Route path="/recovery-score-calculator" element={<Suspense fallback={<PageLoader />}><RecoveryDashboardPage /></Suspense>} />
              <Route path="/mobility-recovery" element={<Suspense fallback={<PageLoader />}><RecoveryDashboardPage /></Suspense>} />

              <Route path="/privacy-policy" element={<Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>} />
              <Route path="/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><ContactPage /></Suspense>} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </AppErrorBoundary>
      {!isStudio && !isAthlete && <Footer />}
      {!isStudio && <MobileBottomNav />}
    </div>
  );
}
