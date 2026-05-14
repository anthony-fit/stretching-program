import { useEffect, useRef } from 'react';

export function EzoicVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useRef(Math.random().toString(36).substring(2, 9)).current;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    // Safety check to avoid double initialization
    if (el.hasAttribute('data-initialized')) return;
    el.setAttribute('data-initialized', 'true');

    // Isolate from React re-renders: create a native DOM element for Ezoic
    const playerTarget = document.createElement("div");
    playerTarget.id = `ezoic-player-mount-${id}`;
    playerTarget.className = "w-full h-full";
    el.appendChild(playerTarget);

    const w = window as any;
    if (!Array.isArray(w.openVideoPlayers)) {
      w.openVideoPlayers = [];
    }
    
    w.openVideoPlayers.push({ target: playerTarget });

    if (!document.querySelector('script[src="https://open.video/video.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://open.video/video.js';
      script.async = true;
      script.setAttribute('data-ezscrex', 'false');
      script.setAttribute('data-cfasync', 'false');
      script.id = 'ezoic-player-script';
      document.body.appendChild(script);
    }
    
    // Cleanup on unmount/route transitions to prevent memory leaks
    return () => {
      if (Array.isArray(w.openVideoPlayers)) {
         w.openVideoPlayers = w.openVideoPlayers.filter((p: any) => p.target !== playerTarget);
      }
      if (el.contains(playerTarget)) {
        el.removeChild(playerTarget);
      }
      el.removeAttribute('data-initialized');
    };
  }, []);

  return (
    <div 
      className="w-full aspect-video rounded-xl overflow-hidden bg-charcoal/5 flex items-center justify-center relative border border-charcoal/10"
    >
      <div 
        id={`ezoic-player-${id}`}
        ref={containerRef}
        className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>div]:w-full [&>div]:h-full"
      />
      {/* Fallback layout before video loads, or while in AI Studio preview */}
      <div className="absolute inset-0 flex items-center justify-center text-charcoal/20 z-[-1] !hidden">
        Video Player
      </div>
    </div>
  );
}
