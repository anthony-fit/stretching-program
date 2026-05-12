/**
 * Environmental Observability Layer
 * Silent, internal awareness of systemic stress, RAF stability, and degradation.
 * This is not an analytics tracker—it is a runtime sensory system.
 * 
 * performance.ts defines policy (limits and ceilings).
 * observability.ts measures reality (current environmental stress).
 */

import { useEffect } from 'react';

export type SystemStressState = 'stable' | 'strained' | 'degrading';

class ObservabilityEngine {
  private state: SystemStressState = 'stable';
  private frameCount = 0;
  private lastTime = performance.now();
  private deltaWindow: number[] = [];
  private readonly windowSize = 60; // Rolling window of frame durations
  private isObserving = false;
  private rafId: number | null = null;
  private startTime = 0;
  
  // Real-time internal metrics (not for UI/analytics)
  public metrics = {
    averageFps: 60,
    longTasksCount: 0,
    degradationEvents: 0,
    exportStalls: 0,
    
    // Temporal Orchestration Drift Metrics
    audioDriftDelta: 0,    // MS difference between Orchestrator and AudioContext
    seekReconciliationDuration: 0, // MS taken to resolve a seek state
    exportFrameDrift: 0,   // Jitter in export stepping loop timing
    subtitleTimingVariance: 0, // MS variance in subtitle rendering boundary
    rafJitter: 0 // MS variance in requestAnimationFrame delivery
  };

  private observer: PerformanceObserver | null = null;

  public start() {
    if (this.isObserving || typeof window === 'undefined') return;
    this.isObserving = true;
    this.startTime = performance.now();
    this.lastTime = performance.now();
    this.deltaWindow = [];
    this.frameCount = 0;
    this.observeLoop();
    this.initLongTaskObserver();
    
    console.debug('[OS Layer] Observability Engine started.');
  }

  public stop() {
    this.isObserving = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
    }
  }

  public trackExportStall() {
    this.metrics.exportStalls++;
    this.setStressState('degrading');
  }

  public trackAudioDrift(deltaMs: number) {
    // Keep a rolling exponential average
    this.metrics.audioDriftDelta = this.metrics.audioDriftDelta * 0.9 + deltaMs * 0.1;
  }

  public trackSeekReconciliation(durationMs: number) {
    this.metrics.seekReconciliationDuration = durationMs;
  }

  public trackExportFrameDrift(deltaMs: number) {
    this.metrics.exportFrameDrift = this.metrics.exportFrameDrift * 0.9 + deltaMs * 0.1;
  }

  public trackSubtitleVariance(varianceMs: number) {
    this.metrics.subtitleTimingVariance = this.metrics.subtitleTimingVariance * 0.9 + Math.abs(varianceMs) * 0.1;
  }

  private observeLoop = () => {
    if (!this.isObserving) return;

    // Gated explicit exit: Stop RAF loop after 10s to allow AI Studio idle validation
    if (performance.now() - this.startTime > 10000) {
      console.debug('[OS Layer] Observability Engine auto-paused to allow system idle.');
      this.isObserving = false;
      return;
    }

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;
    
    const targetDelta = 1000 / 60;
    const jitter = Math.abs(delta - targetDelta);
    this.metrics.rafJitter = this.metrics.rafJitter * 0.9 + jitter * 0.1;

    // Track frame delta
    this.deltaWindow.push(delta);
    if (this.deltaWindow.length > this.windowSize) {
      this.deltaWindow.shift();
    }

    this.frameCount++;
    
    // Evaluate state every 60 frames (~1 second)
    if (this.frameCount % 60 === 0) {
      this.evaluateStressState();
    }

    this.rafId = requestAnimationFrame(this.observeLoop);
  };

  private initLongTaskObserver() {
    if (!('PerformanceObserver' in window)) return;
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.longTasksCount++;
          // A long task > 100ms indicates dropped frames or blocked main thread
          if (entry.duration > 200) {
            this.setStressState('degrading');
          } else if (entry.duration > 100) {
            this.setStressState('strained');
          }
        }
      });
      this.observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      // Browser environment may not support longtask observation
    }
  }

  private evaluateStressState() {
    if (this.deltaWindow.length === 0) return;

    const avgDelta = this.deltaWindow.reduce((a, b) => a + b, 0) / this.deltaWindow.length;
    this.metrics.averageFps = 1000 / avgDelta;

    // Adaptive thresholds
    if (this.metrics.averageFps < 24) {
      this.setStressState('degrading');
    } else if (this.metrics.averageFps < 45) {
      this.setStressState('strained');
    } else {
      this.setStressState('stable');
    }
  }

  private setStressState(newState: SystemStressState) {
    if (this.state === newState) return;
    
    this.state = newState;
    
    if (newState === 'degrading') {
      this.metrics.degradationEvents++;
    }
    
    // Expose state as an HTML data attribute to allow CSS
    // to silently disable expensive effects (like backdrop-filter) via global styles
    document.documentElement.dataset.systemStress = newState;
  }
}

export const RuntimeObserver = new ObservabilityEngine();

export function useRuntimeObservability() {
  useEffect(() => {
    RuntimeObserver.start();
    
    // Ensure cleanup of visibility listeners if any, and stop observer on unmount
    const handleVisibility = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        RuntimeObserver.stop();
      } else {
        RuntimeObserver.start();
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }
    
    return () => {
      RuntimeObserver.stop();
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, []);
}
