import { Youtube, Facebook, Accessibility } from 'lucide-react';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="py-20 px-6 border-t border-charcoal-muted w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col items-center md:items-start gap-6">
          <Logo size="sm" />
          <div className="flex items-center gap-4 text-charcoal/40">
            <a href="https://www.youtube.com/@StretchingProgram" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors" aria-label="YouTube">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/stretchingprogram/" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <button className="hover:text-gold transition-colors" aria-label="Accessibility">
              <Accessibility className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex flex-wrap justify-center md:justify-end gap-x-6 md:gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-charcoal/40">
            <a href="/" className="hover:text-gold transition-colors">Studio</a>
            <a href="/privacy-policy" className="hover:text-gold transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gold transition-colors">Terms</a>
            <a href="/contact" className="hover:text-gold transition-colors">Contact</a>
          </div>
          <p className="text-[10px] font-medium text-charcoal/30 uppercase tracking-[0.2em] text-center md:text-right">
            Stretching Pro • The Movement Operating System • © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
