import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Target,
  Activity,
  Play,
  Pause,
  FastForward,
  CheckCircle2,
  User,
  Mic,
  Layout,
  Layers,
  Clock,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { transitionClasses, V } from "../lib/runtime/motion";
import { classifyWorkoutIntent } from "../api/client";

const COACHES = [
  {
    name: "Alex",
    color: "from-gold/20",
    accent: "bg-gold",
    text: "text-gold",
    shadow: "shadow-gold/30",
  },
  {
    name: "Sarah",
    color: "from-teal-500/20",
    accent: "bg-teal-500",
    text: "text-teal-400",
    shadow: "shadow-teal-500/30",
  },
  {
    name: "Marcus",
    color: "from-rose-500/20",
    accent: "bg-rose-500",
    text: "text-rose-400",
    shadow: "shadow-rose-500/30",
  },
];

const WORKFLOW_STEPS = [
  { id: "scan", label: "Analyzing Data" },
  { id: "build", label: "Building Timeline" },
  { id: "voice", label: "Generating Voice" },
  { id: "sync", label: "Syncing Captions" },
  { id: "ready", label: "Export Ready" },
];

const SUBTITLES = [
  "Inhale deep and find your center...",
  "Hold that position right there.",
  "Feel the tension slowly release...",
  "Exhale, reset, and let it go.",
];

const STORAGE_KEY = "stretching-pro:recovery-memory";

interface RecoveryMemory {
  focus: string;
  painPoints: string[];
  durationMinutes: number;
  goal: string;
  timestamp: number;
}

function AICoachPrompt() {
  const [prompt, setPrompt] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);

  // Adaptive memory state
  const [memory, setMemory] = useState<RecoveryMemory | null>(null);

  // New States for preview
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [transitionMsgIndex, setTransitionMsgIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMemory(parsed);
        // Pre-fill the input prompt to bias the next generation
        if (!prompt && parsed.focus) {
          setPrompt(`Continue recovery for ${parsed.focus}`);
        }
      }
    } catch (e) {
      console.error("[MEMORY] Failed to load recovery memory", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadingMessages = [
    "Analyzing posture restrictions...",
    "Mapping recovery patterns...",
    "Curating movement sequence...",
    "Hydrating cinematic studio...",
  ];

  const transitionMessages = [
    "Hydrating cinematic studio...",
    "Preparing adaptive timeline...",
    "Loading recovery engine...",
  ];

  const examplePrompts = memory
    ? [
        `Continue Recovery for ${memory.focus}`,
        `Deepen ${memory.focus} Mobility`,
        "Posture Reset",
        "Gentle Recovery",
        "Recovery Reload",
      ]
    : [
        "Recover from tight hips after running",
        "Morning mobility before desk work",
        "15 minute neck pain reset",
        "Post-leg-day recovery flow",
      ];

  useEffect(() => {
    const exampleInterval = setInterval(() => {
      if (!prompt && !isClassifying && !parsedIntent) {
        setExampleIndex((prev) => (prev + 1) % examplePrompts.length);
      }
    }, 4000);
    return () => clearInterval(exampleInterval);
  }, [prompt, isClassifying, parsedIntent, examplePrompts.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClassifying) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isClassifying, loadingMessages.length]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isClassifying || parsedIntent) return;

    setIsClassifying(true);
    try {
      const intent = await classifyWorkoutIntent(prompt);
      setIsClassifying(false);
      setParsedIntent(intent);

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            focus: intent.focus || "",
            painPoints: intent.painPoints || [],
            durationMinutes: intent.durationMinutes || 15,
            goal: intent.goal || "",
            timestamp: Date.now(),
          }),
        );
      } catch (e) {
        console.error("[MEMORY] Failed to save memory", e);
      }

      let msgIdx = 0;
      const tInterval = setInterval(() => {
        msgIdx++;
        setTransitionMsgIndex(msgIdx % transitionMessages.length);
      }, 600);

      setTimeout(() => {
        clearInterval(tInterval);
        navigate("/studio", {
          state: {
            wizardConfig: intent,
            autoGenerate: true,
            sourcePrompt: prompt,
          },
        });
      }, 1800);
    } catch (e) {
      console.error(e);
      // Fallback
      navigate("/studio", {
        state: {
          autoGenerate: true,
          sourcePrompt: prompt,
        },
      });
    }
  };

  const calculateDurations = (totalMinutes: number) => {
    if (!totalMinutes || totalMinutes < 5) totalMinutes = 15;
    return {
      warmup: Math.max(1, Math.round(totalMinutes * 0.2)),
      mobility: Math.max(2, Math.round(totalMinutes * 0.5)),
      recovery: Math.max(1, Math.round(totalMinutes * 0.2)),
      cooldown: Math.max(1, Math.round(totalMinutes * 0.1)),
    };
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-16 relative z-20">
      {memory && !parsedIntent && !isClassifying && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-col items-center mb-5"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 bg-charcoal shadow-sm rounded-full mb-2">
            <Activity className="w-3.5 h-3.5 text-gold animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-cream">
              Continuing mobility recovery progression
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-charcoal/60 tracking-wider">
            Balancing recovery load • Previous focus: {memory.focus} •{" "}
            {memory.durationMinutes}m calibrated
          </span>
        </motion.div>
      )}

      {!parsedIntent && !isClassifying && (
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-3 sm:pl-4 text-charcoal/60 text-[11px] font-bold uppercase tracking-widest hidden sm:flex h-5">
          <Sparkles className="w-3 h-3 text-gold" />
          <span>{memory ? "Suggested:" : "Try:"}</span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={exampleIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-charcoal/80"
            >
              "{examplePrompts[exampleIndex]}"
            </motion.span>
          </AnimatePresence>
        </div>
      )}

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="w-full bg-white/70 backdrop-blur-xl border border-charcoal/10 rounded-3xl p-2 sm:pl-6 sm:pr-2 flex flex-col sm:flex-row items-center gap-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] focus-within:bg-white focus-within:shadow-[0_0_40px_rgba(212,175,55,0.15)] focus-within:ring-2 focus-within:ring-gold/30 transition-all duration-300 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {parsedIntent ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-4 sm:p-6"
            >
              <div className="flex flex-col gap-6 w-full">
                {/* Intent Chips */}
                <div className="flex flex-wrap gap-2">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-3 py-1.5 rounded-full bg-charcoal/5 border border-charcoal/10 text-xs font-semibold text-charcoal/80 flex items-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5 text-gold" />{" "}
                    {parsedIntent.focus} Focus
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="px-3 py-1.5 rounded-full bg-charcoal/5 border border-charcoal/10 text-xs font-semibold text-charcoal/80 flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-gold" />{" "}
                    {parsedIntent.goal}
                  </motion.div>
                  {parsedIntent.painPoints?.map((p: string, i: number) => (
                    <motion.div
                      key={p}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-700 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" /> {p}
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="px-3 py-1.5 rounded-full bg-charcoal/5 border border-charcoal/10 text-xs font-semibold text-charcoal/80 flex items-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5 text-gold" />{" "}
                    {parsedIntent.durationMinutes}m Duration
                  </motion.div>
                </div>

                {/* Blueprint Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-charcoal text-cream rounded-2xl p-5 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(212,175,55,0.05)_50%,transparent_100%)] w-[200%] animate-[shimmer_3s_infinite]" />
                  <div className="flex items-center gap-2 mb-4 relative z-10">
                    <Layers className="w-4 h-4 text-gold" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">
                      Session Blueprint
                    </h3>
                  </div>

                  <div className="flex flex-col gap-3 relative z-10">
                    {[
                      {
                        name: "Warmup",
                        duration: calculateDurations(
                          parsedIntent.durationMinutes,
                        ).warmup,
                        delay: 0.7,
                      },
                      {
                        name: "Mobility Flow",
                        duration: calculateDurations(
                          parsedIntent.durationMinutes,
                        ).mobility,
                        delay: 0.8,
                      },
                      {
                        name: "Deep Recovery",
                        duration: calculateDurations(
                          parsedIntent.durationMinutes,
                        ).recovery,
                        delay: 0.9,
                      },
                      {
                        name: "Cooldown",
                        duration: calculateDurations(
                          parsedIntent.durationMinutes,
                        ).cooldown,
                        delay: 1.0,
                      },
                    ].map((phase, i) => (
                      <motion.div
                        key={phase.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: phase.delay }}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
                          <span className="font-medium text-white/80">
                            {phase.name}
                          </span>
                        </div>
                        <span className="font-mono text-white/50 text-xs">
                          {phase.duration}m
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={transitionMsgIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gold/80"
                      >
                        {transitionMessages[transitionMsgIndex]}
                      </motion.span>
                    </AnimatePresence>
                    <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full pl-6 pr-2 py-1 relative"
            >
              <div className="flex-1 w-full relative">
                <AnimatePresence>
                  {isClassifying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 backdrop-blur-md z-10 flex items-center gap-4 pr-2 rounded-xl"
                    >
                      <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-charcoal/5 border border-charcoal/10 w-full shadow-inner">
                        <Activity className="w-4 h-4 text-gold animate-pulse shrink-0" />
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={loadingStep}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-charcoal/80"
                          >
                            {loadingMessages[loadingStep]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <textarea
                  placeholder="Describe your mobility goal..."
                  className="w-full resize-none text-charcoal bg-transparent border-none outline-none text-[15px] sm:text-base placeholder:text-charcoal/30 h-[48px] pt-3 overflow-hidden block custom-scrollbar font-medium"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  disabled={isClassifying}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isClassifying || !prompt.trim()}
                className="relative overflow-hidden w-full sm:w-auto px-7 py-4 rounded-[1.2rem] bg-charcoal text-cream font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 whitespace-nowrap shadow-xl group"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.1)_60%,transparent_80%)] translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
                {isClassifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <span className="relative z-10 text-gold/90">
                      Building...
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="relative z-10">Auto-Build</span>
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-[10px] sm:text-xs font-semibold text-charcoal/50"
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-gold/70" /> 800+ verified
          movement assets
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-gold/70" /> Adaptive
          orchestration engine active
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-gold/70" /> Deterministic
          recovery safeguards enabled
        </span>
      </motion.div>
    </div>
  );
}

function SandboxOrchestrationMonitor() {
  const [orchestrationStep, setOrchestrationStep] = useState(0);

  const orchestrationTexts = [
    "Analyzing mobility restrictions...",
    "Balancing recovery pacing...",
    "Hydrating movement sequence...",
    "Generating cinematic transitions...",
    "Preparing adaptive coaching...",
    "Optimizing recovery cadence...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setOrchestrationStep((prev) => (prev + 1) % orchestrationTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [orchestrationTexts.length]);

  return (
    <div className="absolute inset-0 w-full h-full z-50 flex flex-col bg-charcoal/90 backdrop-blur-md overflow-hidden text-white/80 font-sans">
      {/* Top micro panel */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/70">
              OS Active
            </span>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <span className="text-[10px] font-mono text-white/40">
              SEQ_IDX: {String(orchestrationStep).padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/5">
            <Activity className="w-3 h-3 text-white/40" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/70">
              Orchestrator
            </span>
          </div>
          <div className="text-[10px] font-mono text-white/40 pr-2">
            MEM: 142MB / 512MB
          </div>
        </div>
      </div>

      {/* Central Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8 mt-12">
        <div className="relative mb-8">
          {/* Subtle glowing orb */}
          <div className="absolute inset-0 bg-gold/20 blur-[40px] rounded-full scale-150 animate-pulse" />

          <div className="w-24 h-24 rounded-full border-[1px] border-white/10 bg-black/40 flex items-center justify-center relative z-10">
            {/* Spinning ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/5 border-t-gold/50"
            />
            {/* Inner pulsating dot */}
            <div className="w-2 h-2 rounded-full bg-gold/80 shadow-[0_0_15px_rgba(212,175,55,0.8)] animate-pulse" />
          </div>
        </div>

        {/* Text readout */}
        <div className="h-12 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={orchestrationStep}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 text-[13px] tracking-wide font-medium text-white/90"
            >
              <Target className="w-4 h-4 text-gold/60" />
              {orchestrationTexts[orchestrationStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Fake timeline bars */}
        <div className="w-full max-w-[200px] mt-8 flex flex-col gap-1.5 opacity-40">
          {[40, 80, 60, 100, 50].map((width, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-white/10 w-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gold/40 rounded-full"
                animate={{
                  width: [
                    `${Math.max(10, width - 20)}%`,
                    `${width}%`,
                    `${Math.max(10, width - 20)}%`,
                  ],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-20">
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] uppercase tracking-widest text-white/30">
            Preview Policy
          </span>
          <span className="text-[10px] font-medium text-white/50 tracking-wide">
            Interactive Canvas Disabled (Sandbox)
          </span>
        </div>

        {/* Fake playback shimmer bar */}
        <div className="w-[120px] h-[3px] bg-white/10 rounded-full overflow-hidden self-center">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-gold/50 to-transparent blur-[1px]"
          />
        </div>
      </div>
    </div>
  );
}

function LiveDemoHero() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  const [activeCoachName, setActiveCoachName] = useState("Alex");
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const activeCoach =
    COACHES.find((c) => c.name === activeCoachName) || COACHES[0];

  // Safely initialize the Open Video Player
  useEffect(() => {
    // Detect sandbox/iframe preview environments safely
    const checkSandbox = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true; // CORS error on window.top access implies iframe
      }
    };

    const sandboxed = checkSandbox();
    setIsSandboxMode(sandboxed);

    if (sandboxed) return; // Do not initialize Ezoic in sandbox

    const el = videoContainerRef.current;
    if (!el) return;

    // Safety check to avoid double initialization
    if (el.hasAttribute("data-initialized")) return;
    el.setAttribute("data-initialized", "true");

    const w = window as any;
    if (!Array.isArray(w.openVideoPlayers)) {
      w.openVideoPlayers = [];
    }

    // Check if element is already registered (handles React Strict Mode double-mounts)
    const isRegistered = w.openVideoPlayers.some(
      (p: any) => p.target === "home-ezoic-player",
    );
    if (!isRegistered) {
      w.openVideoPlayers.push({ target: "home-ezoic-player" });
    }

    if (!document.querySelector('script[src="https://open.video/video.js"]')) {
      const script = document.createElement("script");
      script.src = "https://open.video/video.js";
      script.async = true;
      script.setAttribute("data-ezscrex", "false");
      script.setAttribute("data-cfasync", "false");
      script.id = "ezoic-player-script";
      document.body.appendChild(script);
    }

    // Cleanup on unmount/route transitions to prevent memory leaks
    return () => {
      if (Array.isArray(w.openVideoPlayers)) {
        w.openVideoPlayers = w.openVideoPlayers.filter(
          (p: any) => p.target !== "home-ezoic-player",
        );
      }
      el.removeAttribute("data-initialized");
    };
  }, []);

  // Auto progression of steps if playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setStepIndex((prev) => {
          if (prev >= WORKFLOW_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500); // Luxury pacing
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Subtitle progression
  useEffect(() => {
    let subInterval: NodeJS.Timeout;
    if (isPlaying && stepIndex >= 2 && stepIndex < 4) {
      subInterval = setInterval(() => {
        setSubtitleIndex((prev) => (prev + 1) % SUBTITLES.length);
      }, 2000);
    }
    return () => clearInterval(subInterval);
  }, [isPlaying, stepIndex]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 relative">
      {/* Left Panel: Active Coach & State */}
      <div className="lg:col-span-5 bg-charcoal text-cream rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl flex flex-col justify-between border border-charcoal/5 min-h-[500px]">
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${activeCoach.color} via-transparent to-transparent opacity-60 pointer-events-none transition-colors duration-1000`}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Activity
                className={`w-3 h-3 ${activeCoach.text} ${isPlaying ? "animate-pulse" : "opacity-50"} transition-all`}
              />
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-cream/70">
                System Live
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div
                className={`text-[10px] font-medium uppercase tracking-[0.2em] ${activeCoach.text} mb-4 opacity-80 transition-colors duration-500`}
              >
                Coach Identity
              </div>
              <div className="flex gap-2">
                {COACHES.map((coach) => (
                  <button
                    key={coach.name}
                    onClick={() => {
                      setActiveCoachName(coach.name);
                      setStepIndex(0);
                      setIsPlaying(true);
                      setSubtitleIndex(0);
                    }}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 active:scale-95 ${
                      activeCoachName === coach.name
                        ? `${coach.accent} text-charcoal shadow-md`
                        : "bg-white/5 text-cream/60 hover:bg-white/10 hover:text-cream/90"
                    }`}
                  >
                    {coach.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 group/state cursor-default">
              <div
                className={`text-[10px] font-medium uppercase tracking-[0.2em] ${activeCoach.text} mb-4 opacity-80 transition-colors duration-500`}
              >
                Transformation State
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative group-hover/state:bg-white/10 transition-colors">
                <motion.div
                  className={`absolute top-0 left-0 bottom-0 ${activeCoach.accent} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${((stepIndex + 1) / WORKFLOW_STEPS.length) * 100}%`,
                  }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="pt-2">
              <div
                className={`text-[10px] font-medium uppercase tracking-[0.2em] ${activeCoach.text} mb-4 opacity-80 transition-colors duration-500`}
              >
                Tone Matrix
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-cream/50">Pacing</span>
                  <span
                    className={`text-xs font-mono ${activeCoach.text} opacity-90 transition-colors`}
                  >
                    Dynamic
                  </span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-cream/50">Energy</span>
                  <span
                    className={`text-xs font-mono ${activeCoach.text} opacity-90 transition-colors`}
                  >
                    Uplifting
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Playback Control (Fake) */}
          <div className="relative z-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 backdrop-blur-sm mt-8 transition-colors duration-500 cursor-default">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (!isPlaying && stepIndex === WORKFLOW_STEPS.length - 1) {
                      setStepIndex(0);
                    }
                    setIsPlaying(!isPlaying);
                  }}
                  className={`w-12 h-12 rounded-full ${activeCoach.accent} text-charcoal flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-md ${activeCoach.shadow}`}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-sm font-medium text-cream mb-0.5 tracking-wide">
                    Preview Render
                  </div>
                  <div className="text-[10px] text-cream/40 uppercase tracking-[0.15em] transition-colors">
                    {isPlaying
                      ? "Processing..."
                      : stepIndex === WORKFLOW_STEPS.length - 1
                        ? "Ready"
                        : "Paused"}
                  </div>
                </div>
              </div>
              <FastForward className="w-5 h-5 text-cream/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Live Automation Flow & Browser Grid */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        {/* Cinematic Export System */}
        <div className="bg-charcoal/5 backdrop-blur-md rounded-[2.5rem] p-3 md:p-4 border border-charcoal/5 shadow-xl flex-1 flex flex-col relative overflow-hidden group min-h-[350px] md:min-h-[450px]">
          {/* Player Wrapper */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-charcoal flex flex-col items-center justify-center border border-white/5 shadow-inner">
            {/* Atmosphere layers */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none z-20 mix-blend-overlay" />

            {/* Loading State & Ambient OS UI */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 z-0">
              <Activity className="w-8 h-8 animate-pulse text-gold/50 mb-6" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/30">
                System Output Array
              </span>
            </div>

            {/* Dynamic Video Target or Sandbox Fallback */}
            {isSandboxMode ? (
              <SandboxOrchestrationMonitor />
            ) : (
              <div
                id="home-ezoic-player"
                ref={videoContainerRef}
                className="absolute inset-0 w-full h-full z-50 [&>iframe]:w-full [&>iframe]:h-full [&>div]:w-full [&>div]:h-full"
              />
            )}

            {/* OS UI Overlays */}
            <div className="absolute top-6 left-6 z-30 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-3 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/90">
                Live Export Preview
              </span>
            </div>
            <div className="absolute bottom-6 right-6 z-30 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/50">
                ENG-CORE-09
              </span>
            </div>
          </div>
        </div>

        {/* Templates selector to trigger flows */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "Morning Flow", icon: <Layout className="w-5 h-5" /> },
            { title: "Deep Recovery", icon: <User className="w-5 h-5" /> },
            { title: "Desk Reset", icon: <Target className="w-5 h-5" /> },
            { title: "Pre-Workout", icon: <Mic className="w-5 h-5" /> },
          ].map((tpl, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTemplate(idx);
                setStepIndex(0);
                setIsPlaying(true);
              }}
              className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col gap-3 hover:scale-[1.02] active:scale-[0.98] ${
                activeTemplate === idx
                  ? "bg-white border-gold/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-gold/20 translate-y-[-2px]"
                  : "bg-white/60 border-charcoal/5 hover:bg-white hover:border-charcoal/15 hover:shadow-md"
              }`}
            >
              <div
                className={`transition-colors duration-300 ${activeTemplate === idx ? "text-gold" : "text-charcoal/40"}`}
              >
                {tpl.icon}
              </div>
              <span
                className={`text-xs font-medium ${activeTemplate === idx ? "text-charcoal" : "text-charcoal/70"}`}
              >
                {tpl.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <motion.div
      initial={V.fadeUp.initial}
      animate={V.fadeUp.animate}
      exit={V.fadeUp.exit}
      transition={transitionClasses.system}
      className="bg-cream selection:bg-gold overflow-hidden w-full max-w-full relative min-h-screen"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4 md:py-6 backdrop-blur-md bg-cream/50 border-b border-charcoal/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-8">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/20">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-charcoal" />
              </div>
              <span className="text-lg md:text-xl font-serif italic text-charcoal font-bold tracking-tight">
                Stretching Pro
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors">Dashboard</Link>
              <Link to="/nutrition" className="text-[10px] font-black uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors">Nutrition</Link>
              <Link to="/recovery" className="text-[10px] font-black uppercase tracking-widest text-charcoal/60 hover:text-charcoal transition-colors">Recovery</Link>
            </nav>

            {/* Mobile Nav */}
            <nav className="flex lg:hidden items-center gap-3 overflow-x-auto no-scrollbar max-w-[150px]">
              <Link to="/dashboard" className="text-[8px] font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors whitespace-nowrap">Dashboard</Link>
              <Link to="/nutrition" className="text-[8px] font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors whitespace-nowrap">Nutrition</Link>
              <Link to="/recovery" className="text-[8px] font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors whitespace-nowrap">Recovery</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/studio"
              className="group text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 bg-charcoal px-4 md:px-6 py-2 md:py-3 rounded-full border border-charcoal/10 transition-all active:scale-95 shadow-xl shadow-charcoal/20"
            >
              Launch Studio
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 px-4 md:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-charcoal/5 border border-charcoal/10 mb-6 md:mb-8"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/60">
              Beta Access Now Live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-serif italic text-charcoal tracking-tighter leading-[1.1] mb-6 px-2"
          >
            Adaptive <span className="text-gold">Movement</span>{" "}
            <br className="hidden md:block" />
            Intelligence.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-charcoal/60 font-light max-w-4xl mx-auto leading-relaxed mb-8 md:mb-10 px-4"
          >
            Orchestrate professional movement systems and adaptive generation
            flows. From micro-routines to cinematic timelines, powered by{" "}
            <strong>living data</strong>.
          </motion.p>

          <AICoachPrompt />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4"
          >
            <Link
              to="/studio"
              className="group px-8 md:px-12 py-4 md:py-5 bg-charcoal text-cream rounded-full font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-4 text-sm md:text-base w-full sm:w-auto justify-center"
            >
              Enter Studio{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#preview"
              className="text-[10px] md:text-sm font-black uppercase tracking-[0.3em] text-charcoal/40 hover:text-charcoal transition-colors underline underline-offset-4 decoration-charcoal/20 hover:decoration-charcoal"
            >
              View Sandbox
            </a>
          </motion.div>
        </div>

        {/* Hero Visual: Stretching Pro Studio Block */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-7xl mx-auto mt-16 md:mt-24 relative z-10 text-left"
        >
          <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
          <LiveDemoHero />
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-40 px-4 md:px-6 bg-charcoal border-t border-charcoal/5">
        <div className="max-w-4xl mx-auto text-center space-y-8 md:space-y-12">
          <h2 className="text-4xl md:text-8xl font-serif italic text-cream tracking-tighter leading-tight">
            Begin Your <span className="text-gold">Orchestration</span>.
          </h2>
          <p className="text-xl text-cream/60 font-light leading-relaxed">
            Step into the movement operating system. Zero filming, zero
            disjointed workflows—just pure adaptive intelligence.
          </p>
          <div className="pt-6 px-4">
            <Link
              to="/studio"
              className="inline-flex items-center gap-4 px-8 md:px-16 py-6 md:py-8 bg-gold text-charcoal rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all text-sm md:text-base relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-4">
                Launch Studio{" "}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
