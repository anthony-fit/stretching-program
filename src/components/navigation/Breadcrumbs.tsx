import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  'dashboard': 'Athlete Dashboard',
  'nutrition': 'Nutrition Center',
  'recovery': 'Recovery Hub',
  'calories-burned-calculator': 'Calories Burned Calculator',
  'macro-calculator': 'Macro Calculator',
  'athlete-readiness': 'Readiness Snapshot',
  'mobility-streak': 'Mobility Streak',
  'recovery-score-calculator': 'Recovery Score Calculator',
  'mobility-recovery': 'Mobility Recovery',
  'studio': 'Studio',
};

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-4 hidden md:flex items-center gap-2 text-xs font-medium text-charcoal/40">
      <Link to="/" className="hover:text-charcoal transition-colors flex items-center gap-1.5">
        <Home className="w-3.5 h-3.5" />
        Home
      </Link>
      
      {paths.map((path, index) => {
        const isLast = index === paths.length - 1;
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const label = ROUTE_LABELS[path] || path.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        return (
          <React.Fragment key={path}>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            {isLast ? (
              <span className="text-charcoal font-bold">{label}</span>
            ) : (
              <Link to={href} className="hover:text-charcoal transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
