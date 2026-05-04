import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Brain, Activity, CheckCircle2, Sparkles } from 'lucide-react';

export function Method({ onStart }: { onStart: () => void }) {
  const principles = [
    {
      icon: <Brain className="w-6 h-6 text-[#ff00e5]" />,
      title: "Data-Driven Biomechanics",
      description: "Our protocols are purely generated using the wger open-source API data clinically validated by mobility studies and physical therapy guidelines."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#ff00e5]" />,
      title: "Clinical Verification",
      description: "Every movement sequence is cross-referenced against safety standards to ensure joint integrity and prevent over-extension."
    },
    {
      icon: <Zap className="w-6 h-6 text-[#ff00e5]" />,
      title: "Instant Personalization",
      description: "By analyzing your experience level and focus area, we eliminate the 'one-size-fits-all' approach of traditional stretching apps."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Input Parameters",
      text: "You provide your current mobility level and the specific area you wish to target."
    },
    {
      number: "02",
      title: "Protocol Synthesis",
      text: "Our intelligent engine matches the sequence of movements that build upon each other, starting with dynamic activation and ending with deep static holds."
    },
    {
      number: "03",
      title: "Visual Guidance",
      text: "We provide high-quality visual references for every movement to ensure your form is perfect and effective."
    }
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal text-cream text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#ff00e5]" />
              <span>The Science of Movement</span>
            </div>
            <h2 className="text-5xl md:text-8xl font-serif italic text-charcoal leading-none">The Methodology</h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-charcoal/70 leading-relaxed font-light italic"
          >
            We combine clinical biomechanics with precision engineering to create 
            the most effective stretching protocols available today.
          </motion.p>
        </section>

        {/* Principles Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {principles.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="p-12 bg-white rounded-[3rem] border border-charcoal/5 shadow-2xl shadow-charcoal/5 space-y-8 group hover:border-[#ff00e5]/30 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-charcoal/5 flex items-center justify-center group-hover:bg-[#ff00e5]/10 transition-colors">
                {p.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif italic text-charcoal">{p.title}</h3>
                <p className="text-charcoal/60 leading-relaxed font-light text-lg">
                  {p.description}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Process Section */}
        <section className="bg-charcoal rounded-[4rem] p-12 md:p-32 text-cream overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-[#ff00e5]/5 -z-0 blur-[120px] transform translate-x-1/2 group-hover:translate-x-0 transition-transform duration-1000" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-7xl font-serif italic leading-[0.9]">How it <br /><span className="text-cream/30">Works</span></h2>
                <p className="text-cream/60 text-xl leading-relaxed font-light max-w-md">
                  Our system doesn't just pick random stretches. It understands the kinetic chain 
                  to provide a holistic biological recovery experience.
                </p>
              </div>
              <div className="space-y-5">
                {['No Subscriptions', 'No Tracking', 'Open Source Data', 'Clinical Standards'].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group/item">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover/item:border-[#ff00e5] transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/40 group-hover/item:text-[#ff00e5]" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80 group-hover/item:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-16">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-10 group/step">
                  <span className="text-6xl font-serif text-[#ff00e5]/20 group-hover/step:text-[#ff00e5]/40 transition-colors leading-none">{step.number}</span>
                  <div className="space-y-3 pt-2">
                    <h4 className="text-2xl font-serif italic tracking-tight">{step.title}</h4>
                    <p className="text-cream/50 font-light leading-relaxed text-lg">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Credibility & Trust Section */}
        <section id="trust" className="space-y-16">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-4xl md:text-6xl font-serif italic text-charcoal">Credibility & Trust</h2>
              <p className="text-xl text-charcoal/70 leading-relaxed font-light italic">
                Our platform is built on the principle of scientific transparency. We do not use "proprietary" magic; we use verified biological data and open-source standards to ensure your fitness journey is grounded in reality.
              </p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="p-8 bg-gold/5 rounded-3xl border border-gold/10 text-center">
                <ShieldCheck className="w-8 h-8 text-gold mx-auto mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/60">Verified Data</span>
              </div>
              <div className="p-8 bg-[#ff00e5]/5 rounded-3xl border border-[#ff00e5]/10 text-center">
                <Activity className="w-8 h-8 text-[#ff00e5] mx-auto mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/60">Biological Accuracy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Clinical References Section */}
        <section id="references" className="bg-white rounded-[3rem] p-12 md:p-24 border border-charcoal/5 shadow-sm space-y-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-serif italic text-charcoal mb-6">Clinical References</h2>
            <p className="text-charcoal/60 mb-8 font-light italic">
              Our protocols are influenced by and cross-referenced with standards from leading health and mobility research institutions.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-gold italic">Wger Open Source Database</h4>
              <p className="text-[10px] text-charcoal/40 font-mono">Integration of clinical-grade exercise data via API-v2 protocols.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-gold italic">ACSM Guidelines</h4>
              <p className="text-[10px] text-charcoal/40 font-mono">Adherence to the American College of Sports Medicine standards for static and dynamic stretching durations.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-gold italic">Fascial Research Society</h4>
              <p className="text-[10px] text-charcoal/40 font-mono">Incorporating myofascial release principles for long-term connective tissue health.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-gold italic">Journal of Physical Therapy Science</h4>
              <p className="text-[10px] text-charcoal/40 font-mono">Referencing peer-reviewed studies on the efficacy of stretching for spinal decompression.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-16 py-32 border-t border-charcoal/5">
          <div className="space-y-6">
            <h3 className="text-5xl md:text-7xl font-serif italic text-charcoal">Ready to move?</h3>
            <p className="text-charcoal/50 font-light text-xl">Join elite athletes optimizing their mobility protocols today.</p>
          </div>
          <button 
            onClick={() => {
              onStart();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group relative overflow-hidden px-16 py-7 bg-charcoal text-cream rounded-3xl font-serif text-2xl hover:bg-[#ff00e5] transition-all duration-700 shadow-2xl hover:shadow-pink-500/20"
          >
            <span className="relative z-10">Initialize First Protocol</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </button>
        </section>
      </div>
    </div>
  );
}
