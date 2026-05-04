import { useEffect, useRef } from 'react';

export function EzoicVideo() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear out to prevent duplicated script tags on re-renders/HMR
    containerRef.current.innerHTML = '';
    
    // Create inline script
    const inlineScript = document.createElement('script');
    inlineScript.setAttribute('data-ezscrex', 'false');
    inlineScript.setAttribute('data-cfasync', 'false');
    inlineScript.textContent = `(window.openVideoPlayers = window.openVideoPlayers || []).push({target: document.currentScript});`;
    
    // Create external script
    const externalScript = document.createElement('script');
    externalScript.async = true;
    externalScript.setAttribute('data-ezscrex', 'false');
    externalScript.setAttribute('data-cfasync', 'false');
    externalScript.src = "https://open.video/video.js";
    
    // Append to container
    containerRef.current.appendChild(inlineScript);
    containerRef.current.appendChild(externalScript);
    
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full aspect-video rounded-xl overflow-hidden bg-charcoal/5 flex items-center justify-center relative border border-charcoal/10"
    >
      {/* Fallback layout before video loads, or while in AI Studio preview */}
      <div className="absolute inset-0 flex items-center justify-center text-charcoal/20 z-[-1] !hidden">
        Video Player
      </div>
    </div>
  );
}
