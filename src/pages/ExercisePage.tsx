import React, { useEffect, useState } from 'react';
import { Share2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateSEOContent } from '../utils/seoGenerator';
import { getVideoUrl, toEmbedUrl } from '../services/videoService';
import { deslugify, slugify } from '../utils/slugify';
import { VERIFIED_EXERCISES } from '../constants/exercises';
import Breadcrumbs from '../components/Breadcrumbs';
import { EzoicAd } from '../components/EzoicAd';

export function ExercisePage({ name: propName, onBack }: { name?: string; onBack?: () => void }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  let name = '';
  let matchedSlug = slug || '';
  if (slug) {
    const found = Object.values(VERIFIED_EXERCISES).find(ex => slugify(ex.name) === slug);
    if (found) {
      name = found.name;
    } else {
      // Fallback for old URL encoding
      name = decodeURIComponent(slug);
    }
  } else if (propName) {
    name = decodeURIComponent(propName);
    matchedSlug = slugify(name);
  }

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Stretching", url: "/stretch" },
    { label: name || "Exercise", url: `/exercise/${matchedSlug}` }
  ];

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('/');
  };

  const seo = React.useMemo(() => generateSEOContent(name), [name]);

  useEffect(() => {
    // Generate SEO
    document.title = seo.title;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', seo.description);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Exercise",
      "name": name,
      "description": seo.description,
    });
    document.head.appendChild(script);

    // Get video
    const csvUrl = getVideoUrl(name);
    if (csvUrl) {
      const embed = toEmbedUrl(csvUrl);
      if (embed && embed.includes('/embed/')) {
        setEmbedUrl(embed);
      }
    }

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      document.title = 'Stretching Program'; // reset title
      document.head.removeChild(script);
    };
  }, [name, seo]);

  return (
    <div className="pt-20 px-6 min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-12">
        <Breadcrumbs items={breadcrumbItems} />
        
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal/60 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-4xl md:text-6xl font-serif font-medium leading-tight mb-6 text-charcoal">
          {seo.h1}
        </h1>

        <div className="flex items-center gap-4 mb-12">
          <button className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream rounded-xl text-sm font-bold hover:bg-gold transition-colors">
            <Share2 className="w-4 h-4" /> Share Guide
          </button>
        </div>

        {embedUrl && (
          <div className="relative rounded-2xl overflow-hidden bg-charcoal aspect-[16/9] mb-12 border border-charcoal/10 shadow-2xl">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none text-charcoal/80 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-charcoal/5">
          <p className="text-xl font-light leading-relaxed mb-10 text-charcoal/90">{seo.content.intro}</p>

          <h2 className="text-2xl font-serif font-bold text-charcoal mt-8 mb-4 border-b border-charcoal/10 pb-4">Benefits</h2>
          <ul className="mb-6 text-lg font-light leading-relaxed list-disc pl-6 space-y-2">
            {seo.content.benefits.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-serif font-bold text-charcoal mt-8 mb-4 border-b border-charcoal/10 pb-4">How to Perform This Stretch</h2>
          <ol className="mb-6 text-lg font-light leading-relaxed list-decimal pl-6 space-y-2">
            {seo.content.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>

          {/* Ad Placement: After first section, away from Title/Intro */}
          <div className="my-8 py-4 border-y border-charcoal/10">
            <EzoicAd id={104} className="min-h-[250px]" />
          </div>

          <h2 className="text-2xl font-serif font-bold text-charcoal mt-8 mb-4 border-b border-charcoal/10 pb-4">Common Mistakes</h2>
          <ul className="mb-6 text-lg font-light leading-relaxed text-red-800/80 list-disc pl-6 space-y-2">
            {seo.content.mistakes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="text-2xl font-serif font-bold text-charcoal mt-8 mb-4 border-b border-charcoal/10 pb-4">Safety Tips</h2>
          <ul className="mb-6 text-lg font-light leading-relaxed list-disc pl-6 space-y-2">
            {seo.content.safety.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-16 bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-charcoal/5">
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-6 border-b border-charcoal/10 pb-4">Related Stretches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(VERIFIED_EXERCISES)
              .filter(ex => ex.name !== name)
              .slice(0, 3)
              .map(ex => (
                <a 
                  key={ex.name} 
                  href={`/exercise/${slugify(ex.name)}`}
                  className="p-4 rounded-xl border border-charcoal/10 hover:border-gold hover:shadow-[0_10px_30px_rgba(197,160,89,0.1)] transition-all flex items-center justify-center min-h-[80px]"
                >
                  <p className="font-bold text-charcoal text-center">{ex.name}</p>
                </a>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a href="/stretch" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal/60 hover:text-gold transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> View All Stretching Exercises
          </a>
        </div>
      </div>
    </div>
  );
}
