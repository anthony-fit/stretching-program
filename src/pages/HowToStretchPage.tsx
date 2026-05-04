import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  Wind, 
  ShieldCheck, 
  HelpCircle, 
  Activity, 
  ArrowRight,
  Info,
  ChevronRight,
  Zap,
  Target,
  Dna,
  RefreshCw
} from 'lucide-react';

interface Muscle {
  id: number;
  name: string;
  name_en: string;
  is_front: boolean;
  image_url_main: string;
}

const FALLBACK_MUSCLES: Muscle[] = [
  { id: 1, name: "Biceps brachii", name_en: "Biceps", is_front: true, image_url_main: "" },
  { id: 2, name: "Anterior deltoid", name_en: "Shoulders", is_front: true, image_url_main: "" },
  { id: 4, name: "Pectoralis major", name_en: "Chest", is_front: true, image_url_main: "" },
  { id: 10, name: "Quadriceps femoris", name_en: "Quads", is_front: true, image_url_main: "" },
  { id: 11, name: "Biceps femoris", name_en: "Hamstrings", is_front: false, image_url_main: "" },
  { id: 7, name: "Gastrocnemius", name_en: "Calves", is_front: false, image_url_main: "" },
  { id: 12, name: "Gluteus maximus", name_en: "Glutes", is_front: false, image_url_main: "" },
  { id: 9, name: "Trapezius", name_en: "Upper Back", is_front: false, image_url_main: "" }
];

function BiologicalAtlas() {
  const [muscles, setMuscles] = useState<Muscle[]>(FALLBACK_MUSCLES);
  const [isSynced, setIsSynced] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMuscles() {
      try {
        const res = await fetch('https://wger.de/api/v2/muscle/?language=2');
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const results = data.results.slice(0, 8);
          setMuscles(results);
          setIsSynced(true);
        }
      } catch (err) {
        console.error("Failed to fetch biological atlas, using protocol fallback:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMuscles();
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-4xl font-serif italic text-charcoal">Biological Atlas</h3>
          <p className="text-charcoal/40 text-sm font-light uppercase tracking-[0.3em]">Clinically Catalogued Groups</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${isSynced ? 'text-[#ff00e5] bg-[#ff00e5]/5 border-[#ff00e5]/20' : 'text-charcoal/40 bg-charcoal/5 border-charcoal/10'}`}>
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>{isSynced ? 'Live Protocol Sync' : 'Local Protocol Active'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {muscles.map((muscle, idx) => (
          <motion.div
            key={muscle.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="group relative p-8 bg-white rounded-[2.5rem] border border-charcoal/5 hover:border-[#ff00e5]/30 transition-all duration-500 hover:shadow-2xl hover:shadow-charcoal/5"
          >
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dna className="w-4 h-4 text-[#ff00e5]/40" />
            </div>
            
            <div className="w-full aspect-[3/4] relative mb-8 flex items-center justify-center bg-charcoal/[0.03] rounded-3xl overflow-hidden group-hover:bg-[#ff00e5]/5 transition-colors">
              {/* Anatomical Silhouette Background */}
              <img 
                src={`https://wger.de/static/images/muscles/muscles_${muscle.is_front ? 'front' : 'back'}.svg`}
                className="absolute inset-0 w-full h-full object-contain p-4 opacity-5 grayscale group-hover:opacity-10 transition-opacity"
                alt=""
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
                referrerPolicy="no-referrer"
              />
              
              {/* Muscle Highlight Overlay with Pulse */}
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <motion.img 
                  animate={{ 
                    opacity: [0.4, 0.9, 0.4],
                    scale: [0.98, 1.02, 0.98]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: idx * 0.2
                  }}
                  src={`https://wger.de/static/images/muscles/main/muscle-${muscle.id}.svg`} 
                  alt={`${muscle.name_en} highlight`}
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-700"
                  onError={(e) => {
                    // Failover to encoded CSS icon if SVG is missing
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-12 h-12 text-[#ff00e5]/20 animate-pulse"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M2.5 13.5a5 5 0 0 1 5-5h.5l3-3a1 1 0 0 1 1.414 0l3 3h.5a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5H7.5a5 5 0 0 1-5-5z"/></svg></div>`;
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#ff00e5]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-serif italic text-charcoal group-hover:text-[#ff00e5] transition-colors leading-tight">
                  {muscle.name_en || muscle.name}
                </h4>
                <span className="text-[8px] font-mono text-charcoal/20 group-hover:text-[#ff00e5]/30">ID_{muscle.id.toString().padStart(3, '0')}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/30">
                {muscle.is_front ? 'Anterior' : 'Posterior'} Chain Segment
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t border-charcoal/5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-charcoal/[0.03] p-2 rounded-lg">
                  <p className="text-[8px] uppercase tracking-tighter text-charcoal/40 mb-1">Tissue Loading</p>
                  <p className="text-[10px] font-bold text-charcoal/60">Optimal</p>
                </div>
                <div className="bg-charcoal/[0.03] p-2 rounded-lg">
                  <p className="text-[8px] uppercase tracking-tighter text-charcoal/40 mb-1">Fiber Type</p>
                  <p className="text-[10px] font-bold text-charcoal/60">Mixed</p>
                </div>
              </div>
              <p className="text-[9px] text-charcoal/40 leading-tight italic">
                Advanced protocol focused on controlled fiber extension.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function HowToStretchPage() {
  const guidelines = [
    {
      icon: <Activity className="w-6 h-6 text-[#ff00e5]" />,
      title: "Warm Up First",
      text: "Never stretch cold muscles. Do 5-10 minutes of light cardio, such as brisk walking, to increase blood flow and muscle temperature before starting the protocol.",
      detail: "Cold muscles are like rubber bands in the freezer—they're brittle and prone to snapping. Warming up re-hydrates the tissue."
    },
    {
      icon: <Clock className="w-6 h-6 text-[#ff00e5]" />,
      title: "Hold, Don't Bounce",
      text: "Avoid ballistic stretching (bouncing), which can cause micro-tears. Instead, hold a static stretch for 30 to 60 seconds for optimal fiber lengthening.",
      detail: "Bouncing triggers the 'stretch reflex', a survival mechanism that actually makes muscles tighten up to protect the joint."
    },
    {
      icon: <Wind className="w-6 h-6 text-[#ff00e5]" />,
      title: "Breathe Deeply",
      text: "Never hold your breath. Inhale deeply before the stretch, and exhale slowly as you settle into the pose to signal your nervous system to relax.",
      detail: "Deep breathing activates the parasympathetic nervous system, effectively 'turning off' the tension response in your brain."
    }
  ];

  const faqs = [
    {
      q: "How often should I stretch?",
      a: "For lasting flexibility, consistency beats intensity. Aim for 5-10 minutes daily or at least 3-5 times per week to maintain joint health."
    },
    {
      q: "Should stretching hurt?",
      a: "No. You should feel a mild pulling sensation (3-4 out of 10 on a pain scale). If you feel sharp or stabbing pain, stop immediately."
    },
    {
      q: "When is the best time to stretch?",
      a: "Post-workout is ideal as muscles are warm. However, a gentle evening routine can improve sleep quality and lower cortisol levels."
    }
  ];

  return (
    <div className="min-h-screen bg-cream text-charcoal font-sans selection:bg-[#ff00e5]/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff00e5]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-charcoal/5 rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal text-cream text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-[#ff00e5]" />
              <span>Clinical Mobility Standards</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-medium leading-[0.9] tracking-tight text-charcoal italic">
              How to Stretch <br /><span className="text-charcoal/20">Properly.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl md:text-2xl text-charcoal/60 leading-relaxed font-light italic">
              Advanced biomechanical guidelines to unlock elite flexibility without the risk of tissue damage.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Guidelines */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guidelines.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-12 bg-white rounded-[3rem] border border-charcoal/5 shadow-2xl shadow-charcoal/5 space-y-8 group hover:border-[#ff00e5]/30 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-charcoal/5 flex items-center justify-center group-hover:bg-[#ff00e5]/10 transition-colors">
                {item.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-serif italic text-charcoal">{item.title}</h3>
                <p className="text-charcoal/60 leading-relaxed font-light text-lg">
                  {item.text}
                </p>
                <div className="pt-6 border-t border-charcoal/5">
                  <p className="text-xs text-charcoal/40 italic flex items-start gap-2">
                    <Info className="w-4 h-4 shrink-0 text-[#ff00e5]" />
                    {item.detail}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Biological Atlas Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 mb-12 bg-charcoal/[0.02] rounded-[4rem]">
        <BiologicalAtlas />
      </section>

      {/* Anatomical Safety Matrix */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-charcoal rounded-[4rem] p-12 md:p-24 text-cream relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-[#ff00e5]/5 -z-0 blur-[120px] transform translate-x-1/2 group-hover:translate-x-0 transition-transform duration-1000" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-7xl font-serif italic leading-[0.9]">Safety <br /><span className="text-cream/30">Matrix</span></h2>
                <p className="text-cream/60 text-xl leading-relaxed font-light max-w-sm">
                  Biological protocols built on clinical data to ensure your joints remain resilient during deep tension work.
                </p>
              </div>
              
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#ff00e5]/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#ff00e5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-serif italic">The 3/10 Threshold</h4>
                    <p className="text-cream/40 font-light text-base">Always aim for a 'discomfort' level of 3 or 4 out of 10. Anything more causes the muscle to contract in defense.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-full bg-[#ff00e5]/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-[#ff00e5]" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-serif italic">Neurological Reset</h4>
                    <p className="text-cream/40 font-light text-base">Wait 48 hours between deep intense flexibility sessions to allow the nervous system to adapt to new lengths.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 space-y-8">
              <h3 className="text-2xl font-serif italic text-white mb-6">Execution Check</h3>
              <ul className="space-y-6">
                {[
                  "Shoulders down and away from ears",
                  "Lower back remains flat or neutral",
                  "No tingling or numbness in limbs",
                  "Steady diaphragmatic breathing",
                  "Core gently engaged for stability"
                ].map((check, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full border border-[#ff00e5]/40 flex items-center justify-center group-hover:bg-[#ff00e5] transition-all">
                      <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                    </div>
                    <span className="text-cream/80 text-sm font-light">{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ System */}
      <section className="max-w-4xl mx-auto px-6 py-32">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif font-medium text-charcoal italic">Clinical FAQ</h2>
          <div className="w-24 h-1 bg-[#ff00e5]/20 mx-auto rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#ff00e5]" />
          </div>
        </div>

        <div className="space-y-12">
          {faqs.map((faq, i) => (
            <div key={i} className="group border-b border-charcoal/5 pb-12 hover:border-[#ff00e5]/30 transition-colors">
              <h3 className="text-2xl font-serif italic text-charcoal mb-4 flex items-center gap-4">
                <span className="text-[#ff00e5] font-black text-xs uppercase tracking-widest bg-[#ff00e5]/10 px-3 py-1 rounded-lg">Q</span>
                {faq.q}
              </h3>
              <p className="text-lg text-charcoal/50 leading-relaxed font-light pl-14">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Resource Navigation */}
      <section className="max-w-5xl mx-auto px-6 pb-40">
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl shadow-charcoal/5 border border-charcoal/5 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left group">
          <div className="space-y-4">
            <h2 className="text-4xl font-serif italic text-charcoal">Ready to Implement?</h2>
            <p className="text-charcoal/50 text-lg font-light">Apply these guidelines to our verified exercise protocols.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <a 
              href="/exercise" 
              className="px-10 py-5 bg-charcoal text-cream rounded-[2rem] font-serif text-xl flex items-center gap-3 hover:bg-[#ff00e5] transition-all duration-500 shadow-xl"
            >
              Exercise Library
              <ArrowRight className="w-5 h-5" />
            </a>
            <a 
              href="/stretching-routine/morning" 
              className="px-10 py-5 border-2 border-charcoal/10 text-charcoal rounded-[2rem] font-serif text-xl flex items-center gap-3 hover:border-[#ff00e5] hover:text-[#ff00e5] transition-all duration-500"
            >
              Morning Protocol
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
