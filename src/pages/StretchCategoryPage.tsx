import React, { useEffect } from 'react';
import { VERIFIED_EXERCISES } from '../constants/exercises';
import { slugify } from '../utils/slugify';
import { ArrowLeft } from 'lucide-react';
import { buildFAQs } from '../utils/faqBuilder';
import Breadcrumbs from '../components/Breadcrumbs';
import { PRESET_ROUTINES } from '../constants/presetRoutines';

export default function StretchCategoryPage() {
  const exercises = Object.values(VERIFIED_EXERCISES);
  const faqs = buildFAQs("stretching");

  const getDailyPreset = () => {
    const day = new Date().getDay();

    const presets = [
      "morning",     // Sunday
      "beginner",    // Monday
      "back-pain",   // Tuesday
      "morning",
      "beginner",
      "back-pain",
      "morning"
    ];

    return presets[day];
  };

  const todayPreset = getDailyPreset();

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Stretching", url: "/stretch" }
  ];

  useEffect(() => {
    document.title = "Best Stretching Exercise For Grow Young Fitness – Stretching Program";
    
    // Add or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Explore the Best Stretching Exercise For Grow Young Fitness. Our complete library offers guided stretches for flexibility, mobility, and anti-aging recovery.');

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify([{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": f.a
        }
      }))
    }, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `https://www.stretchingprogram.com${item.url}`
      }))
    }]);
    document.head.appendChild(script);

    console.log("STRETCH PAGE SEO ACTIVE - Best Stretching Exercise For Grow Young Fitness");
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const allExercises = exercises;
  
  const getExercisesByKeyword = (keyword: string) => {
    return exercises.filter(
        ex => 
          ex.name.toLowerCase().includes(keyword.toLowerCase()) || 
          ex.description.toLowerCase().includes(keyword.toLowerCase()) || 
          ex.targetArea.toLowerCase().includes(keyword.toLowerCase())
      );
  };

  const hamstringExercises = getExercisesByKeyword('hamstring');
  const neckExercises = getExercisesByKeyword('neck');
  const hipExercises = getExercisesByKeyword('hip');
  const backExercises = getExercisesByKeyword('back');

  const renderExerciseLink = (exercise: typeof exercises[0]) => {
    const slug = slugify(exercise.name);
    return (
      <a
        key={exercise.name}
        href={`/exercise/${slug}`}
        className="p-4 bg-white rounded-xl shadow-sm border border-charcoal/5 hover:border-gold/30 hover:shadow-md transition-all group block"
      >
        <h3 className="text-lg font-serif text-charcoal group-hover:text-gold transition-colors mb-1">
          How to do {exercise.name} Stretch
        </h3>
        <p className="text-sm text-charcoal/60 line-clamp-2 italic">
          {exercise.description.split('\n')[0]}
        </p>
      </a>
    );
  };

  return (
    <div className="pt-20 px-6 min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto py-12">
        <Breadcrumbs items={breadcrumbItems} />
        
        <a 
          href="/" 
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal/60 hover:text-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Stretching Program
        </a>
        
        <h1 className="text-4xl md:text-6xl font-serif text-charcoal mb-6 leading-tight">
          Best Stretching Exercise For <span className="italic text-gold">Grow Young Fitness</span>
        </h1>
        <p className="text-xl text-charcoal/80 mb-12 max-w-3xl leading-relaxed italic border-l-4 border-gold/20 pl-6">
          Maintaining mobility is the secret to longevity. Explore our complete stretching library to find the <strong className="text-charcoal font-bold">Best Stretching Exercise For Grow Young Fitness</strong>, focusing on functional flexibility and anti-aging movement protocols.
        </p>

        <section className="mb-16 p-8 bg-charcoal text-cream rounded-[2rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
              <span className="text-gold">★</span> Today’s Recommended Protocol
            </h2>
            <p className="text-cream/70 text-lg mb-6 italic">
              Your customized {todayPreset.replace("-", " ")} routine is optimized for current biological readiness.
            </p>
            <a
              href={`/stretching-routine/${todayPreset}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-charcoal rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold hover:text-white transition-all shadow-lg"
            >
              Begin Session Now
            </a>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-serif text-charcoal mb-8 border-b border-charcoal/10 pb-4 italic">
            Search our Complete Stretching Library
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {allExercises.map(renderExerciseLink)}
          </div>
        </section>

        <section className="mb-16 text-charcoal/80 space-y-10">
          <div className="bg-white p-10 rounded-[2rem] border border-charcoal/5 shadow-sm">
            <h2 className="text-3xl font-serif text-charcoal mb-6 italic">How to Stretch Properly for "Grow Young" Benefits</h2>
            <p className="leading-relaxed text-lg font-light">
              For those focusing on <strong className="text-charcoal font-bold">Grow Young Fitness</strong>, stretching is not just about reach; it's about neurological resetting. Perform every move with a long, slow exhale. Avoid bouncing (ballistic stretching) which can trigger the stretch reflex and cause tightness. <a href="/how-to-stretch" className="text-gold font-medium hover:underline">Learn more in our full guide on how to stretch properly.</a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-serif text-charcoal mb-4">Core Benefits of Regular Protocols</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span className="font-light"><strong>Elastic Longevity:</strong> Maintains connective tissue hydration.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span className="font-light"><strong>Postural Reset:</strong> Counteracts the rounding effects of modern desk work.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span className="font-light"><strong>Stress Drainage:</strong> Lowers cortisol through deep diaphragmatic breathing.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gold/5 p-8 rounded-2xl border border-gold/10">
              <h2 className="text-2xl font-serif text-charcoal mb-4">Pro-Tip for Beginners</h2>
              <p className="leading-relaxed italic font-light">
                "Hold every stretch for exactly 30 seconds. This is the physiological threshold where the muscle spindles truly begin to lengthen, according to recent clinical sports science."
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-serif text-charcoal italic">Stretching by Targeted Need</h2>
            <span className="px-4 py-1 bg-charcoal/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Filtered Protocol</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a href="/exercise/hamstring-stretch" className="p-4 bg-white border border-charcoal/5 rounded-xl text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium text-center">Tight Hamstring Protocol</a>
            <a href="/exercise/cat-cow-stretch" className="p-4 bg-white border border-charcoal/5 rounded-xl text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium text-center">Spinal Pain Relief</a>
            <a href="/exercise/gentle-neck-release" className="p-4 bg-white border border-charcoal/5 rounded-xl text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium text-center">Morning Neck Release</a>
            <a href="/exercise/childs-pose" className="p-4 bg-white border border-charcoal/5 rounded-xl text-gold hover:bg-gold hover:text-white transition-all text-sm font-medium text-center">Entry-Level Restorative</a>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-serif text-charcoal mb-8 italic">Curated Stretching Routines</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {Object.keys(PRESET_ROUTINES).map((key) => (
              <a
                key={key}
                href={`/stretching-routine/${key}`}
                className="group p-8 bg-white rounded-[2rem] border border-charcoal/5 shadow-sm hover:border-gold/30 hover:shadow-xl transition-all block"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                  <span className="text-xs font-bold uppercase">Go</span>
                </div>
                <h3 className="text-xl font-serif text-charcoal capitalize mb-2">
                  {key.replace("-", " ")} Routine
                </h3>
                <p className="text-sm text-charcoal/50 leading-relaxed font-light italic">
                  Guided clinical protocol with timer.
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-serif text-charcoal mb-8 border-b border-charcoal/10 pb-4 italic">Muscle-Specific Guidance</h2>
          <div className="space-y-12">
            <div>
              <h3 className="text-xl font-bold text-charcoal/80 mb-6 uppercase tracking-[0.3em] text-xs">Posterior Chain: Hamstrings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {hamstringExercises.map(renderExerciseLink)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-charcoal/80 mb-6 uppercase tracking-[0.3em] text-xs">Cervical Spine: Neck & Shoulders</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {neckExercises.map(renderExerciseLink)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-charcoal/80 mb-6 uppercase tracking-[0.3em] text-xs">Pelvic Engine: Hips & Glutes</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {hipExercises.map(renderExerciseLink)}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-charcoal/80 mb-6 uppercase tracking-[0.3em] text-xs">Spinal Column: Upper & Lower Back</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {backExercises.map(renderExerciseLink)}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="bg-charcoal text-cream p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="text-4xl font-serif mb-8 text-center italic relative z-10">Biological FAQ</h2>
            <div className="space-y-8 relative z-10 max-w-2xl mx-auto">
              {faqs.map((faq, i) => (
                <div key={i} className="group">
                  <h3 className="text-xl font-serif text-gold mb-3 group-hover:translate-x-1 transition-transform">{faq.q}</h3>
                  <p className="text-cream/60 leading-relaxed font-light italic">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-16 border-t border-charcoal/10">
          <h2 className="text-2xl font-serif text-charcoal mb-8 italic">Quick Navigation</h2>
          <div className="flex flex-wrap gap-8">
            <a href="/" className="group flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center group-hover:bg-gold transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:text-white" />
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-gold transition-colors">Generator Home</span>
            </a>
            <a href="/method" className="group flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center group-hover:bg-gold transition-colors">
                <span className="text-[10px] font-bold group-hover:text-white">M</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-gold transition-colors">The Methodology</span>
            </a>
            <a href="/how-to-stretch" className="group flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center group-hover:bg-gold transition-colors">
                <span className="text-[10px] font-bold group-hover:text-white">G</span>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-charcoal/60 group-hover:text-gold transition-colors">Stretching Guide</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
