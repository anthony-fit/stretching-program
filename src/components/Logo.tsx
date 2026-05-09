import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  light?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className = '', iconOnly = false, light = false, size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeMap = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl'
  };

  const iconSize = sizeMap[size];
  const textSize = textSizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <svg 
        viewBox="0 0 120 120" 
        className={`${iconSize} drop-shadow-sm flex-shrink-0`}
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="120" rx="28" fill="#F4B942" />
        
        {/* Flowing stretch body figure */}
        {/* Core arch (back/spine reaching up) */}
        <path 
          d="M 35 85 Q 45 40 80 35" 
          stroke="#1F1E1D" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Head */}
        <circle cx="88" cy="26" r="9" fill="#1F1E1D" />
        {/* Extended leg */}
        <path 
          d="M 35 85 Q 70 85 88 68" 
          stroke="#1F1E1D" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Reaching arm */}
        <path 
          d="M 55 60 Q 75 50 90 60" 
          stroke="#1F1E1D" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
      
      {/* Text */}
      {!iconOnly && (
        <div className="flex flex-col -space-y-1">
          <span className={`font-serif italic font-bold tracking-tight ${textSize} ${light ? 'text-cream' : 'text-charcoal'}`}>
            Stretching Pro
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Studio</span>
        </div>
      )}
    </div>
  );
}
