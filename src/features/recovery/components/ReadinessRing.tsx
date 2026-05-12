import React from 'react';
import { motion } from 'motion/react';

interface ReadinessRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ReadinessRing({ score, size = 160, strokeWidth = 12 }: ReadinessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score > 80) return '#EAB308'; // gold
    if (score > 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
          className="filter drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-serif italic text-cream font-bold">{score}%</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-cream/40">Readiness</span>
      </div>
    </div>
  );
}
