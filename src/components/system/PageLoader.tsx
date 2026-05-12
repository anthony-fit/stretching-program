import React from "react";

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-charcoal/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-charcoal rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-sans text-charcoal/60 uppercase tracking-widest animate-pulse">
          Loading Data...
        </p>
      </div>
    </div>
  );
}
