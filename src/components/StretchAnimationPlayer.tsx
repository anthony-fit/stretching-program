import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, RefreshCw, Music, SkipBack, SkipForward, Play as PlayIcon, Volume2, Check } from "lucide-react";
import manifest from "../assets/metadata/animation_manifest.json";

interface StretchAnimationPlayerProps {
  exPath: string;
  exName?: string;
  isPlaying?: boolean;
  isPreparing?: boolean;
  hideControls?: boolean;
  framingMode?: "fit" | "focus" | "cinematic";
  narrationText?: string;
}

const TRACKS = [
  { id: 'none', name: 'No Music', url: '' },
  { id: 'ambient', name: 'Ambient Flow', url: 'https://p.scdn.co/mp3-preview/3e068c2d5d85c4974a68285f5e5509acc8d6b889' },
  { id: 'zen', name: 'Deep Zen', url: 'https://p.scdn.co/mp3-preview/a91345d9472e353273e89542a17ba7041a87611c' },
  { id: 'focus', name: 'Protocol Focus', url: 'https://p.scdn.co/mp3-preview/898d9b626e2e28a506a72e817fdf9e288a82d005' }
];

export default function StretchAnimationPlayer({
  exPath,
  exName,
  isPlaying = true,
  isPreparing = false,
  hideControls = false,
  framingMode = "cinematic"
}: StretchAnimationPlayerProps) {
  const [frame, setFrame] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [mediaStats, setMediaStats] = useState<{w: number, h: number} | null>(null);

  // Music State
  const [isMusicMenuOpen, setIsMusicMenuOpen] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Default to 'None' now
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const totalFrames = 12; // Standard sequence length
  const fps = 10;

  const currentTrack = TRACKS[currentTrackIndex];

  // Extract slug and search term
  const requestedSlug = exPath.replace(/^\/animations\//, "").replace(/\.json$/, "");
  // Optimized search term: remove generic words but keep key identifiers
  const searchTerm = exName || requestedSlug
    .replace(/_/g, " ")
    .replace(/\b(routine|exercise|pose)\b/gi, "")
    .trim();

  // API Fetching Logic
  useEffect(() => {
    // Skip API calls for the default placeholder if no exName is provided
    if (!exName && (requestedSlug === "default_stretch" || !searchTerm)) {
      setGifUrl(null);
      setIsApiLoading(false);
      return;
    }

    const fetchExerciseGif = async () => {
      setIsApiLoading(true);
      setGifUrl(null);
      try {
        const response = await fetch(`/api/get-stretch?name=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          console.log(`[API] Results found for ${searchTerm}:`, data.length);
          // Find exercise that most closely matches the search term
          const termWords = searchTerm.toLowerCase().split(' ');
          const bestMatch = data.find(ex => {
            const name = ex.name.toLowerCase();
            return termWords.every(word => name.includes(word)) && ex.gifUrl;
          }) || data.find(ex => ex.gifUrl) || data[0];

          if (bestMatch.gifUrl) {
            console.log(`[API] Selected exercise GIF: ${bestMatch.name}`);
            setGifUrl(bestMatch.gifUrl);
            setImageUrls(bestMatch.imageUrls || []);
          } else {
            console.warn(`[API] No GIF found in results for ${searchTerm}`);
            setImageUrls([]);
          }
        } else {
          console.log(`[API] No results found for ${searchTerm}`);
        }
      } catch (err: any) {
        console.warn("RapidAPI data unavailable for:", searchTerm, err);
        // If it's a specific API error reported by our server (403/429)
        if (err.message?.includes("429") || err.message?.includes("403")) {
          setHasError(true);
        }
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchExerciseGif();
  }, [searchTerm, requestedSlug]);

  // Narration Speech Synthesis
  useEffect(() => {
    if (!narrationText) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      return;
    }

    // Cancel any existing utterance
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(narrationText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a calm professional voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.toLowerCase().includes('google') ||
      v.name.toLowerCase().includes('professional') ||
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('samantha')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;

    if (isPlaying) {
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [narrationText]);

  // Handle play/pause for narration
  useEffect(() => {
    if (!utteranceRef.current || !narrationText) return;

    if (isPlaying) {
      // Resume or start speaking
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking) {
        window.speechSynthesis.speak(utteranceRef.current);
      }
    } else {
      window.speechSynthesis.pause();
    }
  }, [isPlaying, narrationText]);

  // Handle errors and fallback messaging
  const errorSubtext = hasError
    ? (isApiLoading ? "Connecting Library..." : "Visualization rendering...")
    : "Protocol Live";

  // Audio Logic
  useEffect(() => {
    if (!currentTrack.url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;

      // Handle source errors gracefully
      audioRef.current.onerror = () => {
        console.warn("Audio source error, attempting to continue without audio");
      };
    } else {
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
    }

    const playAudio = () => {
      if (hasInteracted && isPlaying && !isPreparing && audioRef.current && currentTrack.url) {
        // Only play if we have a valid source and it's not already playing
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== "AbortError") {
              console.log("Audio play blocked or failed:", e.message);
            }
          });
        }
      } else {
        audioRef.current?.pause();
      }
    };

    playAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }
    };
  }, [isPlaying, isPreparing, currentTrack.url, hasInteracted]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      // Brief timeout to ensure state update before play attempt
      setTimeout(() => {
        if (audioRef.current && isPlaying && !isPreparing) {
          audioRef.current.play().catch(err => console.log("Init play failed:", err.message));
        }
      }, 50);
    }
  };

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInteraction();
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Check manifest to immediately fallback if known missing
  const isAvailable = manifest.includes(requestedSlug);

  const currentSlug = (!isAvailable || useFallback) && !gifUrl ? "default_stretch" : requestedSlug;
  const framesBasePath = `/animations/${currentSlug}`;

  useEffect(() => {
    // Reset state when exercise changes
    setHasError(false);
    setIsLoaded(false);
    setUseFallback(false);
    setFrame(1);

    // If we are using the local animation system, check if files exist
    if (!gifUrl) {
      const testImg = new Image();
      testImg.src = `${framesBasePath}/frame_001.webp`;
      testImg.onerror = () => {
        if (!gifUrl && currentSlug !== "default_stretch") {
          setUseFallback(true);
        } else if (!gifUrl && !isApiLoading) {
          setHasError(true);
        }
      };
    }
  }, [requestedSlug, currentSlug, gifUrl, isApiLoading]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isLoaded && isPlaying && !hasError) {
      if (imageUrls.length > 1) {
        // Run animation for multi-image API responses (cross-fading slowly)
        interval = setInterval(() => {
          setFrame(prev => (prev % imageUrls.length) + 1);
        }, 3000);
      } else if (!gifUrl) {
        // Run local frame sequence
        interval = setInterval(() => {
          setFrame(prev => (prev % totalFrames) + 1);
        }, 1000 / fps);
      } else {
        setFrame(1);
      }
    } else {
      setFrame(1);
    }

    return () => clearInterval(interval);
  }, [isLoaded, isPlaying, hasError, gifUrl, imageUrls]);

  const frameSrc = !gifUrl ? `${framesBasePath}/frame_${String(frame).padStart(3, "0")}.webp` : "";
  const dynamicGifUrl = imageUrls.length > 0 ? imageUrls[frame - 1] : gifUrl;

  const getFramingStyles = () => {
    if (!hideControls) return { initial: { scale: 1, y: 0 }, animate: { scale: 1, y: 0 }, className: "p-4 md:p-12" };

    let effectiveMode = framingMode;
    let modifiers = { scaleMod: 1, yMod: 1 };

    if (mediaStats) {
      const isLowRes = mediaStats.w < 600 || mediaStats.h < 600;
      const ratio = mediaStats.w / mediaStats.h;
      const isPortrait = ratio < 0.8;
      const isLandscape = ratio > 1.2;
      const isSquareLike = ratio >= 0.8 && ratio <= 1.2;

      if (isLowRes) {
        effectiveMode = "fit"; // Downgrade
      } else if (isPortrait && effectiveMode === "cinematic") {
        effectiveMode = "focus"; // Portrait extreme zooms clip too much
      }

      // Close-up / subtle motion reduction for squares
      if (isSquareLike && effectiveMode === "cinematic") {
         modifiers = { scaleMod: 0.5, yMod: 0.5 }; // reduce intensity
      } else if (isLandscape && effectiveMode === "cinematic") {
         modifiers = { scaleMod: 1.2, yMod: 1.5 }; // stronger sweep for landscapes
      }
    }

    switch (effectiveMode) {
      case "fit":
        return {
          initial: { scale: 0.95, y: 0 },
          animate: { scale: 0.95, y: 0 },
          className: "p-8 md:p-12" // Padding avoids edge overlaps
        };
      case "focus":
        return {
          initial: { scale: 1.02, y: 0 },
          animate: { scale: 1.02, y: 0 },
          className: "p-2"
        };
      case "cinematic":
      default:
        return {
          initial: { scale: 1.0 + (0.05 * modifiers.scaleMod), y: 5 * modifiers.yMod },
          animate: { scale: 1.0 + (0.15 * modifiers.scaleMod), y: -5 * modifiers.yMod },
          className: "p-0"
        };
    }
  };

  const framing = getFramingStyles();

  return (
    <div
      onClick={handleInteraction}
      className={`relative w-full z-0 ${hideControls ? 'h-full bg-transparent' : 'aspect-[4/5] md:aspect-video bg-white rounded-[3rem] border border-charcoal/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)]'} overflow-hidden group transition-all duration-700 ${isPreparing ? 'bg-cream/20' : ''}`}
      style={{ isolation: 'isolate' }}
    >
      {/* Immersive Audio Controls */}
      {!hideControls && (
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="relative">
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleInteraction();
                setIsMusicMenuOpen(!isMusicMenuOpen);
              }}
              className="flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/40 shadow-sm transition-all hover:bg-white cursor-pointer"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff00e5] to-[#7000ff] flex items-center justify-center text-white shadow-lg">
                    <Music size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-charcoal/80 uppercase tracking-[2px] leading-none mb-1">Select music</span>
                  <span className="text-[8px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">{currentTrack.name}</span>
                </div>
            </div>

            <AnimatePresence>
              {isMusicMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  onMouseLeave={() => setIsMusicMenuOpen(false)}
                  className="absolute top-full mt-3 left-0 w-56 bg-white/95 backdrop-blur-2xl rounded-3xl border border-charcoal/5 shadow-2xl p-2 z-50 overflow-hidden"
                >
                  {TRACKS.map((track, i) => (
                    <button
                      key={track.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInteraction();
                        setCurrentTrackIndex(i);
                        setIsMusicMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentTrackIndex === i ? 'bg-[#ff00e5] text-white shadow-lg shadow-pink-500/20' : 'text-charcoal/60 hover:bg-charcoal/5'}`}
                    >
                      {track.name}
                      {currentTrackIndex === i ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-charcoal/10" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-6 bg-white/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-charcoal/30">
              <SkipBack
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction();
                  setCurrentTrackIndex(prev => (prev - 1 + TRACKS.length) % TRACKS.length);
                }}
                className="hover:text-[#ff00e5] cursor-pointer transition-colors"
              />
              <div onClick={toggleMusic}>
                <PlayIcon size={18} className="fill-current text-[#ff00e5] hover:scale-110 cursor-pointer transition-transform" />
              </div>
              <SkipForward
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInteraction();
                  setCurrentTrackIndex(prev => (prev + 1) % TRACKS.length);
                }}
                className="hover:text-[#ff00e5] cursor-pointer transition-colors"
              />
          </div>
        </div>
      )}

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      <AnimatePresence mode="wait">
        {(isApiLoading || !isLoaded) && !hasError && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cream/50 backdrop-blur-sm z-20"
          >
            <RefreshCw className="w-8 h-8 text-gold animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40">
              {isApiLoading ? "Connecting Library..." : "Loading Protocol..."}
            </p>
          </motion.div>
        )}

        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white z-20"
          >
            {/* Dynamic Placeholder Animation when images missing */}
            <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gold rounded-full blur-3xl"
                />
                <Activity className="w-12 h-12 text-gold animate-pulse" strokeWidth={1} />
            </div>
            <div className="text-center px-6">
                <p className="text-[12px] font-black uppercase tracking-[0.2em] text-red-500/80 mb-4">
                  {hasError && !gifUrl ? "Visualization Offline" : "Protocol Live"}
                </p>
                {hasError && !gifUrl ? (
                  <div className="text-[10px] font-medium tracking-wide text-charcoal/60 leading-relaxed max-w-[280px] mx-auto text-center bg-charcoal/5 p-4 rounded-xl border border-charcoal/10">
                    <p className="font-bold text-charcoal mb-2 uppercase tracking-widest text-[9px]">Animation Error</p>
                    <p>The visualization for this protocol is currently unavailable.</p>
                  </div>
                ) : (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-charcoal/20 leading-relaxed max-w-[240px] mx-auto">
                     Visualization rendering... {currentSlug.replace(/_/g, ' ')}
                  </p>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={framing.initial}
        animate={framing.animate}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        className={`absolute inset-0 flex items-center justify-center ${framing.className} pointer-events-none`}
      >
        {gifUrl ? (
          <>
            {imageUrls.length > 1 ? (
              imageUrls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={searchTerm}
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    setIsLoaded(true);
                    setHasError(false);
                    setMediaStats({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
                  }}
                  onError={() => {
                    setGifUrl(null);
                    setImageUrls([]);
                  }}
                  className={`absolute inset-0 w-full h-full object-contain mix-blend-multiply transition-opacity duration-[1500ms] ease-in-out ${
                    isLoaded ? (frame - 1 === index ? 'opacity-100' : 'opacity-0') : 'opacity-0'
                  }`}
                />
              ))
            ) : (
              <img
                src={dynamicGifUrl || undefined}
                alt={searchTerm}
                referrerPolicy="no-referrer"
                onLoad={(e) => {
                  console.log("GIF Loaded successfully:", dynamicGifUrl);
                  setIsLoaded(true);
                  setHasError(false);
                  setMediaStats({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
                }}
                onError={(e) => {
                  console.warn("GIF specifically failed to load, falling back...", dynamicGifUrl);
                  setGifUrl(null);
                  setImageUrls([]);
                }}
                className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </>
        ) : (
          <motion.img
            key={isPreparing ? 'prep' : frameSrc}
            src={isPreparing ? `${framesBasePath}/frame_001.webp` : frameSrc}
            alt="Stretch Visualization"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onLoad={(e) => {
              setIsLoaded(true);
              setHasError(false);
              setMediaStats({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
            }}
            onError={() => {
              console.warn("Animation image load failed for:", currentSlug);
              if (frame > 1) {
                setFrame(1); // Handle missing end-frames by looping back early
              } else if (currentSlug !== "default_stretch") {
                setUseFallback(true);
              } else {
                setHasError(true);
                setIsLoaded(true); // Stop loader showing on error
              }
            }}
            className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
      </motion.div>

      {/* Status Overlay */}
      {!hideControls && (
        <div className="absolute bottom-4 left-6 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-charcoal/20'}`} />
          <span className="text-[8px] font-bold uppercase tracking-widest text-charcoal/30">
            {isPlaying ? 'Protocol Active' : 'Paused'}
          </span>
        </div>
      )}

      {useFallback && isLoaded && (
        <div className="absolute top-4 right-6">
          <span className="px-2 py-0.5 bg-charcoal/5 rounded-full text-[7px] font-bold uppercase tracking-widest text-charcoal/30 border border-charcoal/10">
            Standard Reference
          </span>
        </div>
      )}
    </div>
  );
}
