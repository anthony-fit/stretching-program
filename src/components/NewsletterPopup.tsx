import { useEffect, useRef } from 'react';

export function NewsletterPopup() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load once
    if (!containerRef.current || containerRef.current.dataset.loaded === 'true') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = "https://eomail1.com/form/3caa190c-d1b9-11ee-a132-27f569b7bf0e.js";
    script.setAttribute('data-form', '3caa190c-d1b9-11ee-a132-27f569b7bf0e');
    
    containerRef.current.appendChild(script);
    containerRef.current.dataset.loaded = 'true';
  }, []);

  return <div ref={containerRef} id="newsletter-form-container" />;
}
