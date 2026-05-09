import React, { useEffect } from 'react';

declare global {
  interface Window {
    ezstandalone: any;
  }
}

interface EzoicAdProps {
  id: number;
  className?: string;
}

/**
 * EzoicAd Component
 * 
 * Renders an Ezoic ad placeholder and registers it with the Ezoic standalone system.
 * Following Ezoic's best practices, it pushes the showAds call to the command queue.
 */
export const EzoicAd: React.FC<EzoicAdProps> = ({ id, className = "" }) => {
  useEffect(() => {
    // Check if ezstandalone is available (it should be loaded in index.html)
    if (window.ezstandalone) {
      try {
        window.ezstandalone.cmd.push(function () {
          // Define the placeholder and show the ad
          // Note: showAds() can take multiple IDs, but calling it per component 
          // is common in React to handle dynamic mounting.
          window.ezstandalone.showAds(id);
        });
      } catch (error) {
        console.warn(`Ezoic error for placeholder ${id}:`, error instanceof Error ? error.message : error);
      }
    }
  }, [id]);

  return (
    <div className={`ezoic-ad-wrapper ${className}`}>
      <div id={`ezoic-pub-ad-placeholder-${id}`}></div>
    </div>
  );
};
