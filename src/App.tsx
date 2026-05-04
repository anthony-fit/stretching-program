import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft,
  Download, 
  CheckCircle2, 
  Clock, 
  Target, 
  Zap, 
  Activity,
  ChevronRight,
  Printer,
  Share2,
  Menu,
  X,
  Play,
  Sparkles,
  Loader2,
  Youtube,
  ShieldCheck,
  RefreshCcw,
  AlertCircle,
  ExternalLink,
  Facebook,
  Video
} from 'lucide-react';
import { StretchRoutine } from './services/geminiService';
import { generateRoutine } from './services/routineController';
import { getVideoUrl, toEmbedUrl, getYoutubeThumbnail } from './services/videoService';
import { cn, formatDuration } from './lib/utils';
import jsPDF from 'jspdf';
import { toCanvas } from 'html-to-image';
import { EzoicAd } from './components/EzoicAd';
import { Method } from './components/Method';
import { Legal } from './components/Legal';
import { Contact } from './components/Contact';
import { Logo } from './components/Logo';
import { ExercisePage } from './pages/ExercisePage';
import { normalize } from './utils/matchExercise';

// Component for individual exercise visuals (YouTube Embed with Fallback)
function ExerciseVisual({ 
  youtubeQuery, 
  name, 
  videoSource,
  imageUrl
}: { 
  youtubeQuery: string, 
  name: string, 
  videoSource: string,
  imageUrl?: string
}) {
  const [showVideo, setShowVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const csvUrl = getVideoUrl(name);
  
  const allSources: { type: 'csv' | 'fallback', id: string, url: string }[] = [];
  if (csvUrl) {
    const embed = toEmbedUrl(csvUrl);
    if (embed && embed.includes('/embed/')) {
      allSources.push({ type: 'csv', id: 'CSV_SOURCE', url: embed });
    }
  }

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  
  const activeSource = allSources.length > 0 ? allSources[currentSourceIndex] : null;
  const activeId = activeSource ? activeSource.id : null;
  const hasCsvUrl = activeSource?.type === 'csv';
  const embedUrl = activeSource ? activeSource.url : '';
  const displayImage = imageUrl || `https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=800&q=80`;

  useEffect(() => {
    if (showVideo && activeSource) {
      if (!embedUrl || !embedUrl.includes('/embed/')) {
        setVideoError(true);
        return;
      }

      setVideoError(false);
      setIsSwitching(false);
      setIsLoading(true);
      
      const timer = setTimeout(() => {
        if (isLoading) return;
        const iframe = document.querySelector(`iframe[title="${name}"]`) as HTMLIFrameElement;
        if (!iframe || iframe.src.includes("undefined")) {
          setVideoError(true);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [embedUrl, showVideo, activeSource, name, isLoading]);

  useEffect(() => {
    if (videoError) {
      console.log("Video failed → switching source");
      console.log("Current source index:", currentSourceIndex);
      
      if (currentSourceIndex < allSources.length - 1) {
        setIsSwitching(true);
        setCurrentSourceIndex(prev => prev + 1);
        setVideoError(false);
      } else {
        setShowVideo(false);
        setVideoError(false);
      }
    }
  }, [videoError, currentSourceIndex, allSources.length]);

  if(showVideo && activeSource) {
    console.log("Final iframe src:", embedUrl);
    console.log("Loading state:", isLoading);
  }

  const handleTryBackup = () => {
    if (currentSourceIndex < allSources.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setCurrentSourceIndex(0); // loop back
    }
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-charcoal border border-charcoal/10 aspect-[16/9] flex items-center justify-center">
      {!showVideo || !activeId ? (
        <>
          <img 
            src={displayImage} 
            alt={name}
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />
          
          {/* Verified Badge */}
          {videoSource === 'wger.de' ? (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-gold/40">
              <ShieldCheck className="w-3 h-3 text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold drop-shadow-md">Clinical Source</span>
            </div>
          ) : (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-gold/40">
              <ShieldCheck className="w-3 h-3 text-gold" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gold drop-shadow-md">Verified Clinical Source</span>
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center gap-4 p-6 text-center">
            {activeId ? (
              <button 
                onClick={() => setShowVideo(true)}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300"
              >
                <Play className="w-6 h-6 text-gold fill-gold" />
              </button>
            ) : (
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40">
                {activeId ? 'Watch Demonstration' : 'Video Unavailable'}
              </p>
              <p className="text-xs font-serif italic text-cream/80">
                {activeId ? `Source: ${hasCsvUrl ? 'Verified Database' : videoSource}` : 'Visual Reference Only'}
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="relative w-full h-full group/video">
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal z-0">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
          {(!embedUrl || !embedUrl.startsWith("https://www.youtube.com/embed/")) ? (
            <div className="absolute inset-0 z-10" />
          ) : (
            <iframe
              key={embedUrl}
              width="100%"
              height="100%"
              src={embedUrl}
              title={name}
              style={{ border: "none" }}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => {
                setIsLoading(false);
                setVideoError(true);
              }}
              onLoad={() => {
                setIsLoading(false);
                setVideoError(false);
              }}
              className="w-full h-full relative z-10"
            />
          )}
          
          {isSwitching && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] text-cream uppercase tracking-widest animate-pulse border border-white/10">
              Switching video source...
            </div>
          )}
          
          {/* Video Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="flex flex-col gap-2 pointer-events-auto max-w-md mx-auto -translate-y-2 group-hover/video:translate-y-0 transition-transform duration-300 transform-gpu pt-2">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowVideo(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-md text-cream rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Image
                </button>
                {allSources.length > 1 && (
                  <button 
                    onClick={handleTryBackup}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold/90 text-charcoal rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all shadow-lg"
                    title="If video is unavailable, try an alternative source"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Try Another
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between gap-4 px-1">
                <div className="px-2 py-1 bg-black/40 backdrop-blur-md text-cream/80 rounded-full text-[9px] font-bold uppercase tracking-widest drop-shadow-md">
                  ID: <span className="font-mono text-white/90">{hasCsvUrl ? 'CSV_SOURCE' : activeId}</span>
                </div>
                {embedUrl && embedUrl.includes('/embed/') ? (
                  <a 
                    href={embedUrl.replace('/embed/', '/watch?v=')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gold hover:text-white transition-colors bg-black/40 px-2 py-1 rounded-full backdrop-blur-md"
                  >
                    <ExternalLink className="w-3 h-3" /> Watch on YouTube
                  </a>
                ) : (
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-cream/80 hover:text-gold transition-colors bg-black/40 px-2 py-1 rounded-full backdrop-blur-md"
                  >
                    <ExternalLink className="w-3 h-3" /> Search YouTube
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Routes, Route, useNavigate } from 'react-router-dom';

export function MainApp() {
  const [currentRoute, setCurrentRoute] = useState(typeof window !== 'undefined' ? window.location.pathname : '/');
  const [level, setLevel] = useState('Beginner');
  const [focus, setFocus] = useState('Full Body');
  const [duration, setDuration] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routine, setRoutine] = useState<StretchRoutine | null>(null);
  const [showNav, setShowNav] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'method' | 'privacy' | 'terms' | 'contact'>('home');
  const [wgerExercises, setWgerExercises] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isShared, setIsShared] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Stretching Program',
          text: 'Check out this full body stretching routine!',
          url: window.location.href, 
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err instanceof Error ? err.message : err);
    }
  };
  
  const routineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPopState = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useNavigate();
  const navigateTo = (path: string) => {
    navigate(path);
    setCurrentRoute(path);
  };

  useEffect(() => {
    const fetchWger = async () => {
      try {
        setIsLoadingData(true);

        const response = await fetch('https://wger.de/api/v2/exerciseinfo/?language=2&category=10&limit=100');
        console.log("FETCH STATUS:", response.status);
        const data = await response.json();
        
        console.log("RAW WGER RESPONSE:", data);
        console.log("TOTAL RESULTS:", data?.results?.length);

        data.results.forEach((item: any, index: number) => {
          console.log("WGER ITEM:", index, {
            name: item.name,
            images: item.images,
            hasImages: item.images?.length > 0
          });
        });

        const formatted = data.results
          .map((item: any) => {
            const translation = item.translations?.find((t: any) => t.language === 2) 
              || item.translations?.[0];
            const name = translation?.name;
            return {
              name,
              imageUrl: item.images?.[0]?.image || null
            };
          })
          .filter((ex: any) => 
            typeof ex.name === "string" && 
            ex.name.trim().length > 0
          );

        console.log("FIXED WGER SAMPLE:", formatted.slice(0, 5));
        console.log("FIXED COUNT:", formatted.length);

        setWgerExercises(formatted);
        console.log("wger loaded:", formatted.length);
      } catch (err) {
        console.error('wger fetch failed:', err instanceof Error ? err.message : err);
        setWgerExercises([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchWger();
  }, []);

  const handleGenerate = async () => {
    console.log("STATE:", {
      isLoadingData,
      wgerCount: wgerExercises.length
    });

    if (isLoadingData) {
      setError("Loading clinical exercise database...");
      return;
    }

    if (!isLoadingData && wgerExercises.length === 0) {
      setError("Failed to load exercise data. Please retry.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateRoutine(level, focus, duration, wgerExercises);
      setRoutine(result);
      // Scroll to routine after a short delay for animation
      setTimeout(() => {
        routineRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Generation failed:', err instanceof Error ? err.message : err);
      setError("Failed to generate routine. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const retryFetch = () => {
    window.location.reload();
  };

  const downloadPDF = async () => {
    // 1. Get Container Safely
    const original = document.getElementById("pdf-content");

    if (!original) {
      console.error("PDF container not found");
      return;
    }
    
    // 2. Clone Properly
    const clone = original.cloneNode(true) as HTMLElement;
    
    // 3. Keep clone completely visible but far off-screen
    const wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "-9999px";
    wrapper.style.left = "-9999px";
    wrapper.style.width = "800px";
    
    clone.style.width = "100%";
    clone.style.height = "auto";
    clone.style.margin = "0";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    
    // Cleanup Ads
    clone.querySelectorAll('.ezoic-ad-wrapper').forEach(el => el.remove());
    
    // Cleanup loaders and video controls
    clone.querySelectorAll('.animate-spin, .group\\/video .absolute.top-0').forEach(el => {
      const parent = el.closest('.absolute.inset-0, .p-4');
      if (parent) parent.remove();
      else el.remove();
    });

    // Remove play buttons inside the image fallback so it looks pristine
    clone.querySelectorAll('button').forEach(btn => {
      if (btn.querySelector('.lucide-play')) btn.remove();
    });

    // Fix absolute inset-0 backgrounds that had the loader and remove them completely
    clone.querySelectorAll('.bg-charcoal.z-0').forEach(el => {
      if (el.querySelector('.lucide-loader2')) el.remove();
    });

    // Force Desktop Layout for PDF by manually converting md: classes
    clone.querySelectorAll('*').forEach(el => {
      if (typeof el.className === 'string') {
        let classes = el.className.split(' ');
        
        let shouldUpdate = false;
        if (classes.includes('md:flex-row')) {
          classes = classes.filter(c => c !== 'flex-col' && c !== 'md:flex-row');
          classes.push('flex-row');
          shouldUpdate = true;
        }
        if (classes.includes('md:items-end')) {
          classes = classes.filter(c => c !== 'items-start' && c !== 'items-center' && c !== 'md:items-end');
          classes.push('items-end');
          shouldUpdate = true;
        }
        if (classes.includes('md:text-right')) {
          classes = classes.filter(c => c !== 'text-left' && c !== 'text-center' && c !== 'md:text-right');
          classes.push('text-right');
          shouldUpdate = true;
        }
        if (classes.includes('md:w-1/2')) {
          classes = classes.filter(c => c !== 'w-full' && c !== 'md:w-1/2');
          classes.push('w-1/2');
          shouldUpdate = true;
        }
        if (classes.includes('md:mt-0')) {
          classes = classes.filter(c => !c.startsWith('mt-') && c !== 'md:mt-0');
          classes.push('mt-0');
          shouldUpdate = true;
        }
        if (classes.includes('md:ml-auto')) {
          classes = classes.filter(c => c !== 'md:ml-auto');
          classes.push('ml-auto');
          shouldUpdate = true;
        }
        if (classes.includes('md:p-12')) {
          classes = classes.filter(c => !c.startsWith('p-') && c !== 'md:p-12');
          classes.push('p-12');
          shouldUpdate = true;
        }
        if (classes.includes('md:p-20')) {
          classes = classes.filter(c => !c.startsWith('p-') && c !== 'md:p-20');
          classes.push('p-20');
          shouldUpdate = true;
        }
        
        if (shouldUpdate) {
          el.className = classes.join(' ');
        }
      }
    });

    // 4. Replace iframes -> images
    const iframes = clone.querySelectorAll("iframe");
    const imagePromises: Promise<void>[] = [];

    iframes.forEach((iframe) => {
      const src = iframe.getAttribute("src");
      if (src) {
        const match = src.match(/embed\/([a-zA-Z0-9_-]{11})/);
        if (match) {
          const videoId = match[1];
          const img = document.createElement("img");

          imagePromises.push(new Promise((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }));

          img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover";
          img.style.borderRadius = "12px";

          iframe.replaceWith(img);
          return;
        }
      }
      // If we reach here, it's not a youtube iframe, so we just remove it
      // to avoid SecurityError when html-to-image tries to traverse the DOM
      iframe.remove();
    });

    // Wait for any existing images to finish loading to prevent blank spaces
    clone.querySelectorAll('img').forEach((img) => {
      if (!img.complete) {
        imagePromises.push(new Promise(resolve => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }));
      }
    });

    // 5. WAIT before capture (CRITICAL) - ensure images fully load
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    await Promise.race([Promise.all(imagePromises), timeoutPromise]);
    await new Promise(r => setTimeout(r, 100)); // extra layout tick

    try {
      // 6. Capture with toCanvas
      const canvas = await toCanvas(clone, {
        backgroundColor: "#FDFCF8",
        pixelRatio: 2,
        cacheBust: true,
      });
      
      // 7. Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const width = 210;
      const height = (canvas.height * width) / canvas.width;
      
      let heightLeft = height;
      let position = 0;
      
      // Top down approach for multiple pages if needed
      pdf.addImage(imgData, "PNG", 0, position, width, height, undefined, 'FAST');
      heightLeft -= 297; // A4 height is ~297mm
      
      while (heightLeft >= 0) {
        position = heightLeft - height;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, width, height, undefined, 'FAST');
        heightLeft -= 297;
      }
      
      pdf.save(`routine.pdf`);
      console.log("PDF generated successfully");
    } catch (err) {
      console.error('PDF Generation failed:', err instanceof Error ? err.message : err);
    } finally {
      // 8. Cleanup
      if (document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
    }
  };

  return (
    <div className="bg-cream selection:bg-gold">
      {/* Main Content */}
      <main className="pt-20 pb-20">
        <>
          {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#ff00e5]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-charcoal/5 rounded-full blur-[100px] -ml-48 -mb-48" />
              </div>

              <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center mb-20"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-charcoal text-cream text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff00e5]" />
                    <span>The Biological Protocol</span>
                  </div>
                  <h1 className="text-5xl md:text-8xl font-serif font-medium leading-[1.0] mb-8 tracking-tight text-charcoal max-w-5xl mx-auto">
                    Master Your <span className="italic text-charcoal/20">Mobility</span> Engine.
                  </h1>
                  <p className="max-w-2xl mx-auto text-xl md:text-2xl text-charcoal opacity-60 leading-relaxed font-light italic">
                    Unlock elite flexibility through scientific stretching protocols. Relieve chronic tension and reset your daily energy matrix.
                  </p>
                </motion.div>

                {/* Generator Form */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-charcoal/5 p-8 md:p-12"
                  >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal/60">
                        <Zap className="w-3 h-3 text-gold" /> Fitness Level
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                          <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm transition-all duration-300 border",
                              level === l 
                                ? "bg-charcoal text-cream border-charcoal" 
                                : "bg-transparent text-charcoal/60 border-charcoal/10 hover:border-gold"
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal/60">
                        <Target className="w-3 h-3 text-gold" /> Focus Area
                      </label>
                      <select 
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold appearance-none cursor-pointer text-charcoal"
                      >
                        {['Full Body', 'Upper Body', 'Lower Body', 'Neck & Shoulders', 'Hips & Glutes', 'Back Relief'].map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-charcoal/60">
                        <Clock className="w-3 h-3 text-gold" /> Duration
                      </label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="5" 
                          max="30" 
                          step="5"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="flex-1 accent-gold"
                        />
                        <span className="text-sm font-bold w-12">{duration}m</span>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className={cn(
                      "mb-6 p-4 border rounded-xl flex items-center gap-3 text-sm",
                      error === "Loading clinical exercise database..."
                        ? "bg-stone-100 border-stone-200 text-stone-600"
                        : "bg-red-50 border-red-100 text-red-600"
                    )}>
                      {error === "Loading clinical exercise database..." ? (
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={error?.includes("Failed") ? retryFetch : handleGenerate}
                    disabled={isGenerating}
                    className="w-full group relative overflow-hidden py-6 bg-charcoal text-cream rounded-2xl font-serif text-2xl hover:bg-gold transition-all duration-500 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isGenerating ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-6 h-6 border-2 border-cream opacity-30 border-t-cream rounded-full"
                          />
                          Designing Your Routine...
                        </>
                      ) : (
                        <>
                          {error && error !== "Loading clinical exercise database..." ? 'Try Again' : 'Generate My Stretch Plan'}
                          <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </span>
                  </button>

                  <div className="mt-8 text-center">
                    <a href="/stretch" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-charcoal/60 hover:text-gold transition-colors group">
                      Browse Full Protocol Library <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gold opacity-5 to-transparent -z-10" />
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-gold opacity-10 via-transparent to-transparent -z-10" />
            </section>

            {/* Static Content Section for AdSense Policy (Homepage FIX) */}
            <section className="py-24 px-6 bg-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-charcoal/5 to-transparent" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
              
              <div className="max-w-5xl mx-auto space-y-24 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-charcoal/5 border border-charcoal/10">
                      <Activity className="w-3.5 h-3.5 text-[#ff00e5]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/60">Scientific Foundation</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-charcoal leading-[1.1] italic">
                      What is <span className="text-charcoal/30">Stretching?</span>
                    </h2>
                    <p className="text-xl text-charcoal/70 leading-relaxed font-light antialiased">
                      Stretching is a vital form of physical exercise in which a specific muscle or tendon is deliberately flexed or stretched in order to <strong>improve the muscle's felt elasticity</strong> and achieve a comfortable muscle tone. 
                    </p>
                    <p className="text-lg text-charcoal/50 leading-relaxed font-light">
                      The result is a feeling of increased muscle control, flexibility, and a healthier range of motion. Whether you are an elite athlete, a weekend warrior, or someone who spends most of the day at a desk, taking the time to stretch can have profound impacts on your overall physical capability and comfort.
                    </p>
                  </div>
                  
                  <div className="bg-cream rounded-[2.5rem] p-10 shadow-2xl shadow-charcoal/5 border border-charcoal/5 relative group">
                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-[#ff00e5] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-serif italic text-charcoal mb-6">Neurological Safety</h3>
                    <p className="text-charcoal/60 leading-relaxed italic">
                      "By dedicating even just a few minutes a day to a consistent stretching routine, you signal to your nervous system that it is safe to relax, helping to lower stress hormones and bring a sense of mental clarity."
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif font-medium text-charcoal italic">Core Benefits</h2>
                    <div className="w-24 h-1 bg-[#ff00e5]/20 mx-auto rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-[#ff00e5]" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { title: 'Performance', desc: 'Flexible muscles expend less energy, meaning you can run, lift, and move more efficiently.', icon: Zap },
                      { title: 'Injury Shield', desc: 'Tight muscles are prone to strains. Routine stretching helps joints move effortlessly through full ranges.', icon: ShieldCheck },
                      { title: 'Systemic Vitality', desc: 'Increased blood flow delivers essential nutrients and oxygen, speeding up clinical recovery.', icon: Activity }
                    ].map((benefit, i) => (
                      <div key={i} className="group p-8 bg-white border border-charcoal/5 rounded-[2rem] hover:border-[#ff00e5]/30 transition-all duration-500 hover:shadow-xl">
                        <div className="w-12 h-12 rounded-xl bg-charcoal/5 flex items-center justify-center mb-6 group-hover:bg-[#ff00e5]/10 transition-colors">
                          <benefit.icon className="w-6 h-6 text-charcoal group-hover:text-[#ff00e5] transition-colors" />
                        </div>
                        <h4 className="text-xl font-serif italic text-charcoal mb-3">{benefit.title}</h4>
                        <p className="text-sm text-charcoal/50 leading-relaxed font-light">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-charcoal rounded-[3rem] p-12 md:p-20 text-cream relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-8">
                      <h2 className="text-4xl md:text-5xl font-serif italic mb-6">The Protocol Engine</h2>
                      <p className="text-cream/60 text-lg font-light leading-relaxed">
                        Our platform is designed to take the guesswork out of mobility. Instead of wondering which muscles to stretch, our system builds intelligent routines using verified exercise data.
                      </p>
                      <div className="space-y-4">
                        {[
                          'Clinical-Grade Exercise Library',
                          'Structured Hold Timing',
                          'Curated Visual Guidance',
                          'Safety-First Methodology'
                        ].map((feature, i) => (
                          <div key={i} className="flex items-center gap-4 group/item">
                            <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover/item:border-[#ff00e5] transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5 text-white/40 group-hover/item:text-[#ff00e5]" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-white/80">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-8 bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 self-center">
                      <h3 className="text-2xl font-serif italic mb-6 text-[#ff00e5]">Who is this for?</h3>
                      <div className="space-y-6">
                        {[
                          { title: 'Beginners', desc: 'Ease into a safe, sustainable practice with no prior experience.' },
                          { title: 'Desk Workers', desc: 'Alleviate chronic tension from long hours of computer work.' },
                          { title: 'Athletes', desc: 'Optimize recovery and protect against high-load injuries.' }
                        ].map((item, i) => (
                          <div key={i} className="space-y-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{item.title}</h4>
                            <p className="text-sm text-white/80 font-light">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-serif italic text-charcoal">Optimal Timing</h2>
                    <p className="text-charcoal/60 leading-relaxed font-light">
                      The ideal window to stretch depends on your lifestyle. <strong>Morning sessions</strong> shake off sleep inertia, while <strong>Evening routines</strong> promote deeper sleep by lowering cortisol.
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/30 mb-1">AM Focus</span>
                        <span className="text-sm font-bold italic text-charcoal">Neuro Activation</span>
                      </div>
                      <div className="w-px h-8 bg-charcoal/5" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/30 mb-1">PM Focus</span>
                        <span className="text-sm font-bold italic text-charcoal">Restorative Sleep</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-10 bg-cream/50 rounded-[2.5rem] border border-charcoal/5 space-y-6">
                    <h2 className="text-3xl font-serif italic text-charcoal">Frequency</h2>
                    <p className="text-charcoal/60 leading-relaxed font-light text-sm italic">
                      "Consistency is far more important than intensity. You will see much better results from stretching 5 to 10 minutes every day than from forcing a grueling 60-minute session once a week."
                    </p>
                    <div className="pt-4 border-t border-charcoal/10 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">Target Protocol</span>
                      <span className="text-xs font-bold bg-[#ff00e5] text-white px-3 py-1 rounded-full">3-5x Weekly</span>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 mb-8">Direct Access Library</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {[
                      { name: 'Hamstring Protocol', path: '/stretch/hamstring-stretch' },
                      { name: 'Cervical Spine Relief', path: '/stretch/neck-stretch' },
                      { name: 'Hip Flexor Matrix', path: '/stretch/hip-flexor-stretch' }
                    ].map((link, i) => (
                      <a 
                        key={i} 
                        href={link.path}
                        className="px-8 py-4 bg-white border border-charcoal/10 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] text-charcoal/60 hover:border-[#ff00e5] hover:text-[#ff00e5] hover:shadow-xl transition-all duration-300"
                      >
                        {link.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Routine Section */}
            <AnimatePresence>
              {routine && (
                <motion.section
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="py-20 px-6"
                >
                  <div className="max-w-5xl mx-auto">
                    {/* Top Ad Placement */}
                    {(routine?.exercises && routine.exercises.length > 0) && <EzoicAd id={101} className="mb-12" />}

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                      <div>
                        <h2 className="text-4xl md:text-5xl font-serif mb-4">{routine.title}</h2>
                        <div className="flex flex-wrap gap-4">
                          <span className="flex items-center gap-2 text-sm font-medium text-charcoal/70">
                            <Target className="w-4 h-4" /> {routine.focusArea}
                          </span>
                          <span className="flex items-center gap-2 text-sm font-medium text-charcoal/70">
                            <Zap className="w-4 h-4" /> {routine.level}
                          </span>
                          <span className="flex items-center gap-2 text-sm font-medium text-charcoal/70">
                            <Clock className="w-4 h-4" /> {routine.duration} Minutes
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={downloadPDF}
                          className="flex items-center gap-2 px-6 py-3 bg-white border border-charcoal-muted rounded-xl text-sm font-bold hover:bg-cream transition-colors"
                        >
                          <Download className="w-4 h-4" /> Download PDF
                        </button>
                        <button 
                          onClick={handleShare}
                          className="flex items-center gap-2 px-6 py-3 bg-charcoal text-cream rounded-xl text-sm font-bold hover:bg-gold transition-colors"
                        >
                          {isShared ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> Copied!
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4" /> Share
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Printable Content Area */}
                    <div 
                      id="pdf-content"
                      ref={routineRef}
                      style={{ backgroundColor: '#FDFCF8', borderColor: 'rgba(18, 18, 18, 0.05)' }}
                      className="rounded-[2.5rem] p-10 md:p-20 border relative overflow-hidden"
                    >
                      {/* Professional Watermark/Background Element - Removed blur for PDF compatibility */}
                      <div 
                        style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)' }}
                        className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32 pointer-events-none" 
                      />
                      
                      <div 
                        style={{ borderColor: 'rgba(18, 18, 18, 0.1)' }}
                        className="flex flex-col md:flex-row justify-between items-start mb-20 border-b pb-12 relative z-10"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 mb-6">
                            <Logo size="md" />
                          </div>
                          <div>
                            <p style={{ color: '#C5A059' }} className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Clinical Mobility Protocol</p>
                            <h3 style={{ color: '#121212' }} className="text-5xl font-serif italic">{routine.title}</h3>
                          </div>
                        </div>
                        
                        <div className="mt-8 md:mt-0 grid grid-cols-2 gap-8 text-left md:text-right">
                          <div>
                            <p style={{ color: 'rgba(18, 18, 18, 0.4)' }} className="text-[9px] font-bold uppercase tracking-widest mb-1">Prescribed For</p>
                            <div style={{ borderColor: 'rgba(18, 18, 18, 0.1)' }} className="h-6 border-b w-32 md:ml-auto" />
                          </div>
                          <div>
                            <p style={{ color: 'rgba(18, 18, 18, 0.4)' }} className="text-[9px] font-bold uppercase tracking-widest mb-1">Date Issued</p>
                            <p style={{ color: 'rgba(18, 18, 18, 0.7)' }} className="font-mono text-xs">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="col-span-2">
                            <p style={{ color: 'rgba(18, 18, 18, 0.4)' }} className="text-[9px] font-bold uppercase tracking-widest mb-1">Protocol Authentication</p>
                            <p style={{ color: '#C5A059' }} className="font-mono text-[10px] uppercase tracking-wider">VERIFIED-CLINICAL-SOURCE-{Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-24 relative z-10">
                        {routine.exercises.map((ex, idx) => (
                          <React.Fragment key={idx}>
                            <div 
                              className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-16 items-start"
                            >
                              <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                  <div style={{ color: 'rgba(197, 160, 89, 0.2)' }} className="text-6xl font-serif leading-none select-none">
                                    {String(idx + 1).padStart(2, '0')}
                                  </div>
                                  <div className="space-y-2">
                                    <a 
                                      href={'/exercise/' + (ex.slug || encodeURIComponent(ex.name))}
                                      className="text-left hover:text-gold transition-colors block group"
                                      aria-label={`View details for ${ex.name}`}
                                    >
                                      <h4 style={{ color: '#121212' }} className="text-3xl font-bold tracking-tight inline-flex items-center gap-2 group-hover:text-gold transition-colors">
                                        {ex.name}
                                        <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </h4>
                                    </a>
                                    <div className="flex gap-4">
                                      <span style={{ backgroundColor: 'rgba(18, 18, 18, 0.05)', color: 'rgba(18, 18, 18, 0.5)' }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {ex.targetArea}
                                      </span>
                                      <span style={{ backgroundColor: 'rgba(197, 160, 89, 0.1)', color: '#C5A059' }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {formatDuration(ex.duration)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="pl-20 space-y-6">
                                  <p style={{ color: 'rgba(18, 18, 18, 0.8)' }} className="leading-relaxed text-lg font-light italic">
                                    {ex.description}
                                  </p>

                                  {ex.instruction && (
                                    <div className="space-y-4">
                                      <div className="space-y-1">
                                        <p style={{ color: 'rgba(18, 18, 18, 0.4)' }} className="text-[10px] font-bold uppercase tracking-widest">Protocol Instruction</p>
                                        <p style={{ color: 'rgba(18, 18, 18, 0.9)' }} className="text-base leading-relaxed font-serif">
                                          {ex.instruction}
                                        </p>
                                      </div>
                                      
                                      {ex.breathing && (
                                        <div className="flex items-start gap-3 p-4 rounded-xl bg-gold/5 border border-gold/10">
                                          <RefreshCcw className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                                          <div className="space-y-1">
                                            <p style={{ color: '#C5A059' }} className="text-[10px] font-bold uppercase tracking-widest">Breathing Pattern</p>
                                            <p style={{ color: 'rgba(18, 18, 18, 0.7)' }} className="text-xs italic">
                                              {ex.breathing}
                                            </p>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  <div style={{ backgroundColor: 'rgba(197, 160, 89, 0.05)', borderLeftColor: '#C5A059' }} className="border-l-4 p-6 rounded-r-2xl space-y-2">
                                    <p style={{ color: '#C5A059' }} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                      <ShieldCheck className="w-3 h-3" /> Safety Directive
                                    </p>
                                    <p style={{ color: 'rgba(18, 18, 18, 0.9)' }} className="text-sm leading-relaxed">
                                      {ex.safety || ex.safetyTip}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 print:hidden">
                                <p style={{ color: 'rgba(18, 18, 18, 0.3)' }} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                  <Play className="w-3 h-3" /> Visual Reference
                                </p>
                                <ExerciseVisual 
                                  youtubeQuery={ex.youtubeQuery}
                                  name={ex.name} 
                                  videoSource={ex.videoSource} 
                                  imageUrl={ex.imageUrl}
                                />
                              </div>
                            </div>
                            
                            {/* Middle Ad Placement (after 3rd exercise) */}
                            {(routine?.exercises && routine.exercises.length > 0) && idx === 2 && <EzoicAd id={102} className="py-12 border-y border-charcoal-muted" />}
                          </React.Fragment>
                        ))}
                      </div>

                      <div style={{ borderTopColor: 'rgba(18, 18, 18, 0.1)' }} className="mt-32 pt-16 border-t relative z-10">
                        <div className="max-w-2xl mx-auto text-center space-y-8">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                              <div style={{ borderTopColor: 'rgba(18, 18, 18, 0.05)' }} className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <span style={{ backgroundColor: '#FDFCF8' }} className="px-4">
                                <Sparkles className="w-6 h-6 text-gold" />
                              </span>
                            </div>
                          </div>
                          
                          <p style={{ color: 'rgba(18, 18, 18, 0.8)' }} className="text-2xl font-serif italic leading-relaxed">
                            "{routine.motivationalNote}"
                          </p>
                          
                          <div className="pt-8 space-y-4">
                            <p style={{ color: 'rgba(18, 18, 18, 0.4)' }} className="text-[10px] font-bold uppercase tracking-[0.3em]">
                              Official Methodology by Stretching Program
                            </p>
                            <div style={{ color: 'rgba(18, 18, 18, 0.3)' }} className="flex justify-center gap-12 text-[9px] font-bold uppercase tracking-widest flex-wrap">
                              <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Clinical Optimized</span>
                              <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Clinical Grade</span>
                              <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Open-Source API Data</span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ borderTopColor: 'rgba(18, 18, 18, 0.1)' }} className="mt-20 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] border-t pt-8">
                          <div style={{ color: 'rgba(18, 18, 18, 0.2)' }} className="flex flex-col items-center md:items-start gap-1">
                            <span>Generated by Stretching Program Intelligence</span>
                            <span style={{ color: 'rgba(197, 160, 89, 0.4)' }}>stretchingprogram.com</span>
                          </div>
                          <div style={{ color: 'rgba(18, 18, 18, 0.2)' }} className="text-center md:text-right">
                            <span>© 2026 Mobility Protocol International</span>
                            <br />
                            <span>Professional Edition • No. {Math.floor(Math.random() * 1000000)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-charcoal text-cream">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-3xl font-serif">Instant Intelligence</h3>
                    <p className="text-cream/60 leading-relaxed font-light">
                      Our system cross-references wger open-source data with clinical mobility protocols to design the perfect sequence for your specific needs, instantly.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center">
                      <Printer className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-3xl font-serif">Printable Charts</h3>
                    <p className="text-cream/60 leading-relaxed font-light">
                      Take your routine offline with high-resolution PDF charts designed for your home gym or office wall.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="w-12 h-12 rounded-full border border-cream/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-3xl font-serif">No Friction</h3>
                    <p className="text-cream/60 leading-relaxed font-light">
                      We believe health should be accessible. No accounts, no subscriptions, no barriers. Just better movement.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
      </main>

      {/* Footer Ad Placement */}
      <div className="max-w-7xl mx-auto px-6">
        {(!isGenerating && !error) && <EzoicAd id={103} className="py-12" />}
      </div>

            {/* Featured Workouts Section */}
            <section className="py-24 px-6 bg-cream border-t border-charcoal/5">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                  <div className="max-w-2xl">
                    <span className="text-gold font-bold uppercase tracking-[0.3em] text-[10px]">Verified Programs</span>
                    <h2 className="text-4xl md:text-5xl font-serif mt-4 mb-6">Solve Your <span className="italic text-gold">Pain Points</span></h2>
                    <p className="text-charcoal/60 text-lg font-light leading-relaxed">
                      Beyond the routine generator, we have developed specialized protocols for specific needs—from posture correction to runner's recovery.
                    </p>
                  </div>
                  <a href="/workouts" className="px-8 py-4 border border-charcoal text-charcoal rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-charcoal hover:text-cream transition-all inline-block">
                    View All Workouts
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[
                    { id: 'posture', title: 'Posture Correction', desc: 'Counteract desk work and improve alignment.', icon: <Activity className="w-6 h-6" /> },
                    { id: 'runners', title: 'For Runners', desc: 'Joint protection and running economy.', icon: <Zap className="w-6 h-6" /> },
                    { id: 'pain-relief', title: 'Pain Relief', desc: 'Targeted movements for chronic tension.', icon: <ShieldCheck className="w-6 h-6" /> }
                  ].map((w, i) => (
                    <motion.a
                      key={w.id}
                      href={`/stretching-routine/${w.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group bg-white rounded-[2rem] p-8 border border-charcoal/5 hover:border-gold/30 hover:shadow-xl transition-all"
                    >
                      <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-white transition-colors">
                        {w.icon}
                      </div>
                      <h3 className="text-2xl font-serif text-charcoal mb-3 group-hover:text-gold transition-colors">{w.title}</h3>
                      <p className="text-charcoal/50 text-sm font-light leading-relaxed mb-6 italic font-sans">{w.desc}</p>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                        Start Workout <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>
            </section>
    </div>
  );
}

import StretchCategoryPage from './pages/StretchCategoryPage';
import StretchDetailPage from './pages/StretchDetailPage';
import StretchingRoutinePage from './pages/StretchingRoutinePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import HowToStretchPage from './pages/HowToStretchPage';
import WorkoutsPage from './pages/WorkoutsPage';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GlobalReferences } from './components/GlobalReferences';
import { NewsletterPopup } from './components/NewsletterPopup';

const REMINDER_KEY = "last_stretch_reminder";

import MethodPage from './pages/MethodPage';

export default function App() {
  useEffect(() => {
    const last = localStorage.getItem(REMINDER_KEY);
    const now = new Date();

    const triggerReminder = () => {
      alert("Time for your daily stretch routine!");

      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("Stretch Reminder", {
            body: "Time for your daily stretch!"
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    };

    if (!last) {
      localStorage.setItem(REMINDER_KEY, now.toISOString());
      console.log("REMINDER CHECKED");
      return;
    }

    const lastDate = new Date(last);
    const diff = now.getTime() - lastDate.getTime();
    const oneDay = 24 * 60 * 60 * 1000;

    if (diff > oneDay) {
      triggerReminder();
      localStorage.setItem(REMINDER_KEY, now.toISOString());
    }
    console.log("REMINDER CHECKED");
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream selection:bg-gold">
      <Navbar />
      <main className="flex-1 min-h-[80vh]">
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/stretching-routine" element={<StretchingRoutinePage />} />
          <Route path="/stretching-routine/:preset" element={<StretchingRoutinePage />} />
          <Route path="/method" element={<MethodPage />} />
          <Route path="/workouts" element={<WorkoutsPage />} />
          <Route path="/stretch" element={<StretchCategoryPage />} />
          <Route path="/stretch/:slug" element={<StretchDetailPage />} />
          <Route path="/stretch/:slug/:modifier" element={<StretchDetailPage />} />
          <Route path="/exercise/:slug" element={<ExercisePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/how-to-stretch" element={<HowToStretchPage />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </main>
      <GlobalReferences />
      <Footer />
      <NewsletterPopup />
    </div>
  );
}
