import React, { useState, useEffect, useRef } from "react";
import { HomePageSEO } from "../components/HomePageSEO";
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
import StretchAnimationPlayer from "../components/StretchAnimationPlayer";
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

          <div className="mt-6 relative w-full h-[256px] min-h-[256px] shrink-0 flex items-center justify-center overflow-hidden border border-white/10 bg-white/5 rounded-2xl group" style={{ minHeight: '256px', display: 'flex' }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50"></div>
            <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
            <div className="absolute inset-0 z-0 flex items-center justify-center p-4">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/OWnkNVfQCn8?si=toVLyh-iHMGjDJu6&autoplay=1&mute=1&loop=1&playlist=OWnkNVfQCn8&controls=0" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                className="w-full h-full rounded-xl pointer-events-none"
                allowFullScreen>
              </iframe>
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none border border-white/10 rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none overflow-hidden rounded-2xl">
              <div className="w-full h-[2px] bg-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.5)] transform -translate-y-full animate-[scan_3s_ease-in-out_infinite]"></div>
            </div>
            
            <style>
              {`
                @keyframes scan {
                  0%, 100% { transform: translateY(-100%); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { transform: translateY(256px); opacity: 0; }
                }
              `}
            </style>
          </div>

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
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-gold to-[#f0e6d2] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-charcoal/5 shadow-sm mb-10"
          >
            <Sparkles className="w-5 h-5 text-gold" />
            <h1 className="text-xs md:text-sm font-bold uppercase tracking-[0.15em] text-charcoal/80">
              AI Stretching Coaching Free Workout App
            </h1>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tight text-charcoal leading-[1.05] mb-8 px-2 max-w-5xl"
          >
            Improve Flexibility, <span className="text-gold font-serif italic font-normal">Fitness & Nutrition</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-charcoal/60 font-medium max-w-3xl mx-auto leading-relaxed mb-12 px-4"
          >
            The Stretching Program offers an AI-powered studio that designs a daily stretching routine. This innovative feature helps users grow younger and improve fitness using AI automation. You can plan your wellness and easily integrate this exercise into your daily life.
          </motion.p>
          
          <div className="w-full max-w-3xl mx-auto mb-12 relative z-20">
             <AICoachPrompt />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 w-full"
          >
            <Link
              to="/studio"
              className="group px-8 md:px-12 py-4 md:py-5 bg-charcoal text-cream rounded-[2rem] font-bold text-sm tracking-wide hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Floating Image Elements for Hero */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5, duration: 1 }}
           className="relative max-w-7xl mx-auto mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="hidden md:block col-span-1 transform translate-y-12">
               <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop" alt="Woman performing a deep stretching yoga pose on a mat" className="rounded-[2.5rem] shadow-2xl object-cover h-[400px] w-full" />
            </div>
            <div className="col-span-1 md:col-span-1 z-10 scale-105">
               <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200&auto=format&fit=crop" alt="Athletic person doing a plank exercise representing core fitness" className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full border-[8px] border-cream" />
            </div>
            <div className="hidden md:block col-span-1 transform -translate-y-8">
               <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop" alt="Healthy nutrition bowl with fresh vegetables and grains" className="rounded-[2.5rem] shadow-2xl object-cover h-[400px] w-full" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:mb-20">
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-charcoal mb-6">
              A Complete <span className="text-gold font-serif italic">Operating System</span><br/> for your ongoing wellness.
            </h3>
            <p className="text-lg text-charcoal/60 max-w-2xl font-medium">Design routines, track recovery, and dial in your nutrition all from a single intelligent platform designed for high-end performance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-cream rounded-[2.5rem] col-span-1 md:col-span-2 flex flex-col md:flex-row overflow-hidden group min-h-[400px] border border-charcoal/5 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center relative z-10">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                    <Layout className="w-6 h-6 text-gold" />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-bold text-charcoal mb-4 tracking-tight">Adaptive Routines</h4>
                  <p className="text-charcoal/60 font-medium text-lg leading-relaxed">Workouts that evolve with your daily recovery metrics and lifestyle factors, designed to provide ongoing balance and flexibility calibration.</p>
                </div>
                <div className="md:w-1/2 relative h-[250px] md:h-auto overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cream to-transparent md:hidden z-10" />
                  <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent hidden md:block z-10" />
                  <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop" alt="Person mapping out their morning stretching flow" className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
             </div>
             
             <div className="bg-charcoal text-cream rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between h-[400px]">
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <Activity className="w-6 h-6 text-gold" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3">Living Data</h4>
                  <p className="text-cream/60 font-medium leading-relaxed">Integrated telemetry creates a feedback loop for real-time adjustments.</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-xs uppercase tracking-wider text-white/50">Recovery Score</span>
                      <span className="text-sm font-bold text-gold">94%</span>
                   </div>
                   <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-gold h-full w-[94%] rounded-full"></div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Interactive Sandbox Section */}
      <section className="py-24 md:py-32 px-4 md:px-6 bg-cream border-t border-charcoal/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
             <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-charcoal mb-6">Experience the <span className="font-serif italic text-gold">Studio Workflow</span></h3>
             <p className="text-lg text-charcoal/60 max-w-2xl mx-auto font-medium">Test our AI orchestration engine instantly. Witness cinematic rendering and dynamic timeline construction in real time.</p>
          </div>
          
          <motion.div
            id="preview"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-left"
          >
            <div className="absolute inset-0 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
            <LiveDemoHero />
          </motion.div>
        </div>
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

      {/* SEO Content Section */}
      <section className="bg-cream border-t border-charcoal/5">
        <HomePageSEO />
      </section>
    </motion.div>
  );
}
