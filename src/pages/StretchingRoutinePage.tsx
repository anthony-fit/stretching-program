import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Play, Clock, Target, ChevronRight, X, Loader2, Info, Menu, ArrowLeft, Volume2, Maximize, ChevronLeft, Pause, HelpCircle } from 'lucide-react';
import { getVideoUrl } from '../services/videoService';
import { videoDatabase } from '../constants/videoDatabase';
import { VERIFIED_EXERCISES } from '../constants/exercises';
import { Logo } from '../components/Logo';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import StretchAnimationPlayer from '../components/StretchAnimationPlayer';
import { getAnimationPath } from '../utils/getAnimationPath';
import { slugify } from '../utils/slugify';
import { useParams } from 'react-router-dom';
import { PRESET_ROUTINES } from '../constants/presetRoutines';
import { EzoicVideo } from '../components/EzoicVideo';

interface Exercise {
  id: string;
  name: string;
  category: string;
  duration: string;
  description: string;
  youtubeId?: string;
  instructions?: string;
  imageUrl?: string;
  slug?: string;
}

interface ExerciseCardProps {
  ex: Exercise;
  idx: number;
  onClick: () => void;
  key?: string | number;
}

function ExerciseCard({ ex, idx, onClick }: ExerciseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(idx, 8) * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white rounded-[2.5rem] p-10 border border-charcoal/5 hover:border-gold/30 hover:shadow-[0_40px_80px_rgba(197,160,89,0.08)] transition-all duration-700 cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-gold/[0.03] rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000 ease-out" />
      
      <div className="flex-1 space-y-8 relative z-10 flex flex-col">
        <div className="flex justify-between items-start">
          <span className="px-3 py-1 bg-gold/10 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] text-gold border border-gold/10">
            {ex.category}
          </span>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-charcoal/30">
            <Clock className="w-3.5 h-3.5 text-gold/40" /> {ex.duration}
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div className="rounded-2xl overflow-hidden bg-cream/50 p-2">
            <StretchAnimationPlayer exPath={getAnimationPath(ex.name)} exName={ex.name} isPlaying={isHovered} isPreparing={false} />
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-serif font-medium text-charcoal group-hover:text-gold transition-colors leading-tight">
              {ex.name}
            </h3>
            <p className="text-base text-charcoal/50 leading-relaxed line-clamp-2 font-light font-sans italic">
              {ex.description}
            </p>
          </div>
        </div>

        <div className="pt-8 flex items-center justify-between border-t border-charcoal/5 group-hover:border-gold/20 transition-colors">
          <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/80 group-hover:text-gold transition-colors">
            {ex.youtubeId ? <Play className="w-4 h-4 text-gold" /> : <Info className="w-4 h-4 text-gold" />} 
            {ex.youtubeId ? 'Watch Demo' : 'Details'}
          </button>
          <div className="w-10 h-10 rounded-full border border-charcoal/5 flex items-center justify-center group-hover:bg-gold group-hover:border-gold transition-all duration-500">
            <ChevronRight className="w-4 h-4 text-charcoal/20 group-hover:text-white transition-all" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getUniqueEffect(name: string, category: string, index: number): string {
  const templates = [
    `The ${name} primarily increases flexibility in the ${category.toLowerCase()}. Flexibility is commonly measured by the "range of motion" (ROM). While all types of stretching increase ROM, incorporating ${name} alongside static and PNF stretching is highly effective.`,
    `The ${name} is an excellent addition to a dynamic warm up routine for the ${category.toLowerCase()}. Several studies have shown short term gains in muscle strength, sprint time, and jump height following dynamic warm ups that include targeted movements like this.`,
    `Integrating the ${name} into your routine can help decrease injury risk in the ${category.toLowerCase()}. Dynamic stretching as part of a warm up has been verified to reduce risk in various athletes, making this protocol a valuable preventative measure.`,
    `For addressing ${category.toLowerCase()} stiffness, the ${name} provides excellent targeted relief. While delayed onset muscle soreness (DOMS) arises 48 hours post-workout, movements like the ${name} provide significant psychological and subjective value for recovery.`
  ];
  return templates[index % templates.length];
}

const SESSION_KEY = "active_stretch_session";
const STORAGE_KEY = "saved_stretch_routine";

export default function StretchingRoutinePage() {
  const { preset } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlayingRoutine, setIsPlayingRoutine] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepTime, setPrepTime] = useState(10);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      console.log("Saved routine found");
    }
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      setResumeData(JSON.parse(savedSession));
      console.log("SESSION SAVED / RESTORED");
    }
  }, []);

  const speak = (text: string) => {
    if (!voiceEnabled) return;
    console.log("VOICE TRIGGERED");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel(); // prevent overlap
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    document.title = "Stretching Routine: Complete Daily Protocols – Stretching Program";
    
    // Add or update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Follow a professional stretching routine optimized for flexibility, recovery, and daily movement. Start your guided stretch session with our clinical-grade protocol library.');

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify([{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Stretching Routine Generator",
      "description": "Professional stretching routine protocols for various fitness levels and focus areas.",
      "applicationCategory": "HealthApplication",
      "operatingSystem": "Web"
    }, {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": window.location.origin
      }, {
        "@type": "ListItem",
        "position": 2,
        "name": "Stretching Routine",
        "item": window.location.href
      }]
    }]);
    document.head.appendChild(script);

    console.log("ROUTINE PAGE SEO ACTIVE - Stretching Routine");
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    console.log("ROUTINE STEP:", currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    console.log("FULLSCREEN:", isFullscreen);
  }, [isFullscreen]);

  const allExercises = useMemo(() => {
    const exercises: Exercise[] = [];
    let idCounter = 1;

    Object.entries(videoDatabase).forEach(([key, url]) => {
      // Find matching verified exercise for rich data
      let richData = null;
      for (const exKey of Object.keys(VERIFIED_EXERCISES)) {
        if (exKey.toLowerCase() === key || VERIFIED_EXERCISES[exKey].name.toLowerCase() === key) {
          richData = VERIFIED_EXERCISES[exKey];
          break;
        }
      }

      let ytId = undefined;
      if (url) {
        const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) {
          ytId = match[1];
        }
      }

      const name = key.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const finalName = richData ? richData.name : name;

      exercises.push({
        id: `lib-${idCounter++}`,
        name: finalName,
        category: richData ? richData.targetArea : 'Flexibility',
        duration: '1-2 Minutes',
        description: richData ? richData.description : getUniqueEffect(finalName, richData ? richData.targetArea : 'Flexibility', idCounter),
        instructions: richData ? richData.safetyTip : 'Perform this stretch carefully. Do not push past the point of mild discomfort. Breathe evenly.',
        youtubeId: ytId || (richData ? richData.youtubeVideoId : undefined),
        imageUrl: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=80',
        slug: slugify(finalName)
      });
    });

    return exercises;
  }, []);

  const categories = ['All', ...new Set(allExercises.map(ex => ex.category))];

  const [customRoutine, setCustomRoutine] = useState<Exercise[] | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const exParam = params.get("ex");

    if (!exParam) return;

    const slugs = decodeURIComponent(exParam).split(",");
    console.log("SHARE SLUGS:", slugs);

    const matched = slugs
      .map(slug =>
        allExercises.find(e =>
          e.slug === slug || e.name.toLowerCase() === slug.toLowerCase()
        )
      )
      .filter((e): e is Exercise => Boolean(e));

    console.log("MATCHED:", matched);

    if (matched.length > 0) {
      setCustomRoutine(matched);
      setCurrentIndex(0);
      setIsPlayingRoutine(true);
    } else {
      console.warn("No matching exercises found");
    }
  }, [allExercises]);

  useEffect(() => {
    if (!preset) return;

    console.log("PRESET:", preset);

    const presetList = PRESET_ROUTINES[preset];

    if (!presetList) return;

    const matched = presetList
      .map(slug => allExercises.find(e => e.slug === slug || e.name.toLowerCase() === slug.toLowerCase()))
      .filter((e): e is Exercise => Boolean(e));

    if (matched.length > 0) {
      setCustomRoutine(matched);
      setCurrentIndex(0);
      setIsPlayingRoutine(true);
      document.title = `${preset} stretching routine`;
    }
  }, [preset, allExercises]);

  const computedFilteredExercises = allExercises.filter(ex => {
    const name = ex.name || '';
    const description = ex.description || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(query) || 
                         description.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredExercises = customRoutine || computedFilteredExercises;

  useEffect(() => {
    if (!isPlayingRoutine) return;

    const sessionData = {
      exercises: filteredExercises,
      currentIndex,
      timeLeft
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    console.log("SESSION SAVED / RESTORED");
  }, [currentIndex, timeLeft, isPlayingRoutine, filteredExercises]);

  const getDuration = (ex: Exercise) => {
    if (!ex || !ex.duration) return 60;
    const str = String(ex.duration).toLowerCase();
    const match = str.match(/(\d+)/);
    if (!match) return 60;
    const val = parseInt(match[1], 10);
    return str.includes('min') ? val * 60 : val;
  };

  useEffect(() => {
    if (!isPlayingRoutine) return;
    const currentEx = filteredExercises[currentIndex];
    setTimeLeft(currentEx ? getDuration(currentEx) : 60);

    const name = currentEx?.name;
    if (name) {
      speak(`Next: ${name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isPlayingRoutine, filteredExercises]);

  useEffect(() => {
    if (!isPlayingRoutine || isPaused) return;

    if (isPreparing) {
      if (prepTime === 1) {
        speak("Start!");
        setIsPreparing(false);
        setPrepTime(10); // Reset for next exercise
      } else {
        const interval = setInterval(() => {
          setPrepTime(p => p - 1);
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlayingRoutine, isPaused, isPreparing, prepTime]);

  useEffect(() => {
    if (!isPlayingRoutine || isPreparing || isPaused) return;

    if (timeLeft === 0) {
      setCurrentIndex((prev) => {
        if (prev + 1 >= filteredExercises.length) {
          setIsPlayingRoutine(false);
          setSessionCompleted(true);
          speak("Session complete. Great job");
          localStorage.removeItem(SESSION_KEY);
          return 0;
        }
        setIsPreparing(true);
        setPrepTime(10);
        return prev + 1;
      });
    } else if (filteredExercises[currentIndex] && timeLeft === Math.floor(getDuration(filteredExercises[currentIndex]) / 2)) {
      speak("Halfway there");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isPlayingRoutine, isPaused, isPreparing, filteredExercises.length, currentIndex]);

  useEffect(() => {
    console.log("DURATION:", filteredExercises[currentIndex], "TIMER:", timeLeft, "PAUSED:", isPaused);
  }, [timeLeft, isPaused, currentIndex, filteredExercises]);

  const totalTime = filteredExercises.reduce(
    (sum, ex) => sum + getDuration(ex),
    0
  );

  const progressPercent =
    ((currentIndex + 1) / filteredExercises.length) * 100;

  useEffect(() => {
    console.log("PROGRESS:", progressPercent);
  }, [progressPercent]);

  const saveRoutine = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filteredExercises)
    );
    alert("Routine saved!");
    console.log("ROUTINE SAVED:", filteredExercises);
  };

  const shareRoutine = () => {
    const slugs = filteredExercises.map(e => e.slug || e.name).join(",");
    const url = `${window.location.origin}/stretching-routine?ex=${encodeURIComponent(slugs)}`;
    
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  const [showNav, setShowNav] = useState(false);

  const startRoutine = () => {
    setIsPlayingRoutine(true);
    setCurrentIndex(0);
    setSessionCompleted(false);
    setIsPreparing(true);
    setPrepTime(10);
  };

  const [displayedCount, setDisplayedCount] = useState(9);

  const resetCount = () => setDisplayedCount(9);

  useEffect(() => {
    resetCount();
  }, [searchQuery, selectedCategory, customRoutine]);

  return (
    <div className="bg-cream selection:bg-gold pb-20">
      <main className="pt-20">
        <div className="py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:items-start justify-between gap-12 mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-6 lg:mt-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="text-gold font-bold uppercase tracking-[0.4em] text-[10px]">Clinical Mobility Library</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl xl:text-7xl font-serif text-charcoal leading-[1.1] tracking-tight mb-4">
              The Ultimate Stretching Routine for Flexibility, Recovery, and Daily Energy
            </h1>
            <p className="text-xl text-charcoal/60 max-w-xl font-light leading-relaxed italic border-l border-gold/20 pl-6">
              Access the definitive Stretching Routine protocols. Use our intelligent library to find the right movements for your specific biology, recovery needs, and performance goals.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <EzoicVideo />
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-end">
              <div className="relative flex-1 sm:w-64 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                <input 
                  type="text"
                  placeholder="Search protocols..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCustomRoutine(null);
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCustomRoutine(null);
                  }}
                  className="pl-11 pr-10 py-3 bg-white border border-charcoal/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 appearance-none cursor-pointer min-w-[140px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {resumeData && !isPlayingRoutine && (
          <div className="p-4 bg-amber-100/50 border border-gold/30 text-charcoal rounded-xl mb-8 flex items-center justify-between">
            <p className="text-sm font-medium">
              Resume your last stretching session?
            </p>

            <div className="flex items-center gap-4">
              <button
                className="px-4 py-2 bg-charcoal text-cream rounded-md text-sm hover:bg-gold transition-colors"
                onClick={() => {
                  setCustomRoutine(resumeData.exercises);
                  setCurrentIndex(resumeData.currentIndex);
                  setTimeLeft(resumeData.timeLeft);
                  setIsPlayingRoutine(true);
                  setResumeData(null);
                  console.log("SESSION SAVED / RESTORED");
                }}
              >
                Resume
              </button>

              <button 
                className="text-sm text-charcoal/60 hover:underline"
                onClick={() => {
                  setResumeData(null);
                  localStorage.removeItem(SESSION_KEY);
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-12">
          <button
            onClick={startRoutine}
            className="px-6 py-3 bg-charcoal text-cream rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold transition-colors inline-block"
          >
            Start Stretching Routine
          </button>

          <button onClick={saveRoutine} className="px-6 py-3 border border-charcoal text-charcoal rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-charcoal hover:text-cream transition-colors inline-block">
            Save
          </button>

          <button onClick={shareRoutine} className="px-6 py-3 border border-charcoal text-charcoal rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-charcoal hover:text-cream transition-colors inline-block">
            Share
          </button>

          {sessionCompleted && !isPlayingRoutine && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsPlayingRoutine(true);
                setSessionCompleted(false);
              }}
              className="px-6 py-3 bg-gold text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-gold/90 transition-colors inline-block"
            >
              Repeat Routine
            </button>
          )}
        </div>

        {isPlayingRoutine && filteredExercises[currentIndex] && (
          <div className="mb-10 w-full max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.06)] overflow-hidden border border-charcoal/5">
            {/* Header / Progress Bar */}
            <div className="px-10 pt-10 pb-4">
              <div className="flex gap-2 mb-10 overflow-hidden">
                {filteredExercises.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all duration-700 ease-[0.16,1,0.3,1]",
                      i < currentIndex ? "bg-[#ff00e5] shadow-[0_0_10px_rgba(255,0,229,0.3)]" : 
                      i === currentIndex ? "bg-charcoal/10 relative overflow-hidden" : "bg-charcoal/5"
                    )}
                  >
                {i === currentIndex && isPlayingRoutine && !isPaused && (
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: isPreparing ? "-100%" : "0%" }}
                        transition={{ 
                          duration: isPreparing ? 0 : getDuration(filteredExercises[currentIndex]), 
                          ease: "linear" 
                        }}
                        className="absolute inset-0 bg-[#ff00e5]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-2 lowercase italic">
                      {isPreparing ? "Ready to go!" : filteredExercises[currentIndex].name}
                    </h2>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30">
                         Exercise {currentIndex + 1} of {filteredExercises.length}
                       </p>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="w-12 h-12 rounded-2xl bg-cream/50 border border-charcoal/5 flex items-center justify-center text-charcoal/40 hover:text-[#ff00e5] transition-all hover:bg-white shadow-sm">
                      <Volume2 size={18} className={!voiceEnabled ? "opacity-30" : ""} />
                    </button>
                    <button onClick={() => setIsFullscreen(true)} className="w-12 h-12 rounded-2xl bg-cream/50 border border-charcoal/5 flex items-center justify-center text-charcoal/40 hover:text-[#ff00e5] transition-all hover:bg-white shadow-sm">
                      <Maximize size={18} />
                    </button>
                 </div>
              </div>
            </div>

            {/* Animation Core */}
            <div className="px-10 pb-4">
              <StretchAnimationPlayer
                exPath={getAnimationPath(filteredExercises[currentIndex].name)}
                exName={filteredExercises[currentIndex].name}
                isPlaying={!isPaused && !isPreparing}
                isPreparing={isPreparing}
              />
            </div>

            {/* Timer / Controls Bar (Purple Themed) */}
            <div className="p-2">
              <div className="bg-white rounded-[2rem] p-8 border border-charcoal/5 shadow-inner">
                {isPreparing ? (
                   <div className="flex flex-col items-center py-4">
                     <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle 
                            cx="80" cy="80" r="74" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="12" 
                            className="text-charcoal/[0.03]"
                          />
                          <motion.circle 
                            cx="80" cy="80" r="74" 
                            fill="none" 
                            stroke="#ff00e5" 
                            strokeWidth="12" 
                            strokeLinecap="round"
                            strokeDasharray="465"
                            strokeDashoffset={465 - (465 * prepTime) / 10}
                            transition={{ duration: 1, ease: "linear" }}
                          />
                        </svg>
                        <span className="text-7xl font-serif text-charcoal leading-none">{prepTime}</span>
                     </div>
                     <span className="text-[12px] font-black uppercase tracking-[0.4em] text-[#ff00e5] animate-pulse">Preparation</span>
                   </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 mb-10">
                    <div className="flex items-baseline gap-3">
                      <span className="text-8xl md:text-9xl font-serif text-charcoal tracking-tighter">
                        {Math.floor(timeLeft / 60) > 0 ? `${Math.floor(timeLeft / 60)}:` : ''}
                        {String(timeLeft % 60).padStart(2, '0')}
                      </span>
                      <span className="text-2xl font-serif italic text-[#ff00e5]">/ {getDuration(filteredExercises[currentIndex])}"</span>
                    </div>
                    <div className="w-12 h-1 bg-[#ff00e5]/20 rounded-full" />
                  </div>
                )}

                {/* Refined Control Bar */}
                <div className="flex items-center justify-between bg-cream/50 rounded-3xl p-3 border border-charcoal/5">
                  <button 
                    onClick={() => { if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); setIsPreparing(true); setPrepTime(10); } }}
                    className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-charcoal/20 hover:text-charcoal transition-all",
                        currentIndex === 0 && "opacity-10 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button 
                    onClick={() => setIsPaused((p) => !p)}
                    className="flex-1 h-16 bg-[#ff00e5] rounded-2xl flex items-center justify-center text-white hover:bg-[#7000ff] transition-all duration-500 shadow-[0_10px_20px_rgba(255,0,229,0.2)] mx-4 group"
                  >
                    {isPaused ? <Play size={28} className="fill-current ml-1" /> : <Pause size={28} className="fill-current" />}
                    <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em]">{isPaused ? 'Resume' : 'Pause'} Protocol</span>
                  </button>

                  <button 
                    onClick={() => {
                        if (currentIndex < filteredExercises.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                            setIsPreparing(true);
                            setPrepTime(10);
                        } else {
                            setIsPlayingRoutine(false);
                            setSessionCompleted(true);
                            localStorage.removeItem(SESSION_KEY);
                        }
                    }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-charcoal/20 hover:text-charcoal transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFullscreen && isPlayingRoutine && filteredExercises[currentIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-between p-10 select-none"
          >
            {/* Fullscreen Header */}
            <div className="w-full max-w-4xl flex items-center justify-between">
                <button onClick={() => setIsFullscreen(false)} className="w-12 h-12 rounded-full border border-charcoal/5 flex items-center justify-center text-charcoal/40 hover:bg-charcoal/5 transition-all">
                    <X size={20} />
                </button>
                
                <div className="flex gap-2">
                   {filteredExercises.map((_, i) => (
                      <div key={i} className={cn("w-2 h-2 rounded-full", i <= currentIndex ? "bg-gold" : "bg-charcoal/5")} />
                   ))}
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="w-12 h-12 rounded-full border border-charcoal/5 flex items-center justify-center text-charcoal/40 hover:text-gold transition-colors">
                        <Volume2 size={20} className={!voiceEnabled ? "opacity-30" : ""} />
                    </button>
                </div>
            </div>

            <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center gap-8">
                <div className="text-center">
                    <h2 className="text-7xl font-serif text-charcoal mb-4 lowercase italic tracking-tighter">
                         {isPreparing ? "Ready to go!" : filteredExercises[currentIndex].name}
                    </h2>
                    {!isPreparing && (
                         <div className="flex items-center justify-center gap-4">
                            <div className="w-8 h-px bg-[#ff00e5]/30" />
                            <span className="text-[12px] font-black uppercase tracking-[0.5em] text-[#ff00e5]">Verified Protocol</span>
                            <div className="w-8 h-px bg-[#ff00e5]/30" />
                         </div>
                    )}
                </div>

                <div className="w-full relative px-10">
                    <StretchAnimationPlayer
                        exPath={getAnimationPath(filteredExercises[currentIndex].name)}
                        exName={filteredExercises[currentIndex].name}
                        isPlaying={!isPaused && !isPreparing}
                        isPreparing={isPreparing}
                    />
                </div>

                {isPreparing ? (
                    <div className="flex flex-col items-center gap-8">
                        <div className="relative w-64 h-64 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeWidth="16" className="text-charcoal/[0.03]" />
                              <motion.circle 
                                cx="128" cy="128" r="120" 
                                fill="none" stroke="#ff00e5" 
                                strokeWidth="16" 
                                strokeLinecap="round"
                                strokeDasharray="754"
                                strokeDashoffset={754 - (754 * prepTime) / 10}
                                transition={{ duration: 1, ease: "linear" }}
                              />
                            </svg>
                            <div className="text-[120px] font-serif text-charcoal leading-none">
                                {prepTime}
                            </div>
                        </div>
                        <span className="text-[16px] font-black uppercase tracking-[0.6em] text-[#ff00e5] animate-pulse">Preparation Phase</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-baseline gap-4">
                          <div className="text-[140px] md:text-[180px] font-serif text-charcoal leading-none tracking-tighter">
                              {Math.floor(timeLeft / 60) > 0 ? `${Math.floor(timeLeft / 60)}:` : ''}
                              {String(timeLeft % 60).padStart(2, '0')}
                          </div>
                          <span className="text-4xl font-serif italic text-[#ff00e5]">/ {getDuration(filteredExercises[currentIndex])}"</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Immersive Bottom Controls */}
            <div className="w-full max-w-xl pb-16">
              <div className="bg-cream/50 rounded-[3rem] p-4 flex items-center justify-between border border-charcoal/5 shadow-2xl">
                  <button 
                      onClick={() => { if(currentIndex > 0) { setCurrentIndex(currentIndex - 1); setIsPreparing(true); setPrepTime(10); } }}
                      className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors", currentIndex === 0 && "opacity-0")}
                  >
                      <ChevronLeft size={32} />
                  </button>

                  <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex-1 h-20 bg-[#ff00e5] rounded-[2rem] flex items-center justify-center text-white hover:bg-[#7000ff] transition-all duration-500 shadow-[0_15px_30px_rgba(255,0,229,0.3)] mx-6"
                  >
                    {isPaused ? <Play size={40} className="fill-current ml-1" /> : <Pause size={40} className="fill-current" />}
                    <span className="ml-4 text-[12px] font-black uppercase tracking-[0.3em]">{isPaused ? 'Resume' : 'Pause'} Protocol</span>
                  </button>

                  <button 
                    onClick={() => { if(currentIndex < filteredExercises.length - 1) { setCurrentIndex(currentIndex + 1); setIsPreparing(true); setPrepTime(10); } else { setIsFullscreen(false); setIsPlayingRoutine(false); } }}
                    className="w-16 h-16 rounded-3xl flex items-center justify-center text-charcoal/30 hover:text-charcoal transition-colors"
                  >
                      <ChevronRight size={32} />
                  </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExercises.slice(0, displayedCount).map((ex, idx) => (
            <ExerciseCard key={ex.id} ex={ex} idx={idx} onClick={() => setSelectedExercise(ex)} />
          ))}
        </div>

        {filteredExercises.length > displayedCount && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setDisplayedCount(prev => prev + 9)}
              className="px-8 py-4 border border-charcoal text-charcoal rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-charcoal hover:text-cream transition-all duration-300 shadow-sm"
            >
              Load More Protocols
            </button>
          </div>
        )}

        {filteredExercises.length === 0 && (
          <div className="text-center py-32">
            <p className="text-charcoal/40 font-serif italic text-2xl">No protocols found matching your criteria.</p>
          </div>
        )}

        {/* Rich SEO Content Sections */}
        <section className="mt-32 space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif text-charcoal leading-tight italic">
                Why a Structured <span className="text-gold">Stretching Routine</span> Matters
              </h2>
              <p className="text-lg text-charcoal/70 leading-relaxed font-light">
                Random stretching often yields random results. A professional <strong>stretching routine</strong> should follow physiological principles of muscle fiber recruitment and neurological adaptation. By following a structured protocol, you ensure that every muscle group is addressed through the correct "stretch reflex" window.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#ff00e5]">01. Neuro-Repatterning</h4>
                  <p className="text-xs text-charcoal/50 leading-relaxed">Systematic holds retrain the brain's tension threshold for permanent mobility gains.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#ff00e5]">02. Fascial Release</h4>
                  <p className="text-xs text-charcoal/50 leading-relaxed">Timed protocols target connective tissue, not just muscle bellies, for deeper relief.</p>
                </div>
              </div>
            </div>
            <div className="bg-charcoal rounded-[3rem] p-12 text-cream relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-1000" />
              <h3 className="text-3xl font-serif mb-6 italic">Biological Check: Routine Design</h3>
              <ul className="space-y-6">
                {[
                  "Dynamic movements before static holds",
                  "Symmetrical balance for postural integrity",
                  "Diaphragmatic breathing throughout",
                  "Progressive depth without force"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group/item">
                    <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover/item:border-gold transition-colors">
                      <div className="w-1 h-1 bg-gold rounded-full" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cream/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-16 md:p-24 border border-charcoal/5 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <h2 className="text-4xl md:text-5xl font-serif text-charcoal mb-12 italic">Stretching Routine FAQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left max-w-5xl mx-auto">
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-charcoal italic">How often should I perform a stretching routine?</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                  For optimal results, we recommend a 5-10 minute <strong>stretching routine</strong> at least four times per week. Consistency is the primary driver of neuro-plastic mobility gains.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-charcoal italic">Should I stretch before or after I workout?</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                  Perform dynamic stretches (movements) before workouts and deep static holds (20-60s) after workouts. This sequence protects the joints while maximizing muscle recovery.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-charcoal italic">What is the best routine for desk workers?</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                  Focus on the "Upper Cross" (neck and chest) and "Lower Cross" (hip flexors and hamstrings). Our platform can generate a specialized <strong>stretching routine</strong> for these exact areas.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-serif text-charcoal italic">Does stretching help with young fitness?</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed font-light">
                  Yes, maintaining elastic mobility is a cornerstone of "Grow Young Fitness." It preserves joint space and spinal decompression, crucial for long-term functional health.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-20 border-t border-charcoal/10 flex flex-wrap justify-between items-center gap-12">
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30">Next Protocol Phase</h4>
              <nav className="flex flex-wrap gap-8">
                <a href="/stretch/hamstring-stretch" className="text-sm font-serif italic text-gold hover:text-charcoal transition-colors">Hamstring Logic</a>
                <a href="/stretch/cat-cow-stretch" className="text-sm font-serif italic text-gold hover:text-charcoal transition-colors">Spinal Wave</a>
                <a href="/stretch/hip-flexor-stretch" className="text-sm font-serif italic text-gold hover:text-charcoal transition-colors">Hip Release</a>
                <a href="/workouts" className="text-sm font-serif italic text-gold hover:text-charcoal transition-colors">Featured Programs</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff00e5]/40 animate-pulse">Live Database Connection Active</span>
              <div className="w-2 h-2 rounded-full bg-[#ff00e5] shadow-[0_0_10px_rgba(255,0,229,0.5)]" />
            </div>
          </div>
        </section>
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-charcoal opacity-90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-cream rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] md:max-h-[85vh]"
            >
              <button 
                onClick={() => setSelectedExercise(null)}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[60] w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <X className="w-5 h-5 text-charcoal" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
                <div className="bg-charcoal aspect-video md:aspect-auto flex items-center justify-center relative group/modal-video overflow-hidden shrink-0">
                  {selectedExercise.imageUrl && (
                    <motion.img 
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.5 }}
                      src={selectedExercise.imageUrl} 
                      alt={selectedExercise.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/modal-video:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  
                  {selectedExercise.youtubeId ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 group-hover/modal-video:bg-black/50 transition-all duration-500">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const iframe = document.createElement('iframe');
                          iframe.width = "100%";
                          iframe.height = "100%";
                          iframe.src = `https://www.youtube.com/embed/${selectedExercise.youtubeId}?autoplay=1&rel=0`;
                          iframe.title = selectedExercise.name;
                          iframe.frameBorder = "0";
                          iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                          iframe.allowFullscreen = true;
                          iframe.className = "absolute inset-0 z-20";
                          
                          const container = e.currentTarget.parentElement;
                          if (container) {
                            container.innerHTML = '';
                            container.appendChild(iframe);
                          }
                        }}
                        className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl relative mb-4"
                      >
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                      </motion.button>
                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] font-sans">Tap to Play Video Demo</p>
                    </div>
                  ) : !selectedExercise.imageUrl && (
                    <div className="text-center p-12 space-y-4">
                      <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto">
                        <Info className="w-10 h-10 text-gold" />
                      </div>
                      <p className="text-cream/60 font-serif italic">Visual demonstration coming soon for this protocol.</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-h-0 flex-1">
                  <div className="p-8 md:p-16 pb-6 space-y-12 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white/50 to-transparent">
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-4 py-1.5 bg-charcoal text-cream rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-charcoal/10">
                          {selectedExercise.category}
                        </span>
                        <span className="px-4 py-1.5 bg-white border border-charcoal/5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-charcoal/40 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Validated
                        </span>
                      </div>
                      <h3 className="text-4xl md:text-6xl font-serif text-charcoal leading-[1.1] font-medium italic">
                        {selectedExercise.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/20">Duration</span>
                          <span className="text-base font-serif italic text-charcoal/80 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#ff00e5]" />
                            {selectedExercise.duration}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-charcoal/5 self-end mb-1" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/20">Focus Zone</span>
                          <span className="text-base font-serif italic text-charcoal/80 flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#ff00e5]" />
                            {selectedExercise.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12 group-content">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff00e5] flex items-center gap-4">
                          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#ff00e5]/40" />
                          The Protocol
                          <div className="w-4 h-4 rounded-full border border-[#ff00e5]/20 flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-[#ff00e5]" />
                          </div>
                        </h4>
                        <div className="prose prose-slate max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({children}) => <p className="text-charcoal/70 text-xl leading-relaxed font-light mb-8 antialiased">{children}</p>,
                              h1: ({children}) => <h1 className="text-4xl font-serif text-charcoal mb-6 mt-12 italic border-b border-charcoal/5 pb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-3xl font-serif text-charcoal mb-5 mt-10 italic border-l-2 border-[#ff00e5] pl-4">{children}</h2>,
                              h3: ({children}) => <h3 className="text-2xl font-serif text-charcoal mb-4 mt-8 italic text-[#ff00e5]">{children}</h3>,
                              ul: ({children}) => <ul className="space-y-4 mb-8 ml-2">{children}</ul>,
                              li: ({children}) => (
                                <li className="flex items-start gap-4 text-charcoal/70 text-lg group">
                                  <div className="w-2 h-2 rounded-full border-2 border-[#ff00e5] mt-2.5 shrink-0 group-hover:bg-[#ff00e5] transition-colors" />
                                  <span className="font-light">{children}</span>
                                </li>
                              ),
                              strong: ({children}) => <strong className="font-bold text-charcoal">{children}</strong>
                            }}
                          >
                            {selectedExercise.description}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {selectedExercise.instructions && (
                        <div className="space-y-6 pb-12">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff00e5] flex items-center gap-4">
                            <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#ff00e5]/40" />
                            Safety Matrix
                          </h4>
                          <div className="bg-charcoal text-cream p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                            <HelpCircle className="absolute bottom-6 right-6 w-12 h-12 text-white/5" />
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({children}) => <p className="text-cream/80 leading-relaxed font-medium text-lg mb-0 italic relative z-10">{children}</p>
                              }}
                            >
                              {selectedExercise.instructions}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-10 md:p-14 md:pt-6 border-t border-charcoal/5 flex flex-col sm:flex-row gap-4 bg-white/95 backdrop-blur-md shrink-0">
                    <button 
                      onClick={() => {
                        setCustomRoutine([selectedExercise]);
                        setCurrentIndex(0);
                        setIsPlayingRoutine(true);
                        setIsPreparing(true);
                        setPrepTime(10);
                        setSelectedExercise(null);
                        speak(`Ready to go! ${selectedExercise.name}`);
                      }}
                      className="flex-1 py-6 bg-charcoal text-cream rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#ff00e5] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 shadow-2xl shadow-charcoal/20"
                    >
                      Start Protocol
                    </button>
                    <button 
                      onClick={() => setSelectedExercise(null)}
                      className="flex-1 py-6 bg-white border border-charcoal/10 text-charcoal/40 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-cream transition-all duration-300"
                    >
                      Keep Browsing
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
      </main>

      {isPlayingRoutine && !isFullscreen && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-6 right-6 md:left-auto md:right-10 md:w-[400px] bg-white/90 backdrop-blur-3xl text-charcoal p-2 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] z-[150] border border-white/50"
        >
          <div className="bg-charcoal/5 rounded-[2.2rem] p-5 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#ff00e5] flex items-center justify-center shadow-lg shadow-pink-500/20">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
              </div>
              <div onClick={() => setIsFullscreen(true)} className="cursor-pointer">
                <p className="text-base font-serif italic text-charcoal leading-none mb-1">
                  {filteredExercises[currentIndex]?.name}
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-charcoal/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(timeLeft / getDuration(filteredExercises[currentIndex])) * 100}%` }}
                        className="h-full bg-[#ff00e5]"
                    />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/30">
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <button 
                onClick={() => setIsPaused(p => !p)} 
                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm hover:text-[#ff00e5] transition-all"
              >
                {isPaused ? <Play size={20} className="fill-current" /> : <Pause size={20} className="fill-current" />}
              </button>
              <button 
                onClick={() => {
                  setIsPlayingRoutine(false);
                  localStorage.removeItem(SESSION_KEY);
                }} 
                className="w-12 h-12 flex items-center justify-center bg-white/50 rounded-2xl text-charcoal/20 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
