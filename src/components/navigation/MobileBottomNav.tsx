import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, Activity, Utensils, Play } from 'lucide-react';

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home, exact: true },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Recovery', path: '/recovery', icon: Activity },
    { label: 'Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'Studio', path: '/studio', icon: Play },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full z-[100] pb-[env(safe-area-inset-bottom)] bg-cream/95 backdrop-blur-xl border-t border-charcoal/5 shadow-[0_-10px_40px_rgb(0,0,0,0.05)]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-16 h-12 relative ${
                isActive ? 'text-charcoal' : 'text-charcoal/40'
              }`}
            >
              {isActive && (
                <div className="absolute -top-3 w-10 h-1 bg-gold rounded-full" />
              )}
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-gold/10' : 'bg-transparent'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-gold fill-gold/20' : ''}`} />
              </div>
              <span className={`text-[9px] font-bold mt-1 tracking-wide ${isActive ? 'text-charcoal' : 'text-charcoal/40'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
