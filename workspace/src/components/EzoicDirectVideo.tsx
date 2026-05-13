import React, { useEffect, useRef } from 'react';

export function EzoicDirectVideo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // To prevent double injection
    if (container.hasAttribute('data-initialized')) return;
    container.setAttribute('data-initialized', 'true');

    // Manually pushing a mock script node since document.currentScript is null during dynamic insertion
    // But actually we can create a script node, append it, and instead of relying on its execution to have currentScript,
    // we can directly push it.
    
    // Ezoic looks at target.parentElement or target.parentNode to insert the video.
    const targetScript = document.createElement('script');
    targetScript.setAttribute('data-ezscrex', 'false');
    targetScript.setAttribute('data-cfasync', 'false');
    container.appendChild(targetScript);

    // Instead of inline script, just push the target we created.
    const w = window as any;
    w.openVideoPlayers = w.openVideoPlayers || [];
    w.openVideoPlayers.push({ target: targetScript });

    // Load the video.js
    const externalScript = document.createElement('script');
    externalScript.async = true;
    externalScript.setAttribute('data-ezscrex', 'false');
    externalScript.setAttribute('data-cfasync', 'false');
    externalScript.src = "https://open.video/video.js";
    container.appendChild(externalScript);

    return () => {
       // Cleanup if needed
       // container.removeAttribute('data-initialized');
       // container.innerHTML = ''; 
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full z-50 flex items-center justify-center pointer-events-auto"
      style={{ isolation: 'isolate' }}
    />
  );
}
