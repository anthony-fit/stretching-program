import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const [showNav, setShowNav] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    setShowNav(false);
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-charcoal opacity-10 bg-cream opacity-95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" onClick={() => setShowNav(false)}>
            <Logo size="md" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-charcoal/70">
            <Link 
              to="/"
              className={cn("hover:text-gold transition-colors", location.pathname === '/' && "text-gold")}
            >
              Generator
            </Link>
            <Link 
              to="/stretch"
              className={cn("hover:text-gold transition-colors", (location.pathname.startsWith('/stretch') || location.pathname.startsWith('/exercise')) && "text-gold")}
            >
              Stretch
            </Link>
            <Link 
              to="/stretching-routine"
              className={cn("hover:text-gold transition-colors", location.pathname.startsWith('/stretching-routine') && "text-gold")}
            >
              Routine
            </Link>
            <Link 
              to="/workouts"
              className={cn("hover:text-gold transition-colors", location.pathname === '/workouts' && "text-gold")}
            >
              Workouts
            </Link>
            <Link 
              to="/method"
              className={cn("hover:text-gold transition-colors", location.pathname === '/method' && "text-gold")}
            >
              Method
            </Link>
            <Link 
              to="/"
              className="px-6 py-2 bg-charcoal text-cream rounded-full hover:bg-gold transition-all duration-300"
            >
              Get Started
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setShowNav(!showNav)}>
            {showNav ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {showNav && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-cream pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-serif">
              <button 
                onClick={() => handleNav('/')}
                className={cn("text-left hover:text-gold transition-colors", location.pathname === '/' && "text-gold")}
              >
                Generator
              </button>
              <button 
                onClick={() => handleNav('/stretch')}
                className={cn("text-left block hover:text-gold transition-colors", (location.pathname.startsWith('/stretch') || location.pathname.startsWith('/exercise')) && "text-gold")}
              >
                Stretch
              </button>
              <button 
                onClick={() => handleNav('/stretching-routine')}
                className={cn("text-left block hover:text-gold transition-colors", location.pathname.startsWith('/stretching-routine') && "text-gold")}
              >
                Routine
              </button>
              <button 
                onClick={() => handleNav('/workouts')}
                className={cn("text-left block hover:text-gold transition-colors", location.pathname === '/workouts' && "text-gold")}
              >
                Workouts
              </button>
              <button 
                onClick={() => handleNav('/method')}
                className={cn("text-left hover:text-gold transition-colors", location.pathname === '/method' && "text-gold")}
              >
                Method
              </button>
              <div className="h-px bg-charcoal/10 my-4" />
              <button 
                onClick={() => handleNav('/how-to-stretch')}
                className="text-left block text-sm font-bold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
              >
                How to Stretch
              </button>
              <button 
                onClick={() => handleNav('/privacy-policy')}
                className="text-left block text-sm font-bold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleNav('/terms')}
                className="text-left block text-sm font-bold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleNav('/contact')}
                className="text-left block text-sm font-bold uppercase tracking-widest text-charcoal/40 hover:text-gold transition-colors"
              >
                Contact
              </button>
              <button 
                onClick={() => handleNav('/')}
                className="w-full py-4 bg-charcoal text-cream rounded-xl mt-4"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
