import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Utensils, Zap, Play } from 'lucide-react';

export function GlobalHeader() {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Recovery', path: '/recovery', icon: Activity },
    { label: 'Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'Studio', path: '/studio', icon: Play },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-cream/90 backdrop-blur-xl border-b border-charcoal/5 hidden md:block">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
              <div className="w-8 h-8 bg-charcoal rounded-xl flex items-center justify-center transform group-hover:-rotate-12 transition-transform shadow-xl">
                <span className="text-cream font-black font-serif text-lg tracking-tighter">S</span>
              </div>
              <span className="font-serif font-black text-xl tracking-tight text-charcoal">
                Stretching<span className="text-gold">Pro</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive 
                        ? 'bg-gold/10 text-charcoal' 
                        : 'text-charcoal/60 hover:bg-charcoal/5 hover:text-charcoal'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-gold' : ''}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/studio"
              className="px-5 py-2.5 bg-charcoal text-cream text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gold transition-colors"
            >
              Start Session
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
