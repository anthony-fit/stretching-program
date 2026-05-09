import { useEffect } from 'react';

/**
 * Initializes global viewport intelligence and infrastructure.
 * Handles bfcache restoration, visual viewport adjustments,
 * orientation changes, and Safari-specific quirks.
 */
export function useViewportIntelligence() {
  useEffect(() => {
    // 1. Handle iOS Safari bfcache (back/forward cache) layout restoration
    // Ensures layouts and fixed overlays don't stay frozen on swipe-back.
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        requestAnimationFrame(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }
    };

    // 2. Track Visual Viewport & Full Window dimensions for mobile keyboard awareness
    let rafId: number | null = null;
    
    const updateViewportVariables = () => {
      // Sync global application height
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
      
      // Sync visual viewport for keyboard awareness (handling interactive-widget)
      if (window.visualViewport) {
        document.documentElement.style.setProperty('--vv-height', `${window.visualViewport.height}px`);
        document.documentElement.style.setProperty('--vv-offset-top', `${window.visualViewport.offsetTop}px`);
      }
      
      rafId = null;
    };

    // Throttled handler to prevent layout thrashing from aggressive Safari events
    const handleViewportChange = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateViewportVariables);
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('orientationchange', handleViewportChange);
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
    }

    // Initialize variables immediately
    updateViewportVariables();

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);
}
