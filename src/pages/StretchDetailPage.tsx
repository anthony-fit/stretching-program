import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { VERIFIED_EXERCISES } from '../constants/exercises';
import { slugify } from '../utils/slugify';
import { buildFAQs } from '../utils/faqBuilder';
import Breadcrumbs from '../components/Breadcrumbs';
import StretchAnimationPlayer from '../components/StretchAnimationPlayer';
import { getAnimationPath } from '../utils/getAnimationPath';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HelpCircle, Sparkles } from 'lucide-react';

export default function StretchDetailPage() {
  const { slug, modifier } = useParams();

  const exercise = Object.values(VERIFIED_EXERCISES).find(
    (ex) => slugify(ex.name) === slug
  );

  const faqs = exercise ? buildFAQs(exercise.name, modifier) : [];

  const breadcrumbItems = [
    { label: "Home", url: "/" },
    { label: "Stretching", url: "/stretch" },
    { label: exercise?.name || "Stretch", url: `/stretch/${slug}` }
  ];

  if (modifier) {
    breadcrumbItems.push({ label: modifier, url: `/stretch/${slug}/${modifier}` });
  }

  useEffect(() => {
    if (exercise) {
      document.title = modifier 
        ? `${exercise.name} Stretch for ${modifier} – How to Do It`
        : `${exercise.name} Stretch – How to Do It Properly`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute(
        'content',
        modifier 
          ? `Learn how to do the ${exercise.name} stretch for ${modifier} with proper technique and guidance.`
          : `Learn how to do the ${exercise.name} stretch with proper form, breathing, and technique.`
      );

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify([{
        '@context': 'https://schema.org',
        '@type': 'ExerciseAction',
        name: modifier ? `${exercise.name} stretch for ${modifier}` : `${exercise.name} stretch`,
      }, {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
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

      console.log('VARIATION PAGE:', slug, modifier);
      console.log('INTERNAL LINK BOOST ACTIVE');
      console.log('FAQ SYSTEM ACTIVE', faqs.length);
      console.log('BREADCRUMBS ACTIVE');
      console.log('ANIMATION PATH:', getAnimationPath(exercise.name));

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [exercise, modifier, slug]);

  if (!exercise) {
    return (
      <div className="min-h-screen bg-sand text-charcoal flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-serif mb-4">Stretch Not Found</h1>
        <a href="/stretch" className="text-gold hover:underline">
          View all stretching exercises
        </a>
      </div>
    );
  }

  const related = Object.values(VERIFIED_EXERCISES)
    .filter(e => slugify(e.name) !== slug)
    .slice(0, 2);

  const routine = [exercise, ...related];
  const routineSlugs = routine.map(e => slugify(e.name));
  const routineLink = `/stretching-routine?ex=${encodeURIComponent(routineSlugs.join(","))}`;

  console.log("ROUTINE LINK:", routineLink);

  const getDuration = (ex: any) => {
    if (!ex || !ex.duration) return 60;
    const str = String(ex.duration).toLowerCase();
    const match = str.match(/(\d+)/);
    if (!match) return 60;
    const val = parseInt(match[1], 10);
    return str.includes('min') ? val * 60 : val;
  };

  const totalTime = routine.reduce(
    (sum, ex) => sum + getDuration(ex),
    0
  );

  const minutes = Math.ceil(totalTime / 60);
  console.log("CTA MINUTES:", minutes);

  return (
    <div className="bg-sand text-charcoal font-sans">
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumbs items={breadcrumbItems} />
        <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12 border border-sage/10 relative overflow-hidden">
          <h1 className="text-4xl md:text-5xl font-serif text-charcoal mb-6 leading-tight">
            {modifier ? `${exercise.name} Stretch for ${modifier}` : `${exercise.name} Stretch`}
          </h1>

          <div className="mb-8">
            <a
              href={routineLink}
              className="inline-block mt-6 px-6 py-3 bg-gold text-white rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              Start a {minutes}-Minute {exercise.name} Routine
            </a>
            <p className="text-sm opacity-70 mt-2">
              Includes {routine.length} guided stretches with timer, animation, and voice guidance.
            </p>
            <p className="text-xs opacity-50 mt-1">
              Based on clinically supported stretching protocols.
            </p>
          </div>
          
          {exercise?.name && (
            <StretchAnimationPlayer exPath={getAnimationPath(exercise.name)} />
          )}

          <div className="prose prose-xl prose-slate max-w-none prose-headings:font-serif prose-headings:italic prose-headings:text-charcoal prose-p:text-charcoal/70 prose-p:leading-relaxed antialiased">
            <div className="bg-[#ff00e5]/5 border-l-4 border-[#ff00e5] p-6 rounded-r-2xl mb-12">
              <p className="font-serif italic text-xl mb-0 text-charcoal/90">
                {modifier 
                  ? `This guide focuses on the best way to perform the ${exercise.name} stretch for ${modifier}.`
                  : `Learn how to perform the ${exercise.name} stretch correctly with step-by-step guidance.`}
              </p>
            </div>

            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({children}) => <h2 className="text-3xl font-serif text-charcoal mb-6 mt-16 italic border-b border-charcoal/5 pb-2 flex items-center gap-3"><Sparkles className="w-6 h-6 text-[#ff00e5]" /> {children}</h2>,
                h3: ({children}) => <h3 className="text-2xl font-serif text-[#ff00e5] mb-4 mt-10 italic">{children}</h3>,
                ul: ({children}) => <ul className="space-y-4 mb-10 ml-2">{children}</ul>,
                li: ({children}) => (
                  <li className="flex items-start gap-4 text-charcoal/70 text-lg group list-none">
                    <div className="w-2 h-2 rounded-full border-2 border-[#ff00e5] mt-2.5 shrink-0 group-hover:bg-[#ff00e5] transition-colors" />
                    <span className="font-light">{children}</span>
                  </li>
                ),
                p: ({children}) => <p className="mb-8">{children}</p>
              }}
            >
              {exercise.description}
            </ReactMarkdown>

            <div className="mt-16 bg-charcoal text-cream p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
              <HelpCircle className="absolute bottom-6 right-6 w-12 h-12 text-white/5" />
              <h2 className="text-cream italic border-none mt-0 mb-4 flex items-center gap-3">Safety Protocol</h2>
              <p className="text-cream/80 text-lg italic mb-0 border-l-2 border-[#ff00e5]/50 pl-6">
                Maintain a comfortable position and focus on the area around your {exercise.targetArea.toLowerCase()}.
                Remember to prioritize your safety: {exercise.safetyTip}
              </p>
            </div>

            <h2 className="mt-12">Related Stretches</h2>
            <div className="flex flex-col gap-2 no-underline">
              {Object.values(VERIFIED_EXERCISES)
                .filter(ex => ex.name !== exercise.name)
                .slice(0, 3)
                .map((ex) => (
                  <a key={ex.name} href={`/stretch/${slugify(ex.name)}`} className="text-sage font-medium hover:underline">
                    {ex.name.toLowerCase()} stretch
                  </a>
                ))}
            </div>

            {modifier && (
              <>
                <h3 className="text-xl font-bold mt-8 mb-4">More ways to improve {modifier}</h3>
                <div className="flex flex-col gap-2">
                  <a href={`/stretch/${slug}/beginner`} className="text-sage font-medium hover:underline">beginner {exercise.name.toLowerCase()} stretch</a>
                  <a href={`/stretch/${slug}/flexibility`} className="text-sage font-medium hover:underline">{exercise.name.toLowerCase()} stretch for flexibility</a>
                </div>
              </>
            )}

            <h2 className="mt-12">Frequently Asked Questions</h2>
            {faqs.map((faq, i) => (
              <div key={i} className="mt-6">
                <h3 className="text-xl font-bold text-charcoal">{faq.q}</h3>
                <p className="mt-2">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 border-t border-sage/20 pt-8">
            <a 
              href="/stretch" 
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-sage text-sage font-medium rounded-full hover:bg-sage/5 transition-colors duration-200"
            >
              how to stretch properly
            </a>
            
            <a 
              href={`/exercise/${slugify(exercise.name)}`}
              className="inline-flex items-center justify-center px-6 py-3 bg-sage text-sand font-medium rounded-full shadow-md hover:bg-sage/90 transition-colors duration-200"
            >
              Watch exercise demonstration
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
