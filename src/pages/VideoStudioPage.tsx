import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Orchestrator,
  useOrchestrator,
  useOrchestratorTime,
} from "../lib/runtime/orchestrator";
import { RuntimeObserver } from "../lib/runtime/observability";
import { resolveVerifiedExercise } from "../utils/matchExercise";
import { Logo } from "../components/Logo";
import {
  Play,
  Pause,
  Download,
  Search,
  Plus,
  Minus,
  Check,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Monitor,
  Smartphone,
  Video,
  Type,
  Palette,
  LayoutGrid,
  Activity,
  Target,
  Zap,
  Mic2,
  FileText,
  Wand2,
  Loader2,
  Box,
  Music2,
  VolumeX,
  Brain,
  Shield,
  Heart,
  Dumbbell,
  Compass,
  TrendingUp,
  BarChart3,
  Calendar,
  Award,
  History,
  Music,
  Share2,
} from "lucide-react";
import { streakEngine } from "../features/athlete/services/streakEngine";
import { snapshotManager } from "../features/athlete-memory/services/snapshotManager";

import { recoveryInsightService } from "../features/recovery/services/recoveryInsightService";
import { generateAdaptiveDNA } from "../features/athlete-memory/services/adaptiveProfileEngine";
import { analyzeWeeklyEvolution } from "../features/athlete-memory/analytics/weeklyEvolutionAnalyzer";
import { buildAdaptiveStudioBootstrap } from "../features/athlete-memory/services/buildAdaptiveStudioBootstrap";
import { calculateSessionConfidence } from "../features/athlete-memory/services/sessionConfidenceEngine";
import { AdaptiveRecommendationCard } from "../features/athlete-memory/components/AdaptiveRecommendationCard";
import { SessionConfidenceCard } from "../features/athlete-memory/components/SessionConfidenceCard";

const TimeObserver = React.memo(
  ({
    render,
  }: {
    render: (timeState: {
      globalTime: number;
      localTime: number;
      activeSceneIndex: number;
    }) => React.ReactNode;
  }) => {
    const timeState = useOrchestratorTime();
    return <>{render(timeState)}</>;
  },
);

const PlaybackControlsTimeObserver = React.memo(
  ({ storyboard }: { storyboard: any[] }) => {
    const { globalTime } = useOrchestratorTime();
    return (
      <div className="space-y-1">
        <div className="text-[9px] md:text-[10px] font-mono text-cream/40 uppercase tabular-nums">
          {Math.floor((globalTime || 0) / 60)}:
          {Math.floor((globalTime || 0) % 60)
            .toString()
            .padStart(2, "0")}{" "}
          /{" "}
          {Math.ceil(
            storyboard.reduce((acc, curr) => acc + (curr.duration || 0), 0),
          )}
          s
        </div>
        <div
          className="w-24 md:w-48 h-2 bg-cream/10 rounded-full relative cursor-ew-resize group"
          onPointerDown={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const updateSeek = (clientX: number) => {
              const pos = Math.max(
                0,
                Math.min(1, (clientX - rect.left) / rect.width),
              );
              const totalDur = storyboard.reduce(
                (acc, curr) => acc + (curr.duration || 0),
                0,
              );
              Orchestrator.seek(pos * totalDur);
            };
            updateSeek(e.clientX);

            const onMove = (moveEv: PointerEvent) => {
              updateSeek(moveEv.clientX);
            };
            const onUp = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onUp);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onUp);
          }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 bg-gold/30 transition-all duration-75 group-hover:bg-gold/50"
            style={{
              width: `${storyboard.length ? Math.min(100, (globalTime / storyboard.reduce((acc, c) => acc + (c.duration || 0), 0)) * 100) : 0}%`,
            }}
          />
          <div
            className="absolute top-0 bottom-0 left-0 bg-gold transition-all duration-75"
            style={{
              width: `${storyboard.length ? Math.min(100, (globalTime / storyboard.reduce((acc, c) => acc + (c.duration || 0), 0)) * 100) : 0}%`,
            }}
          />
          <div
            className="absolute top-1/2 -mt-1 w-2 h-2 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `calc(${storyboard.length ? Math.min(100, (globalTime / storyboard.reduce((acc, c) => acc + (c.duration || 0), 0)) * 100) : 0}% - 4px)`,
            }}
          />
        </div>
      </div>
    );
  },
);

const SubtitleOverlay = React.memo(
  ({
    subtitlesEnabled,
    storyboard,
    activeItemIndex,
    aiScript,
    wizardConfig,
    currentProgression,
    subtitlePosition,
    subtitleStyle,
    subtitleSize,
    atmosphere,
    calculateReadiness,
    COACH_PROFILES,
  }: any) => {
    const { localTime: currentTime } = useOrchestratorTime();
    const currentSubtitle = useMemo(() => {
      if (!subtitlesEnabled || storyboard.length === 0 || !aiScript)
        return null;
      const activeItem = storyboard[activeItemIndex];
      if (!activeItem) return null;

      const sceneScript = aiScript.find(
        (s: any) =>
          s.exerciseName?.trim().toLowerCase() ===
          activeItem.name?.trim().toLowerCase(),
      );
      if (!sceneScript?.script) return null;

      const scriptText = sceneScript.script;
      const duration = activeItem.duration;

      const words = scriptText.split(/\s+/).filter(Boolean);
      if (words.length === 0) return null;

      const chunks = [];
      let currentChunk = [];

      for (let i = 0; i < words.length; i++) {
        currentChunk.push(words[i]);
        const isPunctuation = /[,.?!]/.test(words[i]);
        if (
          (currentChunk.length >= 4 && isPunctuation) ||
          currentChunk.length >= 7
        ) {
          chunks.push({
            text: currentChunk.join(" "),
            wordCount: currentChunk.length,
          });
          currentChunk = [];
        }
      }
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.join(" "),
          wordCount: currentChunk.length,
        });
      }

      let currentStart = 0;
      const totalWords = words.length;
      for (const chunk of chunks) {
        const chunkDuration = (chunk.wordCount / totalWords) * duration;
        const end = currentStart + chunkDuration;
        if (currentTime >= currentStart && currentTime < end) {
          const activeCoach =
            COACH_PROFILES.find(
              (e: any) => e.id === wizardConfig.selectedCoachId,
            ) || COACH_PROFILES[0];
          const readiness =
            currentProgression && calculateReadiness
              ? calculateReadiness(currentProgression)
              : { score: 80 };
          return {
            text: chunk.text,
            coachStyle: activeCoach.subtitleStyle,
            isPeak: readiness.score > 90,
          };
        }
        currentStart = end;
      }
      return null;
    }, [
      activeItemIndex,
      currentTime,
      aiScript,
      storyboard,
      subtitlesEnabled,
      wizardConfig.selectedCoachId,
      currentProgression,
      calculateReadiness,
      COACH_PROFILES,
    ]);

    if (!subtitlesEnabled || !currentSubtitle?.text) return null;

    return (
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSubtitle.text}
          initial={{ opacity: 0, y: 5, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className={`absolute w-full px-8 pointer-events-none z-30 flex items-center justify-center ${subtitlePosition === "bottom" ? "bottom-8 md:bottom-12" : "top-8 md:top-12"}`}
        >
          <span
            className={`text-center font-bold tracking-tight px-4 py-2 backdrop-blur-sm shadow-xl transition-all duration-500 ${currentSubtitle.coachStyle.font} ${currentSubtitle.coachStyle.background} ${
              subtitleStyle === "bold"
                ? "font-black italic tracking-tighter uppercase rounded-sm border-2 border-charcoal"
                : subtitleStyle === "minimal"
                  ? "rounded-full px-6 border border-charcoal/10"
                  : "rounded-xl border border-white/10"
            } ${
              subtitleSize === "small"
                ? "text-sm md:text-base"
                : subtitleSize === "medium"
                  ? "text-lg md:text-xl"
                  : "text-2xl md:text-3xl"
            }`}
            style={{
              color: currentSubtitle.coachStyle.color,
              boxShadow: currentSubtitle.isPeak
                ? `0 0 20px ${atmosphere?.glowColor || "rgba(234,179,8,0.3)"}`
                : undefined,
              borderColor: currentSubtitle.isPeak
                ? atmosphere?.primaryColor
                : undefined,
            }}
          >
            {currentSubtitle.text}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  },
);

const MasterReviewPlayer = React.lazy(() =>
  import("../components/MasterReviewPlayer").then((module) => ({
    default: module.MasterReviewPlayer,
  })),
);
import StretchAnimationPlayer from "../components/StretchAnimationPlayer";
import { Exercise, EXERCISE_DATABASE } from "../data/exercises";
import {
  calculateReadiness,
  getProgressionFromReports,
  PRESET_PROGRAMS,
  UserProgression,
  Program,
  getDailyInspiration,
  GOAL_JOURNEYS,
  GoalJourney,
  TransformationNarrative,
  getTransformationNarrative,
  TRANSFORMATION_THEMES,
  TransformationThemeId,
} from "../lib/programming";
import { WorkoutReport } from "../lib/reports";
import { CoachProfile, COACH_PROFILES } from "../lib/coaching";
import { calculateAtmosphere } from "../lib/runtime/atmosphere";
import {
  getAdaptiveState,
  getStateAmbientClasses,
  getStateMotionMultiplier,
} from "../lib/runtime/adaptive";
import { transitionClasses, V } from "../lib/runtime/motion";

interface StoryboardItem extends Exercise {
  duration: number;
  baseDuration: number;
  instanceId: string;
  reason?: string;
}

const SOUNDTRACKS = {
  none: { name: "No Music", url: "" },
  calm: {
    name: "Calm Atmosphere",
    url: "https://ia601402.us.archive.org/8/items/cd_relaxing-instrumentals_various-artists-antonio-carlos-jobim-art-/disc1/01.%20Novi%20Trio%20-%20Relaxing%20%5Bexcerpt%5D_sample.mp3",
  },
  focus: {
    name: "Deep Focus",
    url: "https://ia800408.us.archive.org/30/items/cd_ambient-1-music-for-airports_brian-eno/disc1/01.%20Brian%20Eno%20-%201%201_sample.mp3",
  },
  energy: {
    name: "Active Flow",
    url: "https://ia800109.us.archive.org/6/items/cd_energy_energy-energy-/disc1/02.%20Energy%20-%20Energy_sample.mp3",
  },
  minimal: {
    name: "Minimal Tech",
    url: "https://ia600100.us.archive.org/24/items/cd_minimal-music_steve-reich-terry-riley/disc1/01.%20Steve%20Reich%20-%20Piano%20Phase_sample.mp3",
  },
};

type CreatorModeId =
  | "tiktok"
  | "shorts"
  | "reels"
  | "landscape"
  | "square"
  | "wellness"
  | "explainer"
  | "countdown"
  | "faceless"
  | "reel";

interface CreatorMode {
  id: CreatorModeId;
  label: string;
  description: string;
  pacing: "natural" | "energetic" | "relaxed";
  soundtrack: keyof typeof SOUNDTRACKS;
  framing: "fit" | "focus" | "cinematic";
  subtitles: {
    enabled: boolean;
    size: "small" | "medium" | "large";
    position: "top" | "bottom";
    style: "classic" | "bold" | "minimal";
  };
  hookPrefix: string;
  minimalUI?: boolean;
}

const CREATOR_MODES: CreatorMode[] = [
  {
    id: "tiktok",
    label: "TikTok Vertical",
    description: "Punchy intervals with high-engagement subtitles",
    pacing: "energetic",
    soundtrack: "energy",
    framing: "focus",
    subtitles: {
      enabled: true,
      size: "large",
      position: "bottom",
      style: "bold",
    },
    hookPrefix: "FIX THIS FAST:",
  },
  {
    id: "shorts",
    label: "YouTube Shorts",
    description: "Fast pacing for quick value delivery",
    pacing: "energetic",
    soundtrack: "minimal",
    framing: "cinematic",
    subtitles: {
      enabled: true,
      size: "medium",
      position: "bottom",
      style: "classic",
    },
    hookPrefix: "DAILY RESET:",
  },
  {
    id: "reels",
    label: "Instagram Reels",
    description: "Visually driven with central focus",
    pacing: "energetic",
    soundtrack: "energy",
    framing: "fit",
    subtitles: {
      enabled: true,
      size: "medium",
      position: "bottom",
      style: "minimal",
    },
    hookPrefix: "TRY THIS:",
  },
  {
    id: "landscape",
    label: "Standard Landscape",
    description: "Classic wide format for deeper value",
    pacing: "natural",
    soundtrack: "focus",
    framing: "cinematic",
    subtitles: {
      enabled: true,
      size: "small",
      position: "bottom",
      style: "classic",
    },
    hookPrefix: "GUIDED:",
  },
  {
    id: "square",
    label: "Square Preview",
    description: "1:1 ratio for feed adaptability",
    pacing: "natural",
    soundtrack: "minimal",
    framing: "fit",
    subtitles: {
      enabled: true,
      size: "medium",
      position: "bottom",
      style: "bold",
    },
    hookPrefix: "QUICK FLOW:",
  },
  {
    id: "wellness",
    label: "Calm Wellness",
    description: "Soft transitions and peaceful vibes",
    pacing: "relaxed",
    soundtrack: "calm",
    framing: "cinematic",
    subtitles: {
      enabled: true,
      size: "small",
      position: "top",
      style: "minimal",
    },
    hookPrefix: "RECOVERY FLOW:",
  },
  {
    id: "explainer",
    label: "Coach Explainer",
    description: "Educational focus with centered captions",
    pacing: "natural",
    soundtrack: "focus",
    framing: "fit",
    subtitles: {
      enabled: true,
      size: "medium",
      position: "bottom",
      style: "classic",
    },
    hookPrefix: "COACH TIP:",
  },
  {
    id: "countdown",
    label: "Countdown Timer",
    description: "Urgency-driven with minimal interface",
    pacing: "energetic",
    soundtrack: "energy",
    framing: "focus",
    subtitles: {
      enabled: true,
      size: "large",
      position: "top",
      style: "minimal",
    },
    hookPrefix: "LET'S WORK:",
    minimalUI: true,
  },
  {
    id: "faceless",
    label: "Faceless Motivation",
    description: "Cinematic shots with bold typography",
    pacing: "relaxed",
    soundtrack: "minimal",
    framing: "cinematic",
    subtitles: {
      enabled: true,
      size: "large",
      position: "bottom",
      style: "bold",
    },
    hookPrefix: "MINDSET:",
    minimalUI: true,
  },
];

const STUDIO_TEMPLATES = [
  {
    id: "morning",
    name: "Morning Mobility",
    description:
      "Gentle stretches to wake up the joints and boost circulation.",
    duration: 60,
    pacing: "natural",
    soundtrack: "calm",
    exercises: ["Neck Circles", "Shoulder Rolls", "Cat Cow", "Child's Pose"],
    focus: "Full Body",
    level: "Beginner",
    type: "Mobility",
  },
  {
    id: "desk",
    name: "Desk Reset",
    description:
      "Counteract 8 hours of sitting with targeted upper body relief.",
    duration: 60,
    pacing: "natural",
    soundtrack: "focus",
    exercises: [
      "Triceps Stretch",
      "Seated Forward Bend",
      "Neck Stretch",
      "Hip Opener",
    ],
    focus: "Upper Body",
    level: "Beginner",
    type: "Mobility",
  },
  {
    id: "fatburn",
    name: "Beginner Fat Burn",
    description: "High-energy cardio movements to kickstart weight loss.",
    duration: 300,
    pacing: "energetic",
    soundtrack: "energy",
    exercises: ["Jumping Jacks", "High Knees", "Mountain Climbers", "Burpees"],
    focus: "Full Body",
    level: "Beginner",
    type: "Cardio",
  },
  {
    id: "strength",
    name: "Strength Fundamentals",
    description: "Classic resistance patterns for muscle building.",
    duration: 900,
    pacing: "natural",
    soundtrack: "minimal",
    exercises: ["Squats", "Push Ups", "Plank", "Lunges"],
    focus: "Full Body",
    level: "Beginner",
    type: "Strength",
  },
  {
    id: "hiit",
    name: "HIIT Blast",
    description: "Maximum intensity intervals for conditioning.",
    duration: 600,
    pacing: "energetic",
    soundtrack: "energy",
    exercises: ["Sprints", "Box Jumps", "Burpees", "Kettlebell Swings"],
    focus: "Full Body",
    level: "Intermediate",
    type: "HIIT",
  },
  {
    id: "functional",
    name: "Functional Core",
    description: "Stability and control for real-world strength.",
    duration: 600,
    pacing: "natural",
    soundtrack: "focus",
    exercises: ["Dead Bug", "Bird Dog", "Russian Twists", "Side Plank"],
    focus: "Core",
    level: "Intermediate",
    type: "Functional",
  },
];

const WORKOUT_TYPES = [
  {
    id: "Stretching",
    label: "Stretching",
    description: "Flexibility & Posture",
    icon: "Zap",
  },
  {
    id: "Mobility",
    label: "Mobility",
    description: "Recovery & Joint Health",
    icon: "Target",
  },
  {
    id: "Cardio",
    label: "Cardio",
    description: "Endurance & Fat Burn",
    icon: "Activity",
  },
  {
    id: "Strength",
    label: "Strength",
    description: "Muscle & Performance",
    icon: "Layers",
  },
  {
    id: "HIIT",
    label: "HIIT",
    description: "Intensity & Conditioning",
    icon: "Zap",
  },
  {
    id: "Balance",
    label: "Balance",
    description: "Stability & Control",
    icon: "Check",
  },
  {
    id: "Functional",
    label: "Functional",
    description: "Real-World Strength",
    icon: "Box",
  },
];

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
);

export default function VideoStudioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingConfirm, setPendingConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);
  // Safe ID generator
  const generateId = useCallback(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.crypto &&
        window.crypto.randomUUID
      ) {
        return window.crypto.randomUUID();
      }
    } catch (e) {
      // Fallback
    }
    return Math.random().toString(36).substring(2, 11);
  }, []);

  const isClient = typeof window !== "undefined";
  const safeInnerWidth = isClient ? window.innerWidth : 1440;
  const isMobileViewport = safeInnerWidth <= 768;

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [storyboard, setStoryboard] = useState<StoryboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    activeSceneIndex: activeItemIndex,
    playbackState,
    totalDuration,
  } = useOrchestrator();
  const isPaused = playbackState !== "playing";

  const [isRecording, setIsRecording] = useState(false);
  const [exportState, setExportState] = useState<
    | "idle"
    | "preparing"
    | "rendering"
    | "packaging"
    | "ready"
    | "review"
    | "failed"
  >("idle");
  const [renderProgress, setRenderProgress] = useState(0);
  const renderBlobUrlRef = useRef<string | null>(null);
  const lastRenderProgressRef = useRef(0);
  const [showWizard, setShowWizard] = useState(true);
  const [isInitializingProtocol, setIsInitializingProtocol] = useState(false);
  const [wizardTab, setWizardTab] = useState<"custom" | "templates">(
    "templates",
  );
  const [seoMetadata, setSeoMetadata] = useState<any>(null);
  const [socialCaptions, setSocialCaptions] = useState<any>(null);
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [showSEOSection, setShowSEOSection] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">(
    "9:16",
  );
  const [vibe, setVibe] = useState<"minimal" | "technical" | "high-energy">(
    "technical",
  );
  const [framingMode, setFramingMode] = useState<"fit" | "focus" | "cinematic">(
    "cinematic",
  );
  const [transitionStyle, setTransitionStyle] = useState<
    "none" | "subtle" | "medium"
  >("subtle");

  // Athlete Memory State
  const [athleteDNA, setAthleteDNA] = useState<any>(null);
  const [evolutionMetrics, setEvolutionMetrics] = useState<any>(null);
  const [bootstrapPresets, setBootstrapPresets] = useState<any>(null);
  const [activeCreatorMode, setActiveCreatorMode] =
    useState<CreatorModeId | null>(null);
  const [hookTitle, setHookTitle] = useState("");

  // Subtitles
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [subtitleSize, setSubtitleSize] = useState<
    "small" | "medium" | "large"
  >("medium");
  const [subtitlePosition, setSubtitlePosition] = useState<"top" | "bottom">(
    "bottom",
  );
  const [subtitleStyle, setSubtitleStyle] = useState<
    "classic" | "bold" | "minimal"
  >("classic");

  const applyCreatorMode = useCallback(
    (modeId: CreatorModeId, currentConfig?: any) => {
      const mode = CREATOR_MODES.find((m) => m.id === modeId);
      if (!mode) return;

      setActiveCreatorMode(modeId);
      setPacingMode(mode.pacing);
      setSoundtrackPreset(mode.soundtrack);
      setFramingMode(mode.framing);
      setSubtitlesEnabled(mode.subtitles.enabled);
      setSubtitleSize(mode.subtitles.size);
      setSubtitlePosition(mode.subtitles.position);
      setSubtitleStyle(mode.subtitles.style);
      
      // Auto-set aspect ratio based on creator mode
      if (["tiktok", "shorts", "reels", "wellness", "explainer", "countdown", "faceless", "reel"].includes(modeId)) {
        setAspectRatio("9:16");
        console.log(`[SOCIAL] Vertical export mode enabled (${modeId})`);
      } else if (modeId === "landscape") {
        setAspectRatio("16:9");
        console.log(`[SOCIAL] Landscape export mode enabled`);
      } else if (modeId === "square") {
        setAspectRatio("1:1");
        console.log(`[SOCIAL] Square export mode enabled`);
      }

      // Auto-generate hook if empty
      if (!hookTitle && storyboard.length > 0 && currentConfig) {
        // --- Social & Viral Automation Layer ---
        import("../lib/socialExportEngine").then(({ generateHookOverlay }) => {
          setHookTitle(generateHookOverlay(currentConfig));
          console.log(`[SOCIAL] Hook overlay injected: ${mode.hookPrefix}`);
        });
      }
    },
    [storyboard, hookTitle],
  );

  // Editor Shortcuts & History
  const [undoStack, setUndoStack] = useState<StoryboardItem[][]>([]);
  const pushUndo = useCallback((state: StoryboardItem[]) => {
    setUndoStack((prev) => {
      const newStack = [...prev, state];
      if (newStack.length > 20) newStack.shift();
      return newStack;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      const previousState = newStack.pop();
      if (previousState) {
        setStoryboard(previousState);
        const nextIndex = Math.min(
          activeItemIndex,
          Math.max(0, previousState.length - 1),
        );
        Orchestrator.seekToScene(nextIndex, 0);
      }
      return newStack;
    });
  }, []);

  // Timeline
  const [timelineZoom, setTimelineZoom] = useState<
    "compact" | "normal" | "expanded"
  >("normal");
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const navRailRef = useRef<HTMLDivElement>(null);
  const isNavDraggingRef = useRef(false);

  // Real Native Browser Export State
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const exportRafRef = useRef<number | null>(null);
  const exportCancelledRef = useRef<boolean>(false);
  const exportMimeTypeRef = useRef<string>("video/mp4");
  const [exportErrorMsg, setExportErrorMsg] = useState<string | null>(null);

  // Manage Export Stop on End (or Pause)
  useEffect(() => {
    if (isRecording && isPaused) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        exportCancelledRef.current = true;
        mediaRecorderRef.current.stop();
      }
    }
  }, [isRecording, isPaused]);

  // Deep Cleanup on Unmount
  useEffect(() => {
    return () => {
      Orchestrator.pause();
      if (exportRafRef.current) {
        clearTimeout(exportRafRef.current);
      }
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        exportCancelledRef.current = true;
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // Sync Temporal Engine
  useEffect(() => {
    Orchestrator.setScenes(
      storyboard.map((item) => ({
        id: item.instanceId || item.id,
        duration: item.duration || 5,
      })),
    );
  }, [storyboard]);

  // Daily Limit Tracking
  const [dailyExports, setDailyExports] = useState(0);
  const MAX_DAILY_EXPORTS = 3;

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedData = localStorage.getItem(`stretchingpro_exports_${today}`);
    if (savedData) {
      setDailyExports(parseInt(savedData));
    }
  }, []);

  const incrementDailyExport = () => {
    const today = new Date().toISOString().split("T")[0];
    const newCount = dailyExports + 1;
    setDailyExports(newCount);
    localStorage.setItem(`stretchingpro_exports_${today}`, newCount.toString());
  };

  // AI Automation State
  const [aiScript, setAiScript] = useState<
    { exerciseName: string; script: string }[]
  >([]);
  const [intelligenceLogs, setIntelligenceLogs] = useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [restored, setRestored] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "assets" | "script" | "growth" | "progression" | "music" | "format"
  >("assets");
  const lastPlayedNarrationRef = useRef<number>(-1);
  const [videoGenerations, setVideoGenerations] = useState<{
    [instanceId: string]: string;
  }>({});
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<{
    [instanceId: string]: boolean;
  }>({});
  const [isAudioUIBuffering, setIsAudioUIBuffering] = useState(false);
  const setIsAudioBuffering = useCallback((loading: boolean) => {
    setIsAudioUIBuffering(loading);
    Orchestrator.setAudioBuffering(loading);
  }, []);
  const [hasDismissedHelper, setHasDismissedHelper] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDurationMinutes((Date.now() - sessionStartTime) / 60000);
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Onboarding persistence
  useEffect(() => {
    const hidden = localStorage.getItem("stretchingpro_hide_onboarding");
    if (hidden) setHasDismissedHelper(true);
  }, []);

  const dismissOnboarding = () => {
    setHasDismissedHelper(true);
    localStorage.setItem("stretchingpro_hide_onboarding", "true");
  };

  // Audio System Refs
  const activeBlueprintIdRef = useRef<string | null>(null);
  const soundtrackAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null,
  );
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const soundtrackGainNodeRef = useRef<GainNode | null>(null);
  const soundtrackSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(
    null,
  );
  const audioPreloadMap = useRef<Map<string, HTMLAudioElement>>(new Map());
  const pendingPreloads = useRef<Map<string, Promise<HTMLAudioElement>>>(
    new Map(),
  );
  const lastNarrationUrlRef = useRef<string | null>(null);

  const [workoutSummary, setWorkoutSummary] = useState<any>(null);
  const [workoutReports, setWorkoutReports] = useState<WorkoutReport[]>([]);
  const [currentProgression, setCurrentProgression] =
    useState<UserProgression | null>(null);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [currentJourneyId, setCurrentJourneyId] = useState<string>(
    GOAL_JOURNEYS[0].id,
  );
  const [selectedStoryThemeId, setSelectedStoryThemeId] =
    useState<TransformationThemeId>("journey-update");
  const [showPhaseComplete, setShowPhaseComplete] = useState<string | null>(
    null,
  );
  const [generationMessage, setGenerationMessage] = useState<string | null>(
    null,
  );

  // Adaptive Presence Engine
  const adaptiveState = useMemo(
    () => getAdaptiveState(currentProgression, sessionDurationMinutes),
    [currentProgression, sessionDurationMinutes],
  );
  const ambientClasses = useMemo(
    () => getStateAmbientClasses(adaptiveState),
    [adaptiveState],
  );
  const motionMultiplier = useMemo(
    () => getStateMotionMultiplier(adaptiveState),
    [adaptiveState],
  );

  // Visibility Guard: Pause when tab hidden to prevent sync drift or memory buildup
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        Orchestrator.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Timeline Pacing Intelligence Logic
  const [pacingMode, setPacingMode] = useState<
    "natural" | "energetic" | "relaxed"
  >("natural");

  const applyPacingIntelligence = useCallback(
    (items: StoryboardItem[]) => {
      if (items.length === 0) return items;

      return items.map((item, index) => {
        let durationWeight = 1.0;

        // Opening scenes (first 15%) slightly slower for atmosphere
        if (index / items.length < 0.15) {
          durationWeight = pacingMode === "relaxed" ? 1.25 : 1.15;
        }
        // Ending scenes (last 15%) softer/slower for cool down
        else if (index / items.length > 0.85) {
          durationWeight = pacingMode === "relaxed" ? 1.4 : 1.2;
        }
        // Mid-routine energetic push
        else if (pacingMode === "energetic") {
          durationWeight = 0.85;
        }

        return {
          ...item,
          duration: Math.round(
            (item.baseDuration || 10) * (durationWeight || 1),
          ),
        };
      });
    },
    [pacingMode],
  );

  // Sync pacing when mode changes
  useEffect(() => {
    setStoryboard((prev) => applyPacingIntelligence(prev));
  }, [pacingMode, applyPacingIntelligence]);

  const [soundtrackPreset, setSoundtrackPreset] =
    useState<keyof typeof SOUNDTRACKS>("none");
  const [soundtrackVolume, setSoundtrackVolume] = useState(0.25);
  const [isSoundtrackEnabled, setIsSoundtrackEnabled] = useState(true);

  const setupAudioContext = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          audioDestinationRef.current =
            audioContextRef.current.createMediaStreamDestination();
        }
      }

      const ctx = audioContextRef.current;
      if (ctx) {
        if (ctx.state === "suspended") {
          ctx
            .resume()
            .catch((err) =>
              console.error("[AudioEngine] Failed to resume Context:", err),
            );
        }

        // Setup Soundtrack
        if (soundtrackAudioRef.current && !soundtrackSourceNodeRef.current) {
          try {
            soundtrackSourceNodeRef.current = ctx.createMediaElementSource(
              soundtrackAudioRef.current,
            );

            soundtrackGainNodeRef.current = ctx.createGain();
            soundtrackGainNodeRef.current.gain.value = isSoundtrackEnabled
              ? soundtrackVolume
              : 0;

            soundtrackSourceNodeRef.current.connect(
              soundtrackGainNodeRef.current,
            );
            soundtrackGainNodeRef.current.connect(ctx.destination);
            if (audioDestinationRef.current) {
              soundtrackGainNodeRef.current.connect(
                audioDestinationRef.current,
              );
            }
          } catch (e) {
            console.warn(
              "[AudioEngine] Failed to connect soundtrack source:",
              e,
            );
          }
        }
      }
      return ctx;
    } catch (globalErr) {
      console.error("[AudioEngine] Critical Setup Error:", globalErr);
      return null;
    }
  }, [isSoundtrackEnabled, soundtrackVolume]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current
          .close()
          .catch((e) => console.error("[AudioEngine] Error closing AudioContext:", e));
      }
    };
  }, []);

  // Handle Soundtrack Playback and Ducking
  useEffect(() => {
    if (!soundtrackAudioRef.current) return;

    const track = SOUNDTRACKS[soundtrackPreset];
    if (track.url && isSoundtrackEnabled && !isPaused) {
      if (soundtrackAudioRef.current.src !== track.url) {
        soundtrackAudioRef.current.src = track.url;
        soundtrackAudioRef.current.loop = true;
      }

      const ctx = setupAudioContext();
      const triggerPlay = () => {
        soundtrackAudioRef.current?.play().catch((err) => {
          console.warn("[AudioEngine] Soundtrack play failed:", err);
        });
      };

      if (ctx?.state === "suspended") {
        ctx
          .resume()
          .then(triggerPlay)
          .catch((err) => {
            console.warn("[AudioEngine] Soundtrack ctx.resume failed:", err);
            triggerPlay();
          });
      } else {
        triggerPlay();
      }
    } else {
      soundtrackAudioRef.current.pause();
    }
  }, [soundtrackPreset, isSoundtrackEnabled, isPaused, setupAudioContext]);

  // Volume slider update
  useEffect(() => {
    if (soundtrackGainNodeRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      soundtrackGainNodeRef.current.gain.setTargetAtTime(
        isSoundtrackEnabled ? soundtrackVolume : 0,
        now,
        0.1,
      );
    }
  }, [soundtrackVolume, isSoundtrackEnabled]);

  // Audio end decay (Final Audio Presence Pass)
  useEffect(() => {
    return Orchestrator.subscribeTime((state) => {
      if (!soundtrackGainNodeRef.current || !audioContextRef.current) return;
      const now = audioContextRef.current.currentTime;
      const globalTime = state.globalTime;

      // Decay starts 1 second before total duration ends
      const isEnding =
        globalTime > 0 && totalDuration > 0 && globalTime > totalDuration - 1.5;

      // Override standard ducking if ending
      if (isEnding) {
        soundtrackGainNodeRef.current.gain.setTargetAtTime(0, now, 0.4); // graceful tail
      } else {
        // Maintain volume based on track settings
        soundtrackGainNodeRef.current.gain.setTargetAtTime(
          isSoundtrackEnabled ? soundtrackVolume : 0,
          now,
          0.1,
        );
      }
    });
  }, [totalDuration, soundtrackVolume, isSoundtrackEnabled]);

  // Sync state reference for animation loop
  const studioStateRef = useRef({
    storyboard,
    activeItemIndex,
    currentTime: 0,
    globalTime: 0,
    isRecording,
    aspectRatio,
    framingMode,
    transitionStyle,
    subtitlesEnabled,
    subtitleSize,
    subtitlePosition,
    subtitleStyle,
    hookTitle,
    activeCreatorMode,
    aiScript,
    soundtrackPreset,
    soundtrackVolume,
    isSoundtrackEnabled,
    selectedStoryThemeId,
  });

  useEffect(() => {
    studioStateRef.current = {
      ...studioStateRef.current,
      storyboard,
      activeItemIndex,
      isRecording,
      aspectRatio,
      framingMode,
      transitionStyle,
      subtitlesEnabled,
      subtitleSize,
      subtitlePosition,
      subtitleStyle,
      hookTitle,
      activeCreatorMode,
      aiScript,
      soundtrackPreset,
      soundtrackVolume,
      isSoundtrackEnabled,
      selectedStoryThemeId,
    };
  }, [
    storyboard,
    activeItemIndex,
    isRecording,
    aspectRatio,
    framingMode,
    transitionStyle,
    subtitlesEnabled,
    subtitleSize,
    subtitlePosition,
    subtitleStyle,
    hookTitle,
    activeCreatorMode,
    aiScript,
    soundtrackPreset,
    soundtrackVolume,
    isSoundtrackEnabled,
    selectedStoryThemeId,
  ]);

  // Timeline horizontal scroll support
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    let velocity = 0;
    let lastX: number;
    let lastTime: number;
    let rafId: number | null = null;

    const applyInertia = () => {
      if (isDown) return;
      if (Math.abs(velocity) > 0.5) {
        el.scrollLeft -= velocity;
        velocity *= 0.92; // Friction
        rafId = requestAnimationFrame(applyInertia);
      } else {
        velocity = 0;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDraggingRef.current = false;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      lastX = e.pageX;
      lastTime = performance.now();

      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const handleMouseLeave = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("cursor-grabbing");
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
      applyInertia();
    };

    const handleMouseUp = () => {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("cursor-grabbing");
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
      applyInertia();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();

      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.0; // 1:1 Unified Tactile Tracking

      if (Math.abs(walk) > 5) {
        isDraggingRef.current = true;
      }

      el.scrollLeft = scrollLeft - walk;

      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        const dx = e.pageX - lastX;
        velocity = (dx / dt) * 15; // Calculate instantaneous velocity
      }
      lastX = e.pageX;
      lastTime = now;
    };

    const handleWheel = (e: WheelEvent) => {
      // If holding shift, browser does horizontal scroll natively via deltaX
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        // Add artificial weight to the wheel
        el.scrollLeft += e.deltaY * 0.8;
      }
    };

    // Add passive: false to allow preventDefault
    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Top navigation rail drag-to-scroll
  useEffect(() => {
    const el = navRailRef.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      isNavDraggingRef.current = false;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
      setTimeout(() => {
        isNavDraggingRef.current = false;
      }, 50);
    };

    const handleMouseUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
      setTimeout(() => {
        isNavDraggingRef.current = false;
      }, 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.0; // 1:1 Unified Tactile Tracking
      if (Math.abs(walk) > 5) {
        isNavDraggingRef.current = true;
      }
      el.scrollLeft = scrollLeft - walk;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("mouseleave", handleMouseLeave);
    el.addEventListener("mouseup", handleMouseUp);
    el.addEventListener("mousemove", handleMouseMove);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.removeEventListener("mouseup", handleMouseUp);
      el.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Auto-focus active tab in nav rail
  useEffect(() => {
    if (navRailRef.current) {
      const el = navRailRef.current;
      // We will need to map activeTab to an ID or query that exists.
      // E.g. finding the button by inner text or id if we added.
      // Assuming buttons have ids or we can find by index.
      const activeBtn = el.querySelector(
        `#tab-btn-${activeTab}`,
      ) as HTMLElement;
      if (activeBtn) {
        const scrollLeft = el.scrollLeft;
        const containerWidth = el.clientWidth;
        const btnLeft = activeBtn.offsetLeft - el.offsetLeft;
        const btnWidth = activeBtn.clientWidth;

        if (
          btnLeft < scrollLeft ||
          btnLeft + btnWidth > scrollLeft + containerWidth
        ) {
          el.scrollTo({
            left: Math.max(0, btnLeft - containerWidth / 2 + btnWidth / 2),
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeTab, restored]);

  // Auto-focus timeline (follows active item during playback AND keyboard navigation)
  useEffect(() => {
    if (timelineRef.current) {
      const container = timelineRef.current;
      const activeEl = document.getElementById(
        `timeline-item-${activeItemIndex}`,
      );

      if (activeEl) {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const elLeft = activeEl.offsetLeft - container.offsetLeft;
        const elWidth = activeEl.clientWidth;

        // Only scroll if out of view bounds safely
        if (
          elLeft < scrollLeft + 20 ||
          elLeft + elWidth > scrollLeft + containerWidth - 20
        ) {
          container.scrollTo({
            left: Math.max(0, elLeft - containerWidth / 2 + elWidth / 2),
            behavior: "smooth",
          });
        }
      }
    }
  }, [activeItemIndex]);

  let exercisesCachePromise: Promise<any> | null = null;

  // Load exercises from API
  useEffect(() => {
    async function loadExercises() {
      try {
        if (!exercisesCachePromise) {
          exercisesCachePromise = fetch("/data/exercises.json").then(
            async (response) => {
              if (!response.ok)
                throw new Error(`HTTP error! status: ${response.status}`);

              const contentType = response.headers.get("content-type");
              if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                console.error(
                  "API returned non-JSON response:",
                  text.substring(0, 100),
                );
                throw new Error(
                  "API returned non-JSON data (check server logs)",
                );
              }

              const data = await response.json();

              if (!Array.isArray(data))
                throw new Error("API returned non-array data");

              return data;
            },
          );
        }

        const data = await exercisesCachePromise;

        // Standardize data from API to match Exercise interface
        const processed = data.map((ex: any) => {
          const firstImage = ex.images?.[0];

          const assetUrl = firstImage
            ? `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${firstImage}`
            : null;

          return {
            id: ex.id || generateId(),
            name: ex.name || "Untitled Exercise",
            category: ex.category || "Fitness",
            level: ex.level || "Beginner",

            focus:
              ex.primaryMuscles?.length > 0 ? ex.primaryMuscles : ["Full Body"],

            description:
              ex.instructions?.join(" ") ||
              `Strategic ${ex.name} designed for mobility.`,

            thumbnail:
              assetUrl ||
              `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop`,

            videoUrl: assetUrl || "#",

            instructions: ex.instructions || [],
            equipment: ex.equipment || [],
            targetMuscles: ex.primaryMuscles || [],
            secondaryMuscles: ex.secondaryMuscles || [],
          };
        });
        setExercises(processed);
      } catch (error) {
        console.error("[PIPELINE] Failed to load exercises:", error);

        setExercises(
          EXERCISE_DATABASE.map((ex) => ({
            ...ex,
            id: ex.id || generateId(),
            thumbnail:
              ex.thumbnail ||
              `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop`,
            videoUrl: ex.videoUrl || "#",
          })),
        );
      } finally {
        setIsLoading(false);
      }
    }
    loadExercises();
  }, []);

  // Wizard State
  const [wizardConfig, setWizardConfig] = useState({
    duration: "60",
    type: "Stretching",
    level: "Beginner",
    focus: "Full Body",
    creatorMode: "shorts" as CreatorModeId,
    painPoints: [] as string[],
    equipment: ["None"] as string[],
    intensity: "Low" as "Low" | "Medium" | "High",
    targetMuscles: [] as string[],
    coachingStyle: "Encouraging",
    selectedCoachId: COACH_PROFILES[0].id,
  });

  const currentJourney = useMemo(
    () =>
      GOAL_JOURNEYS.find((j) => j.id === currentJourneyId) || GOAL_JOURNEYS[0],
    [currentJourneyId],
  );

  const transformationNarrative = useMemo(() => {
    if (!currentProgression || !currentJourney) return null;
    return getTransformationNarrative(currentProgression, currentJourney);
  }, [currentProgression, currentJourney]);

  const priorityContext = useMemo(() => {
    if (!currentProgression)
      return {
        focus: "onboarding",
        primaryAction: "Build First session",
        message: "Initialize your movement profile and establish a baseline.",
        icon: <Target className="w-5 h-5" />,
      };

    const readiness = calculateReadiness(currentProgression);
    const activeCoach =
      COACH_PROFILES.find((c) => c.id === wizardConfig.selectedCoachId) ||
      COACH_PROFILES[0];

    // Low Readiness - Priority is Recovery
    if (readiness.score < 60) {
      return {
        focus: "recovery",
        primaryAction: "Start Recovery Ritual",
        message: `${activeCoach.name} recommends a restorative flow to optimize nervous system fatigue.`,
        icon: <Activity className="w-5 h-5 text-blue-400" />,
      };
    }

    // High Momentum - Priority is Phase Progression
    if (currentProgression.momentumScore > 80 && readiness.score >= 75) {
      return {
        focus: "performance",
        primaryAction: "Advance Phase",
        message:
          "Momentum is peaking. Time to challenge your functional limits.",
        icon: <Zap className="w-5 h-5 text-gold" />,
      };
    }

    // Default - Maintaining Consistency
    return {
      focus: "maintenance",
      primaryAction: "Daily Mobility Flow",
      message:
        "Consistency is the foundation of longevity. Maintain the rhythm.",
      icon: <Compass className="w-5 h-5 text-white/60" />,
    };
  }, [currentProgression, wizardConfig.selectedCoachId]);

  const atmosphere = useMemo(() => {
    if (!currentProgression || !activeProgram) return null;
    const readiness = calculateReadiness(currentProgression);
    const activeCoach =
      COACH_PROFILES.find((c) => c.id === wizardConfig.selectedCoachId) ||
      COACH_PROFILES[0];
    const currentPhase = activeProgram.phases[activeProgram.currentPhaseIndex];
    return calculateAtmosphere(
      currentProgression,
      readiness,
      activeCoach,
      currentPhase.name,
      currentJourney?.name,
    );
  }, [
    currentProgression,
    activeProgram,
    wizardConfig.selectedCoachId,
    currentJourney,
  ]);

  useEffect(() => {
    const savedReports = localStorage.getItem("workout_reports_v1");
    if (savedReports) {
      const parsed = JSON.parse(savedReports);
      setWorkoutReports(parsed);
      setCurrentProgression(getProgressionFromReports(parsed));
    }
    const savedProgram = localStorage.getItem("active_program_v1");
    if (savedProgram) {
      setActiveProgram(JSON.parse(savedProgram));
    } else {
      setActiveProgram(PRESET_PROGRAMS[0]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("workout_reports_v1", JSON.stringify(workoutReports));
    setCurrentProgression(getProgressionFromReports(workoutReports));
  }, [workoutReports]);

  useEffect(() => {
    if (activeProgram) {
      localStorage.setItem("active_program_v1", JSON.stringify(activeProgram));
    }
  }, [activeProgram]);
  const AUTOSAVE_KEY = "video_studio_autosave_v1";

  // Bootstrap Adaptive Studio Memory
  useEffect(() => {
    async function loadBootstrap() {
      const history = await snapshotManager.getAthleteHistory();
      const dna = generateAdaptiveDNA(history);
      const evolution = analyzeWeeklyEvolution(history);
      
      const recovery = await recoveryInsightService.getReadinessState();
      
      const presets = buildAdaptiveStudioBootstrap(
        history.length > 0 ? dna : null, 
        recovery
      );
      
      setAthleteDNA(history.length > 0 ? dna : null);
      setEvolutionMetrics(history.length > 0 ? evolution : null);
      setBootstrapPresets(presets);
      
      // Auto-populate based on presets if no overriding location state
      if (!location.state || !(location.state as any).athleteRecommendation) {
        if (presets.recommendedStyle === 'wellness') {
           setVibe('minimal');
           setTransitionStyle('subtle');
        } else if (presets.recommendedStyle === 'technical') {
           setVibe('technical');
           setTransitionStyle('medium');
        } else if (presets.recommendedStyle === 'high-energy') {
           setVibe('high-energy');
           setTransitionStyle('medium');
        }

        setWizardConfig(prev => ({
          ...prev,
          duration: (presets.recommendedDuration * 60).toString(),
          focus: presets.recommendedFocus,
          intensity: presets.recommendedIntensity as any,
          coachingStyle: presets.recommendedCoachTone,
        }));
      }
    }
    loadBootstrap();
  }, []);

  // 1. Restore on Mount
  useEffect(() => {
    // Check for athlete recommendation state
    if (location.state && (location.state as any).athleteRecommendation) {
      const rec = (location.state as any).athleteRecommendation;
      console.log("[ATHLETE] Processing recommendation handoff:", rec);
      
      // Auto-configure Wizard based on recommendation
      if (rec.recommendedFocus === 'Recovery') {
        setVibe('minimal');
        setTransitionStyle('subtle');
        const wellnessMode = CREATOR_MODES.find(m => m.id === 'wellness');
        if (wellnessMode) applyCreatorMode('wellness');
      } else if (rec.recommendedFocus === 'Performance') {
        setVibe('high-energy');
        setTransitionStyle('medium');
        const technicalMode = CREATOR_MODES.find(m => m.id === 'explainer');
        if (technicalMode) applyCreatorMode('explainer');
      }
    }

    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.version === 1) {
          if (
            Array.isArray(parsed.storyboard) &&
            parsed.storyboard.length > 0
          ) {
            // Validate items have necessary fields
            const validStoryboard = parsed.storyboard.filter(
              (item: any) =>
                item &&
                typeof item === "object" &&
                item.instanceId &&
                item.name,
            );
            setStoryboard(validStoryboard);
            if (!parsed.showWizard && validStoryboard.length > 0)
              setShowWizard(false);
          }
          if (Array.isArray(parsed.aiScript)) setAiScript(parsed.aiScript);
          if (parsed.seoMetadata) setSeoMetadata(parsed.seoMetadata);
          if (parsed.socialCaptions) setSocialCaptions(parsed.socialCaptions);
          if (parsed.wizardConfig) {
            setWizardConfig({
              duration: parsed.wizardConfig.duration || "60",
              type: parsed.wizardConfig.type || "Stretching",
              level: parsed.wizardConfig.level || "Beginner",
              focus: parsed.wizardConfig.focus || "Full Body",
              creatorMode: parsed.wizardConfig.creatorMode || "shorts",
              painPoints: parsed.wizardConfig.painPoints || [],
              equipment: parsed.wizardConfig.equipment || ["None"],
              intensity: parsed.wizardConfig.intensity || "Low",
              targetMuscles: parsed.wizardConfig.targetMuscles || [],
              coachingStyle: parsed.wizardConfig.coachingStyle || "Encouraging",
              selectedCoachId:
                parsed.wizardConfig.selectedCoachId || COACH_PROFILES[0].id,
            });
          }
          if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
          if (parsed.vibe) setVibe(parsed.vibe);
          if (parsed.framingMode) setFramingMode(parsed.framingMode);
          if (parsed.transitionStyle)
            setTransitionStyle(parsed.transitionStyle);
          if (parsed.subtitlesEnabled !== undefined)
            setSubtitlesEnabled(parsed.subtitlesEnabled);
          if (parsed.subtitleSize) setSubtitleSize(parsed.subtitleSize);
          if (parsed.subtitlePosition)
            setSubtitlePosition(parsed.subtitlePosition);
          if (parsed.subtitleStyle) setSubtitleStyle(parsed.subtitleStyle);
          if (parsed.soundtrackPreset)
            setSoundtrackPreset(parsed.soundtrackPreset);
          if (parsed.soundtrackVolume !== undefined) {
            const vol = parseFloat(parsed.soundtrackVolume);
            setSoundtrackVolume(isNaN(vol) ? 0.25 : vol);
          }
          if (parsed.isSoundtrackEnabled !== undefined)
            setIsSoundtrackEnabled(parsed.isSoundtrackEnabled);
          if (parsed.pacingMode) setPacingMode(parsed.pacingMode);

          if (parsed.activeTab) setActiveTab(parsed.activeTab);
          if (parsed.timelineZoom) setTimelineZoom(parsed.timelineZoom);
          if (parsed.activeCreatorMode)
            setActiveCreatorMode(parsed.activeCreatorMode);
          if (parsed.hookTitle) setHookTitle(parsed.hookTitle);
          if (parsed.globalTime !== undefined) {
            // Delay to ensure scenes are loaded into orchestrator
            setTimeout(() => {
              Orchestrator.seek(parsed.globalTime);
            }, 100);
          }
        }
      }
    } catch (e) {
      console.warn("[PIPELINE] Failed to restore autosave:", e);
    } finally {
      setRestored(true);
    }
  }, []);

  const hasAutoGeneratedRef = useRef(false);

  useEffect(() => {
    if (
      restored &&
      !isLoading &&
      location.state?.autoGenerate &&
      !hasAutoGeneratedRef.current
    ) {
      hasAutoGeneratedRef.current = true;
      const config = location.state.wizardConfig;
      let hydratedConfig = wizardConfig;

      if (config) {
        hydratedConfig = {
          ...wizardConfig,
          duration: config.durationMinutes
            ? (config.durationMinutes * 60).toString()
            : wizardConfig.duration,
          type: config.goal || wizardConfig.type,
          level: config.level || wizardConfig.level,
          focus: config.focus || wizardConfig.focus,
          painPoints: config.painPoints || wizardConfig.painPoints,
          intensity: config.intensity || wizardConfig.intensity,
          targetMuscles: config.targetMuscles || wizardConfig.targetMuscles,
          equipment: config.equipment || wizardConfig.equipment,
          coachingStyle: config.coachingStyle || wizardConfig.coachingStyle,
        };

        setWizardConfig(hydratedConfig);
      }

      // Clean up the history state to prevent re-triggering on future reloads
      // if using browser navigation back/forwards.
      window.history.replaceState({}, document.title);

      generateRoutine(hydratedConfig);
    }
  }, [restored, isLoading, location.state]);

  // 2. Debounced Autosave & Visibility Tracking
  useEffect(() => {
    if (!restored) return; // Prevent overwriting data before initial restore completes
    if (showWizard && storyboard.length === 0) return; // Don't aggressively serialize emptiness if just starting fresh

    const saveState = () => {
      try {
        const projectSave = {
          version: 1,
          updatedAt: new Date().toISOString(),
          storyboard,
          aiScript,
          seoMetadata,
          socialCaptions,
          wizardConfig,
          aspectRatio,
          vibe,
          framingMode,
          transitionStyle,
          showWizard,
          subtitlesEnabled,
          subtitleSize,
          subtitlePosition,
          subtitleStyle,
          soundtrackPreset,
          soundtrackVolume,
          isSoundtrackEnabled,
          pacingMode,
          activeTab,
          timelineZoom,
          activeCreatorMode,
          hookTitle,
          globalTime: Orchestrator.timeState.globalTime,
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(projectSave));
      } catch (e) {
        console.warn("[PIPELINE] Autosave failed:", e);
      }
    };

    const timeout = setTimeout(saveState, 2000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveState();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    restored,
    storyboard,
    aiScript,
    seoMetadata,
    socialCaptions,
    wizardConfig,
    aspectRatio,
    vibe,
    framingMode,
    transitionStyle,
    showWizard,
    subtitlesEnabled,
    subtitleSize,
    subtitlePosition,
    subtitleStyle,
    soundtrackPreset,
    soundtrackVolume,
    isSoundtrackEnabled,
    pacingMode,
    activeTab,
    timelineZoom,
    activeCreatorMode,
    hookTitle,
    activeItemIndex,
  ]);

  const clearProject = () => {
    setPendingConfirm({
      message: "Are you sure you want to completely clear your project? This cannot be undone.",
      onConfirm: () => {
        setPendingConfirm(null);
        localStorage.removeItem(AUTOSAVE_KEY);
        setStoryboard([]);
        setAiScript([]);
        setSeoMetadata(null);
        setSocialCaptions(null);
        setShowWizard(true);
        Orchestrator.seekToScene(0, 0);
        setActiveTab("assets");
      }
    });
  };
  // -------------------------

  // Discovery & Filtering States
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const evolutionMessage = useMemo(() => {
    if (!currentProgression) return null;
    if (
      currentProgression.consistencyStreak > 0 &&
      currentProgression.consistencyStreak % 3 === 0
    ) {
      return `Consistency Milestone: ${currentProgression.consistencyStreak} Days. Coaching cues optimized.`;
    }
    if (currentProgression.momentumScore > 90) {
      return "Peak Performance State. Ready for Phase progression.";
    }
    return null;
  }, [
    currentProgression?.consistencyStreak,
    currentProgression?.momentumScore,
  ]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.category) cats.add(ex.category);
    });
    return Array.from(cats).sort();
  }, [exercises]);

  const uniqueLevels = useMemo(() => {
    const lvls = new Set<string>();
    exercises.forEach((ex) => {
      if (ex.level) lvls.add(ex.level);
    });
    return Array.from(lvls).sort();
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Allow searching by name, focus, or category
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (ex.name && ex.name.toLowerCase().includes(q)) ||
        (ex.focus && ex.focus.some((f) => f?.toLowerCase().includes(q))) ||
        (ex.category && ex.category.toLowerCase().includes(q)) ||
        (ex.benefits && ex.benefits.some((b) => b?.toLowerCase().includes(q)));

      const matchesCategory =
        filterCategory === "all" ||
        ex.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesLevel =
        filterLevel === "all" ||
        ex.level.toLowerCase() === filterLevel.toLowerCase();

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [exercises, searchQuery, filterCategory, filterLevel]);
  // Removed slice to show all exercises as requested

  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const addToStoryboard = useCallback(
    (ex: Exercise) => {
      // Prevent accidental double clicks
      if (recentlyAddedId === ex.id) return;

      const newItem: StoryboardItem = {
        ...ex,
        duration: 15,
        baseDuration: 15,
        instanceId: generateId(),
      };
      setStoryboard((prev) => {
        pushUndo(prev);
        const intermediate = [...prev, newItem];
        return applyPacingIntelligence(intermediate);
      });

      // Visual feedback & debounce
      setRecentlyAddedId(ex.id);
      setTimeout(() => {
        setRecentlyAddedId(null);
      }, 600);
    },
    [recentlyAddedId, pushUndo, applyPacingIntelligence, storyboard.length],
  );

  const isGeneratingRef = useRef(false);

  const generateRoutine = async (overrideConfig?: any) => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    const config = overrideConfig && !overrideConfig.nativeEvent ? overrideConfig : wizardConfig;
    const totalSeconds = parseInt(config.duration || "120");
    const durationMinutes = Math.max(1, Math.floor(totalSeconds / 60));

    setIsInitializingProtocol(true);
    setGenerationMessage("Preparing user content...");
    console.log("[PIPELINE] Wizard Config Sent To Groq:", config);
    // Yield to the browser so the UI updates to show the loading screen BEFORE intensive processing
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      // Create blueprint completely via LLM
      const { generateCompositionBlueprint } =
        await import("../lib/compositionPlanner");
      const { recordGeneratedBlueprint } =
        await import("../lib/compositionMemory");

      const blueprint = await generateCompositionBlueprint({
        ...config,
        durationMinutes,
        exercises,
      });

      console.log("[PIPELINE] LLM Blueprint Received:", blueprint);

      if (!blueprint || !blueprint.scenes || blueprint.scenes.length === 0) {
        throw new Error("Failed to generate comprehensive blueprint.");
      }

      console.log("[PIPELINE] Verified LLM Blueprint Received");

      // Record blueprint generation
      activeBlueprintIdRef.current = recordGeneratedBlueprint(blueprint);

      // Map blueprint scenes to Storyboard items
      let generatedItems: StoryboardItem[] = [];
      let generatedAiScript: { exerciseName: string; script: string }[] = [];
      let gatheredIntelligence: string[] = [];

      blueprint.scenes.forEach((scene: any) => {
        let exMatch = exercises.find((ex) => ex.id === scene.exerciseId);

        if (!exMatch) {
          exMatch = resolveVerifiedExercise(
            scene.exerciseId,
            exercises,
            config.focus,
            config.focus,
          );
        }

        if (!exMatch) {
          console.warn(
            `[REJECTED] Hallucinated movement removed: "${scene.exerciseId}"`,
          );
          return; // Skip invalid scene entirely, never silently corrupt
        }

        let itemDuration =
          scene.duration ||
          Math.max(10, Math.floor(totalSeconds / blueprint.scenes.length));
        if (isNaN(itemDuration) || itemDuration <= 0) itemDuration = 60;

        generatedItems.push({
          ...exMatch,
          duration: itemDuration,
          baseDuration: itemDuration,
          instanceId: generateId(),
          reason: blueprint.reasoning,
        });

        generatedAiScript.push({
          exerciseName: exMatch.name,
          script: scene.script,
        });
      });

      // --- Biomechanical Intelligence Layer ---
      const { analyzeAndBalanceRoutine } =
        await import("../lib/biomechanicalAnalyzer");
      const balancedResult = analyzeAndBalanceRoutine(
        generatedItems,
        exercises,
      );
      generatedItems = balancedResult.items;
      generatedAiScript = [
        ...generatedAiScript,
        ...balancedResult.addedScripts,
      ];
      if (balancedResult.intelligenceLogs)
        gatheredIntelligence.push(...balancedResult.intelligenceLogs);
      // ----------------------------------------

      // --- Adaptive Training Goal Engine ---
      const { applyAdaptiveGoalEngine } =
        await import("../lib/adaptiveGoalEngine");
      const adaptiveResult = applyAdaptiveGoalEngine(
        generatedItems,
        exercises,
        config,
      );
      generatedItems = adaptiveResult.items;
      generatedAiScript = [
        ...generatedAiScript,
        ...adaptiveResult.addedScripts,
      ];
      if (adaptiveResult.intelligenceLogs)
        gatheredIntelligence.push(...adaptiveResult.intelligenceLogs);
      // ----------------------------------------

      // --- Progressive Adaptation Memory Engine ---
      const { applyProgressiveAdaptation, recordCompletedSession } =
        await import("../lib/progressiveAdaptationEngine");
      const memoryResult = applyProgressiveAdaptation(
        generatedItems,
        generatedAiScript,
        exercises,
        config,
      );
      generatedItems = memoryResult.items;
      generatedAiScript = memoryResult.scripts;
      if (memoryResult.intelligenceLogs)
        gatheredIntelligence.push(...memoryResult.intelligenceLogs);

      // --- Social & Viral Automation Layer: Engagement Pacing Modifier ---
      const { applySocialPacing } = await import("../lib/socialExportEngine");
      if (config.creatorMode !== "landscape") {
        generatedItems = applySocialPacing(generatedItems, config.creatorMode);
        gatheredIntelligence.push("Viral pacing modifier active");
        console.log(`[SOCIAL] Viral pacing modifier active for preset: ${config.creatorMode}`);
      }

      // --- Deterministic Movement Intelligence Layer ---
      const { applyMovementIntelligence } = await import("../lib/movementIntelligence");
      const movementResult = applyMovementIntelligence(generatedItems, generatedAiScript);
      generatedItems = movementResult.items;
      generatedAiScript = movementResult.scripts;
      if (movementResult.intelligenceLogs) {
        gatheredIntelligence.push(...movementResult.intelligenceLogs);
      }
      console.log("[DIAGNOSTICS] Movement Flow:", movementResult.diagnostics);
      // ----------------------------------------

      // --- Adaptive Session Rhythm System ---
      const { applyAdaptiveRhythm } = await import("../lib/adaptiveRhythmEngine");
      const rhythmResult = applyAdaptiveRhythm(generatedItems, generatedAiScript, totalSeconds);
      generatedItems = rhythmResult.items;
      generatedAiScript = rhythmResult.scripts;
      if (rhythmResult.intelligenceLogs) {
        gatheredIntelligence.push(...rhythmResult.intelligenceLogs);
      }
      console.log("[DIAGNOSTICS] Rhythm System:", rhythmResult.diagnostics);
      // ----------------------------------------
      
      // Record session tracking
      recordCompletedSession(generatedItems, config);
      // ----------------------------------------

      setStoryboard(generatedItems);
      setAiScript(generatedAiScript);
      setIntelligenceLogs(gatheredIntelligence);

      setWorkoutSummary({
        primaryGoal: blueprint.title || `${config.type} Protocol`,
        trainingFocus: config.focus,
        mobilityEmphasis: 50,
        strengthEmphasis: 30,
        cardioEmphasis: 20,
        recoveryFocus: "Adaptive",
        safetyNotes: [blueprint.hook || "Focus on form"],
        reasoning:
          blueprint.reasoning || "Autonomously mapped for optimal progression.",
      });

      // Apply selected creator mode defaults
      applyCreatorMode(wizardConfig.creatorMode, wizardConfig);

      console.log(`[DIAGNOSTICS] Generation pipeline completed:
- Generated items: ${generatedItems.length}
- Target seconds: ${totalSeconds}
- Actual seconds after normalisation: ${generatedItems.reduce((acc, i) => acc + i.duration, 0)}
- Intelligence logs collected: ${gatheredIntelligence.length}`);

      console.log("[PIPELINE] Valid storyboard hydrated");
      setShowWizard(false);
      setIsInitializingProtocol(false);
      Orchestrator.seekToScene(0, 0);

      const coachName =
        COACH_PROFILES.find((c) => c.id === config.selectedCoachId)?.name ||
        "Coach";
      setGenerationMessage(`Blueprint Executed. ${coachName} timeline active.`);
      setTimeout(() => setGenerationMessage(null), 5000);
    } catch (e) {
      console.warn(
        "AI generation failed or Groq key missing. Falling back to deterministic routine:",
        e,
      );
      setGenerationMessage(
        "AI unavailable. Enacting deterministic fallback protocol...",
      );
      console.log("[PIPELINE] Fallback Generator Activated");

      try {
        const { generateLocalRoutine } =
          await import("../services/localRoutineService");
        const fallBackRoutine = generateLocalRoutine(
          config.level,
          config.focus,
          durationMinutes,
          exercises,
        );
        console.log("[PIPELINE] Deterministic Engine Used", fallBackRoutine);

        if (
          !fallBackRoutine ||
          !fallBackRoutine.exercises ||
          fallBackRoutine.exercises.length === 0
        ) {
          throw new Error("Local fallback returned empty timeline.");
        }

        let generatedItems: StoryboardItem[] = [];
        let generatedAiScript: { exerciseName: string; script: string }[] = [];
        let gatheredIntelligence: string[] = [];

        fallBackRoutine.exercises.forEach((exItem) => {
          let exMatch = exercises.find(
            (ex: any) => ex.name.toLowerCase() === exItem.name.toLowerCase(),
          );

          if (!exMatch) {
            exMatch = resolveVerifiedExercise(
              exItem.name,
              exercises,
              config.focus,
              config.focus,
            );
          }

          if (!exMatch) {
            console.warn(
              `[REJECTED] Deterministic movement removed: "${exItem.name}"`,
            );
            return;
          }

          // Parse deterministic duration correctly (either number or string like '1 Minute')
          let itemDuration = 60; // default 1m
          if (typeof exItem.duration === "number") {
            itemDuration = exItem.duration;
          } else if (typeof exItem.duration === "string") {
            if (exItem.duration.includes("Minute")) {
              itemDuration = parseInt(exItem.duration) * 60;
            } else if (exItem.duration.includes("Second")) {
              itemDuration = parseInt(exItem.duration);
            }
          }
          if (isNaN(itemDuration) || itemDuration <= 0) itemDuration = 60;

          generatedItems.push({
            ...exMatch,
            duration: itemDuration,
            baseDuration: itemDuration,
            instanceId: generateId(),
            reason: "Deterministic Generation Engine Fallback",
          });

          generatedAiScript.push({
            exerciseName: exMatch.name,
            script:
              exItem.instruction || "Follow the prescribed form carefully.",
          });
        });

        // --- Biomechanical Intelligence Layer ---
        const { analyzeAndBalanceRoutine } =
          await import("../lib/biomechanicalAnalyzer");
        const balancedResult = analyzeAndBalanceRoutine(
          generatedItems,
          exercises,
        );
        generatedItems = balancedResult.items;
        generatedAiScript = [
          ...generatedAiScript,
          ...balancedResult.addedScripts,
        ];
        if (balancedResult.intelligenceLogs)
          gatheredIntelligence.push(...balancedResult.intelligenceLogs);
        // ----------------------------------------

        // --- Adaptive Training Goal Engine ---
        const { applyAdaptiveGoalEngine } =
          await import("../lib/adaptiveGoalEngine");
        const adaptiveResult = applyAdaptiveGoalEngine(
          generatedItems,
          exercises,
          config,
        );
        generatedItems = adaptiveResult.items;
        generatedAiScript = [
          ...generatedAiScript,
          ...adaptiveResult.addedScripts,
        ];
        if (adaptiveResult.intelligenceLogs)
          gatheredIntelligence.push(...adaptiveResult.intelligenceLogs);
        // ----------------------------------------

        // --- Progressive Adaptation Memory Engine ---
        const { applyProgressiveAdaptation, recordCompletedSession } =
          await import("../lib/progressiveAdaptationEngine");
        const memoryResult = applyProgressiveAdaptation(
          generatedItems,
          generatedAiScript,
          exercises,
          config,
        );
        generatedItems = memoryResult.items;
        generatedAiScript = memoryResult.scripts;
        if (memoryResult.intelligenceLogs)
          gatheredIntelligence.push(...memoryResult.intelligenceLogs);

        // --- Social & Viral Automation Layer: Engagement Pacing Modifier ---
        const { applySocialPacing } = await import("../lib/socialExportEngine");
        if (config.creatorMode !== "landscape") {
          generatedItems = applySocialPacing(generatedItems, config.creatorMode);
          gatheredIntelligence.push("Viral pacing modifier active");
          console.log(`[SOCIAL] Viral pacing modifier active for preset: ${config.creatorMode}`);
        }

        // Record session tracking
        recordCompletedSession(generatedItems, config);
        // ----------------------------------------

        // Ensure we respect totalSeconds (trim excess duration if necessary)
        // Since deterministic generator might just produce fixed numbers
        let runningTotal = 0;
        for (let i = 0; i < generatedItems.length; i++) {
          runningTotal += generatedItems[i].duration;
        }

        // If it heavily exceeds or is shorter, we scale the items proportionally
        if (runningTotal > 0 && Math.abs(runningTotal - totalSeconds) > 30) {
          const scaleFactor = totalSeconds / runningTotal;
          generatedItems.forEach((item) => {
            item.duration = Math.max(
              10,
              Math.floor(item.duration * scaleFactor),
            );
            item.baseDuration = item.duration;
          });
        }

        setStoryboard(generatedItems);
        setAiScript(generatedAiScript);
        setIntelligenceLogs(gatheredIntelligence);

        setWorkoutSummary({
          primaryGoal: fallBackRoutine.title || `${config.type} Protocol`,
          trainingFocus: fallBackRoutine.focusArea || config.focus,
          mobilityEmphasis: 50,
          strengthEmphasis: 30,
          cardioEmphasis: 20,
          recoveryFocus: "Deterministic",
          safetyNotes: [fallBackRoutine.motivationalNote || "Focus on form"],
          reasoning: "Generated without AI cloud latency.",
        });

        applyCreatorMode(wizardConfig.creatorMode, wizardConfig);
        setShowWizard(false);
        setIsInitializingProtocol(false);
        Orchestrator.seekToScene(0, 0);

        const coachName =
          COACH_PROFILES.find((c) => c.id === config.selectedCoachId)?.name ||
          "Coach";
        setGenerationMessage(
          `Deterministic Blueprint Executed. ${coachName} timeline active.`,
        );
        setTimeout(() => setGenerationMessage(null), 5000);
      } catch (fallbackError) {
        console.error("[FALLBACK] Local fallback also failed:", fallbackError);
        showNotification("Initialization Failed. Systems Offline.");
        setIsInitializingProtocol(false);
        setGenerationMessage(null);
      }
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const handleGenerateAiScript = useCallback(
    async (
      items = storyboard,
      reasoning?: string,
      phase?: string,
      readiness?: string,
      momentum?: string,
      coachId?: string,
      userLevel?: string,
    ) => {
      if (items.length === 0) return;
      setIsGeneratingAi(true);
      try {
        const { generateRoutineScript } = await import("../api/client");
        const script = await generateRoutineScript(
          items.map((i) => ({ name: i.name, duration: i.duration })),
          wizardConfig.type,
          activeCreatorMode || undefined,
          {
            painPoints: wizardConfig.painPoints,
            intensity: wizardConfig.intensity,
            coachingStyle: wizardConfig.coachingStyle,
            reasoning: reasoning || workoutSummary?.reasoning,
            phase,
            readiness,
            momentum,
            coachId: coachId || wizardConfig.selectedCoachId,
            userLevel: userLevel || wizardConfig.level,
            journeyName: currentJourney?.name,
            journeyFocus: currentJourney?.focus,
            transformationNarrative: transformationNarrative?.message,
          },
        );
        setAiScript(script);
      } catch (error) {
        console.error("[AI] AI script generation failed:", error);
      } finally {
        setIsGeneratingAi(false);
        setActiveTab("script");
      }
    },
    [
      storyboard,
      wizardConfig.type,
      activeCreatorMode,
      wizardConfig.painPoints,
      wizardConfig.intensity,
      wizardConfig.coachingStyle,
      workoutSummary?.reasoning,
    ],
  );

  const applyTemplate = useCallback(
    (template: any) => {
      setIsGeneratingAi(true);

      // Find best match exercises
      const matchedExercises: Exercise[] = [];
      template.exercises.forEach((name: string) => {
        let match = exercises.find(
          (ex) => ex.name?.toLowerCase() === name?.toLowerCase(),
        );

        if (!match) {
          match = resolveVerifiedExercise(
            name,
            exercises,
            template.type,
            template.focus,
          );
        }

        if (match) {
          matchedExercises.push(match);
        } else {
          console.warn(`[REJECTED] Template movement removed: "${name}"`);
        }
      });

      // Final fallback: fill with random if too few found
      if (matchedExercises.length < 3 && template.focus) {
        const pool = exercises.filter((ex) =>
          ex.category?.toLowerCase().includes(template.focus.toLowerCase()),
        );
        const extra = [...(pool.length > 5 ? pool : exercises)]
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.max(0, 4 - matchedExercises.length));
        matchedExercises.push(...extra);
      }

      const durationPerScene = Math.floor(
        template.duration / (matchedExercises.length || 1),
      );

      const storyboardItems: StoryboardItem[] = matchedExercises.map((ex) => ({
        ...ex,
        duration: durationPerScene,
        baseDuration: durationPerScene,
        instanceId: generateId(),
        reason: "Curated template selection",
      }));

      setStoryboard(storyboardItems);
      setWorkoutSummary({
        primaryGoal: `${template.type} Protocol`,
        trainingFocus: template.focus,
        mobilityEmphasis: template.type === "Mobility" ? 80 : 20,
        strengthEmphasis: template.type === "Strength" ? 80 : 20,
        cardioEmphasis: template.type === "HIIT" ? 80 : 10,
        recoveryFocus: template.type === "Mobility" ? "High" : "Standard",
        safetyNotes: ["Template-validated sequence"],
        reasoning: `This workout follows the ${template.type} pre-set protocol focusing on ${template.focus}.`,
      });

      const templateCreatorMode: CreatorModeId =
        template.type === "Mobility" || template.type === "Stretching"
          ? "wellness"
          : "shorts";
      applyCreatorMode(templateCreatorMode, template);

      setWizardConfig((prev) => ({
        ...prev,
        duration: template.duration.toString(),
        type: template.type,
        level: template.level,
        focus: template.focus,
        creatorMode: templateCreatorMode,
      }));

      setIsInitializingProtocol(true);
      setTimeout(() => {
        setShowWizard(false);
        setIsInitializingProtocol(false);
        Orchestrator.seekToScene(0, 0);

        const phaseName =
          activeProgram?.phases[activeProgram.currentPhaseIndex].name;
        setGenerationMessage(
          `${template.name}: ${phaseName || "Journey"} Established.`,
        );
        setTimeout(() => setGenerationMessage(null), 5000);

        // Trigger AI script generation automatically
        setTimeout(() => {
          handleGenerateAiScript(storyboardItems);
        }, 500);
      }, 1500);
    },
    [exercises, generateId, handleGenerateAiScript],
  );

  const showNotification = useCallback((msg: string) => {
    setGenerationMessage(msg);
    setTimeout(() => setGenerationMessage(null), 4000);
  }, []);

  const handleGenerateCustomVideo = useCallback(
    async (instanceId: string, exerciseName: string) => {
      setIsGeneratingVideo((prev) => ({ ...prev, [instanceId]: true }));
      try {
        const { generateAIVideo } = await import("../api/client");
        const result = await generateAIVideo(exerciseName);
        if (result) {
          showNotification(`AI Video Generation started for ${exerciseName}.`);
        }
      } catch (error) {
        console.error("[EXPORT] Video generation failed:", error);
        showNotification("Failed to start AI Video Generation.");
      } finally {
        setIsGeneratingVideo((prev) => ({ ...prev, [instanceId]: false }));
      }
    },
    [showNotification],
  );

  const handleGenerateSEOMetadata = async () => {
    if (storyboard.length === 0) return;
    setIsGeneratingSEO(true);

    // Attempt generation in parallel for efficiency
    try {
      const exercises = storyboard.map((i) => ({
        name: i.name,
        duration: i.duration,
      }));
      const activeCoach =
        COACH_PROFILES.find((c) => c.id === wizardConfig.selectedCoachId) ||
        COACH_PROFILES[0];
      const storyTheme = TRANSFORMATION_THEMES.find(
        (t) => t.id === selectedStoryThemeId,
      );
      const coachContext = {
        coachName: activeCoach.name,
        coachSignature: activeCoach.signature,
        journeyName: currentJourney?.name,
        transformationNarrative: transformationNarrative?.message,
        storyTheme: storyTheme?.label,
      };

      const { generateSEOMetadata, generateSocialCaptions } =
        await import("../api/client");
      const [seo, socials] = await Promise.all([
        generateSEOMetadata(exercises, wizardConfig.type, coachContext),
        generateSocialCaptions(
          exercises,
          wizardConfig.type,
          activeCreatorMode || undefined,
          coachContext,
        ),
      ]);

      setSeoMetadata(seo);
      setSocialCaptions(socials);
      setShowSEOSection(true);
    } catch (e) {
      console.error("[EXPORT] Failed to generate SEO metadata:", e);
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  const removeFromStoryboard = useCallback(
    (instanceId: string) => {
      const removeIndex = storyboard.findIndex(
        (i) => i.instanceId === instanceId,
      );
      if (removeIndex === -1) return;

      const newStoryboard = storyboard.filter(
        (item) => item.instanceId !== instanceId,
      );

      pushUndo(storyboard);
      setStoryboard(newStoryboard);

      // Manage active item index safely
      if (newStoryboard.length === 0) {
        Orchestrator.seekToScene(0, 0);
        Orchestrator.pause();
      } else if (removeIndex < activeItemIndex) {
        // If we removed an item before the current one, decrement to stay on same item
        Orchestrator.seekToScene(
          activeItemIndex - 1,
          Orchestrator.timeState.localTime,
        );
      } else if (removeIndex === activeItemIndex) {
        // If we removed the active item, reset playback time for the new active item
        if (activeItemIndex >= newStoryboard.length) {
          Orchestrator.seekToScene(newStoryboard.length - 1, 0);
        } else {
          Orchestrator.seekToScene(activeItemIndex, 0);
        }
      }
    },
    [storyboard, activeItemIndex],
  );

  const setItemDuration = useCallback(
    (instanceId: string, duration: number) => {
      setStoryboard((prev) => {
        pushUndo(prev);
        return prev.map((item) => {
          if (item.instanceId === instanceId) {
            const newDur = Math.max(5, Math.min(300, duration));
            return { ...item, duration: newDur, baseDuration: newDur };
          }
          return item;
        });
      });
    },
    [pushUndo],
  );

  const updateItemDuration = useCallback(
    (instanceId: string, delta: number) => {
      setStoryboard((prev) => {
        pushUndo(prev);
        return prev.map((item) => {
          if (item.instanceId === instanceId) {
            const newDur = Math.max(
              5,
              Math.min(300, item.baseDuration + delta),
            );
            return {
              ...item,
              duration: newDur,
              baseDuration: newDur,
            };
          }
          return item;
        });
      });
    },
    [pushUndo],
  );

  const duplicateItem = useCallback(
    (index: number) => {
      setStoryboard((prev) => {
        pushUndo(prev);
        const newBoard = [...prev];
        const itemToDuplicate = newBoard[index];
        const newItem = {
          ...itemToDuplicate,
          instanceId: generateId(),
        };
        newBoard.splice(index + 1, 0, newItem);
        return newBoard;
      });
    },
    [pushUndo],
  );

  const moveItem = useCallback(
    (index: number, direction: "left" | "right") => {
      setStoryboard((prev) => {
        if (direction === "left" && index === 0) return prev;
        if (direction === "right" && index === prev.length - 1) return prev;

        pushUndo(prev);

        const newBoard = [...prev];
        const targetIndex = direction === "left" ? index - 1 : index + 1;

        const temp = newBoard[index];
        newBoard[index] = newBoard[targetIndex];
        newBoard[targetIndex] = temp;

        // Keep playback active on the same item if it moved
        if (activeItemIndex === index) {
          Orchestrator.seekToScene(
            targetIndex,
            Orchestrator.timeState.localTime,
          );
        } else if (activeItemIndex === targetIndex) {
          Orchestrator.seekToScene(index, Orchestrator.timeState.localTime);
        }

        return newBoard;
      });
    },
    [activeItemIndex, pushUndo],
  );

  // Playback Logic
  useEffect(() => {
    if (isPaused) {
      setIsAudioBuffering(false);
      lastNarrationUrlRef.current = null;
    }
  }, [isPaused]);

  const previousSceneIndexRef = useRef(activeItemIndex);
  useEffect(() => {
    if (activeItemIndex !== previousSceneIndexRef.current) {
      previousSceneIndexRef.current = activeItemIndex;
    }
  }, [activeItemIndex]);

  const handleSoftError = (msg: string) => {
    setExportErrorMsg(msg);
    setExportState("failed");
    setTimeout(() => {
      setExportErrorMsg(null);
      setExportState("idle");
    }, 4000);
  };

  const downloadReadyExport = () => {
    if (!renderBlobUrlRef.current) return;

    // Record export event for taste modeling
    if (activeBlueprintIdRef.current) {
      import("../lib/compositionMemory")
        .then(({ recordCompositionExport }) => {
          if (activeBlueprintIdRef.current)
            recordCompositionExport(activeBlueprintIdRef.current);
        })
        .catch((e) => console.error("[EXPORT] Could not lazily track export", e));
    }

    let baseFileName =
      seoMetadata?.slug ||
      `${wizardConfig.focus}-${wizardConfig.type}-routine-grow-young-fitness`;
    baseFileName = baseFileName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    const ext = exportMimeTypeRef.current.includes("mp4") ? "mp4" : "webm";
    const seoFileName = `${baseFileName}.${ext}`;

    const a = document.createElement("a");
    a.href = renderBlobUrlRef.current;
    a.download = seoFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const toggleRecording = async () => {
    if (storyboard.length === 0) return;

    if (
      !isRecording &&
      exportState === "idle" &&
      dailyExports >= MAX_DAILY_EXPORTS
    ) {
      handleSoftError(`Daily limit reached (${MAX_DAILY_EXPORTS}/3).`);
      return;
    }

    if (
      exportState === "preparing" ||
      exportState === "rendering" ||
      exportState === "packaging" ||
      isRecording
    ) {
      exportCancelledRef.current = true;
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      if (exportRafRef.current) {
        clearTimeout(exportRafRef.current);
        exportRafRef.current = null;
      }
      setExportState("idle");
      setIsRecording(false);
      Orchestrator.pause();
      return;
    }

    exportCancelledRef.current = false;
    const isMobile =
      typeof window !== "undefined" &&
      (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) ||
        isMobileViewport);
    const totalDuration = storyboard.reduce(
      (acc, curr) => acc + curr.duration,
      0,
    );

    if (totalDuration > 300) {
      // We'll just allow it, but we won't use window.confirm.
      // Just silently log or handle gracefully later if it fails.
    } else if (isMobile && totalDuration > 180) {
      console.warn(
        "[Export Status] Warning: Long export duration on mobile device. Risk of memory limits.",
      );
    }

    if (typeof MediaRecorder === "undefined") {
      handleSoftError("Export disabled: MediaRecorder unsupported.");
      return;
    }

    const canvas = exportCanvasRef.current;
    if (!canvas) {
      handleSoftError("Export disabled: Framebuffer missing.");
      return;
    }

    setExportState("preparing");
    setRenderProgress(0);
    setIsRecording(true);
    if (renderBlobUrlRef.current) {
      URL.revokeObjectURL(renderBlobUrlRef.current);
      renderBlobUrlRef.current = null;
    }

    const imgCache: Record<string, HTMLImageElement> = {};
    try {
      const loadPromises = storyboard.map((item) => {
        if (imgCache[item.id]) return Promise.resolve();
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            imgCache[item.id] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(
              `[Export Status] Failed to preload image: ${item.thumbnail}`,
            );
            imgCache[item.id] = img;
            resolve();
          };
          img.src = item.thumbnail;
        });
      }); // This closes `storyboard.map(...)`
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn("[Export Status] Preloading encountered an error:", error);
    }

    setExportState("rendering");

    const exportFPS = isMobile ? 24 : 30;
    Orchestrator.beginDeterministicExport(exportFPS);
    recordedChunksRef.current = [];

    // Sanitize and limit filename length safely
    let baseFileName =
      seoMetadata?.slug ||
      `${wizardConfig.focus}-${wizardConfig.type}-routine-grow-young-fitness`;
    baseFileName = baseFileName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    // --- Social & Viral Automation Layer: Thumbnail Logic ---
    import("../lib/socialExportEngine").then(({ selectSmartThumbnailFrame }) => {
      const thumb = selectSmartThumbnailFrame(storyboard);
      if (thumb) {
        console.log(`[SOCIAL] Thumbnail frame selected: ${thumb.name}`);
      }
    });

    const scaleFactor = isMobile ? 0.75 : 1.5; // Downscale slightly for mobile, upscale for desktop
    let cW = 720 * scaleFactor,
      cH = 1280 * scaleFactor;
    if (aspectRatio === "16:9") {
      cW = 1280 * scaleFactor;
      cH = 720 * scaleFactor;
    } else if (aspectRatio === "1:1") {
      cW = 1080 * scaleFactor;
      cH = 1080 * scaleFactor;
    }

    // Round to avoid float dimensions
    cW = Math.round(cW);
    cH = Math.round(cH);

    canvas.width = cW;
    canvas.height = cH;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setExportState("failed");
      setIsRecording(false);
      return;
    }

    let stream: MediaStream;
    try {
      const exportFPS = isMobile ? 24 : 30;
      const videoStream = canvas.captureStream(exportFPS);
      stream = new MediaStream();
      videoStream.getVideoTracks().forEach((t) => stream.addTrack(t));

      setupAudioContext(); // Make sure audio is set up
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      if (audioDestinationRef.current) {
        audioDestinationRef.current.stream
          .getAudioTracks()
          .forEach((t) => stream.addTrack(t));
      }
    } catch (e) {
      console.error("[Export Status] Stream capture error:", e);
      handleSoftError("Export disabled: Canvas capture unsupported.");
      return;
    }

    let mr: MediaRecorder | null = null;
    let selectedMimeType = "";

    const mimeTypesToTry = [
      "video/mp4; codecs=avc1.42E01E,mp4a.40.2", // Safari / Universal
      "video/mp4", // Safari fallback
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "", // Browser default fallback
    ];

    for (const mimeType of mimeTypesToTry) {
      try {
        if (mimeType === "" || MediaRecorder.isTypeSupported(mimeType)) {
          const options = mimeType
            ? {
                mimeType,
                videoBitsPerSecond: isMobile ? 2000000 : 5000000,
              }
            : {
                videoBitsPerSecond: isMobile ? 2000000 : 5000000,
              };
          mr = new MediaRecorder(stream, options);
          selectedMimeType = mimeType || "default";
          const codecName = selectedMimeType.includes("mp4")
            ? "MP4"
            : selectedMimeType.includes("webm")
              ? "WebM"
              : "Native Mode";
          if (
            audioDestinationRef.current &&
            audioDestinationRef.current.stream.getAudioTracks().length > 0
          ) {
          }
          break; // Successfully initialized
        }
      } catch (err) {
        console.warn(
          `[Export Status] MediaRecorder initialization failed for ${mimeType}:`,
          err,
        );
      }
    }

    if (!mr) {
      handleSoftError("Export disabled: MediaRecorder init failed.");
      return;
    }

    mediaRecorderRef.current = mr;

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunksRef.current.push(e.data);
      }
    };

    mr.onstop = () => {
      if (exportRafRef.current) {
        clearTimeout(exportRafRef.current);
        exportRafRef.current = null;
      }
      setIsRecording(false);
      Orchestrator.endDeterministicExport();

      if (exportCancelledRef.current) {
        // Clear all arrays, do not prompt download
        recordedChunksRef.current = [];
        setExportState("idle");
        return;
      }

      setExportState("packaging");
      incrementDailyExport();

      try {
        if (recordedChunksRef.current.length === 0) {
          throw new Error("No data recorded");
        }
        const finalMimeType =
          selectedMimeType === "default" || selectedMimeType === ""
            ? "video/mp4"
            : selectedMimeType;
        const actualType = finalMimeType.split(";")[0];
        exportMimeTypeRef.current = actualType;

        const blob = new Blob(recordedChunksRef.current, {
          type: actualType, // strip codecs for blob type
        });
        const url = URL.createObjectURL(blob);
        renderBlobUrlRef.current = url;

        // Silent Integrity Checks
        try {
          if (blob.size < 50_000) {
            console.warn(
              "[Integrity Notice] Render artifact size is unusually small. Check timeline assets.",
            );
          }
          if (storyboard.some((item) => !item.thumbnail)) {
            console.warn(
              "[Integrity Notice] Missing thumbnail data in final composition.",
            );
          }

        } catch (e) {
        }

        recordedChunksRef.current = [];
        setExportState("ready");
      } catch (err) {
        console.error("[Export Status] Finalize error:", err);
        handleSoftError("Export failed during file generation.");
      }
    };

    mr.start(1000); // 1-second chunks to reduce memory array overhead vs 100ms chunks

    const msPerFrame = 1000 / exportFPS;

    const renderLoop = () => {
      const parentState = studioStateRef.current;
      if (!parentState.isRecording) return;

      const state = { ...parentState, ...Orchestrator.timeState };

      if (Orchestrator.currentState === "ended") {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          mediaRecorderRef.current.stop();
        }
        return;
      }

      Orchestrator.stepDeterministic();
      const nextTimeState = Orchestrator.timeState;
      state.currentTime = nextTimeState.localTime;
      state.activeItemIndex = nextTimeState.activeSceneIndex;

      // Update render progress decoupled from DOM update max rate
      const currProg =
        totalDuration > 0
          ? Math.min(
              100,
              Math.floor((nextTimeState.globalTime / totalDuration) * 100),
            )
          : 0;
      if (currProg !== lastRenderProgressRef.current) {
        lastRenderProgressRef.current = currProg;
        setRenderProgress(currProg);
      }

      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, cW, cH);

      const transitionSec =
        state.transitionStyle === "medium"
          ? 0.8
          : state.transitionStyle === "subtle"
            ? 0.4
            : 0;
      const isTransitioning =
        state.activeItemIndex > 0 && state.currentTime < transitionSec;
      const fadeProgress = isTransitioning
        ? state.currentTime / transitionSec
        : 1;

      const drawScene = (
        itemToDraw: any,
        progressTime: number,
        alpha: number,
      ) => {
        if (!itemToDraw) return;
        ctx.globalAlpha = alpha;

        const img = imgCache[itemToDraw.id];
        if (img && img.complete && img.naturalWidth > 0) {
          const baseScale = Math.min(
            cW / img.naturalWidth,
            cH / img.naturalHeight,
          );
          const isLowRes = img.naturalWidth < 600 || img.naturalHeight < 600;
          const imgRatio = img.naturalWidth / img.naturalHeight;
          const isPortrait = imgRatio < 0.8;
          const isLandscape = imgRatio > 1.2;
          const isSquareLike = imgRatio >= 0.8 && imgRatio <= 1.2;

          let effectiveMode = state.framingMode;
          let scaleMod = 1;
          let yMod = 1;

          if (isLowRes) {
            effectiveMode = "fit";
          } else if (isPortrait && effectiveMode === "cinematic") {
            effectiveMode = "focus";
          }

          if (isSquareLike && effectiveMode === "cinematic") {
            scaleMod = 0.5;
            yMod = 0.5;
          } else if (isLandscape && effectiveMode === "cinematic") {
            scaleMod = 1.2;
            yMod = 1.5;
          }

          let exportScale = baseScale;
          let yOffset = 0;

          if (effectiveMode === "fit") {
            exportScale = baseScale * 0.95;
          } else if (effectiveMode === "focus") {
            exportScale = baseScale * 1.02;
          } else {
            // cinematic matching
            const cycle = (progressTime % 16) / 8; // 0 to 2
            const progress = cycle <= 1 ? cycle : 2 - cycle;
            const startScale = 1.0 + 0.05 * scaleMod;
            const endScale = 1.0 + 0.15 * scaleMod;
            exportScale =
              baseScale * (startScale + progress * (endScale - startScale));

            // Calculate pixel equivalent of CSS y: 5 to -5 relative to height
            const maxDrift = cH * 0.01 * yMod;
            yOffset = maxDrift * (1 - progress * 2);
          }

          const w = img.naturalWidth * exportScale;
          const h = img.naturalHeight * exportScale;
          const x = (cW - w) / 2;
          const y = (cH - h) / 2 + yOffset;
          ctx.drawImage(img, x, y, w, h);
        }

        const isMinimalUI = CREATOR_MODES.find(
          (m) => m.id === state.activeCreatorMode,
        )?.minimalUI;

        if (!isMinimalUI) {
          ctx.fillStyle = "#f1ece5";
          ctx.font = "bold 40px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(itemToDraw.name, cW / 2, cH - 100);

          const remaining = Math.max(
            0,
            (itemToDraw.duration || 0) - (progressTime || 0),
          );
          ctx.font = "bold 80px sans-serif";
          ctx.fillText(`${Math.ceil(remaining || 0)}s`, cW / 2, cH - 200);
        } else {
          // Minimal UI still usually wants the timer but maybe smaller/different position
          const remaining = Math.max(
            0,
            (itemToDraw.duration || 0) - (progressTime || 0),
          );
          ctx.fillStyle = "rgba(255, 224, 110, 0.9)"; // Gold emphasis
          ctx.font = "bold 120px sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(`${Math.ceil(remaining || 0)}`, cW - 60, cH - 100);
        }

        // Render Subtitle
        if (state.subtitlesEnabled && state.aiScript) {
          const sceneScript = state.aiScript.find(
            (s) =>
              s.exerciseName?.trim().toLowerCase() ===
              itemToDraw.name?.trim().toLowerCase(),
          );
          if (sceneScript?.script) {
            const scriptText = sceneScript.script;
            const words = scriptText.split(/\s+/).filter(Boolean);
            if (words.length > 0) {
              const chunks = [];
              let currentChunk = [];
              for (let i = 0; i < words.length; i++) {
                currentChunk.push(words[i]);
                const isPunctuation = /[,.?!]/.test(words[i]);
                if (
                  (currentChunk.length >= 4 && isPunctuation) ||
                  currentChunk.length >= 7
                ) {
                  chunks.push({
                    text: currentChunk.join(" "),
                    wordCount: currentChunk.length,
                  });
                  currentChunk = [];
                }
              }
              if (currentChunk.length > 0) {
                chunks.push({
                  text: currentChunk.join(" "),
                  wordCount: currentChunk.length,
                });
              }

              let currentStart = 0;
              const totalWords = words.length;
              let activeSubtitle = null;
              let subStart = 0;
              let subEnd = 0;
              for (const chunk of chunks) {
                const chunkDuration =
                  (chunk.wordCount / totalWords) * itemToDraw.duration;
                const end = currentStart + chunkDuration;
                if (progressTime >= currentStart && progressTime < end) {
                  activeSubtitle = chunk.text;
                  subStart = currentStart;
                  subEnd = end;
                  break;
                }
                currentStart = end;
              }

              if (activeSubtitle) {
                let subAlpha = alpha;
                const fadeDur = 0.3;
                if (progressTime - subStart < fadeDur) {
                  subAlpha *= (progressTime - subStart) / fadeDur;
                } else if (subEnd - progressTime < fadeDur) {
                  subAlpha *= (subEnd - progressTime) / fadeDur;
                }

                const fontSize =
                  state.subtitleSize === "small"
                    ? 40
                    : state.subtitleSize === "medium"
                      ? 60
                      : 90;
                ctx.font = `bold ${fontSize}px sans-serif`;

                // Text background
                const textWidth = ctx.measureText(activeSubtitle).width;
                const px = cW / 2;
                const py = state.subtitlePosition === "bottom" ? cH - 300 : 200;

                // Move subtitle down slightly when fading in, or up when fading out to mimic the slide motion
                // Math: y: 5 to 0 on entry, y: 0 to -5 on exit.
                let animOffset = 0;
                if (progressTime - subStart < fadeDur) {
                  animOffset = 20 * (1 - (progressTime - subStart) / fadeDur);
                } else if (subEnd - progressTime < fadeDur) {
                  animOffset = -20 * (1 - (subEnd - progressTime) / fadeDur);
                }

                const animY = py + animOffset;

                if (state.subtitleStyle === "bold") {
                  ctx.fillStyle = `rgba(255, 224, 110, ${0.95 * subAlpha})`; // Gold
                } else if (state.subtitleStyle === "minimal") {
                  ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * subAlpha})`; // White trans
                } else {
                  ctx.fillStyle = `rgba(10, 10, 10, ${0.8 * subAlpha})`; // Classic dark
                }

                const paddingX = 40;
                const paddingY = fontSize * 0.8;
                ctx.beginPath();
                ctx.roundRect(
                  px - textWidth / 2 - paddingX,
                  animY - fontSize,
                  textWidth + paddingX * 2,
                  fontSize + paddingY,
                  state.subtitleStyle === "minimal" ? 50 : 20,
                );
                ctx.fill();

                if (state.subtitleStyle === "bold") {
                  ctx.fillStyle = `rgba(10, 10, 10, ${subAlpha})`;
                  ctx.strokeStyle = `rgba(10, 10, 10, ${subAlpha})`;
                  ctx.lineWidth = 2;
                  ctx.strokeRect(
                    px - textWidth / 2 - paddingX,
                    animY - fontSize,
                    textWidth + paddingX * 2,
                    fontSize + paddingY,
                  );
                } else {
                  ctx.fillStyle = `rgba(255, 255, 255, ${subAlpha})`;
                  if (state.subtitleStyle === "minimal")
                    ctx.fillStyle = `rgba(10, 10, 10, ${subAlpha})`;
                }
                ctx.fillText(activeSubtitle, px, animY);
              }
            }
          }
        }

        // Draw Hook Title
        if (
          state.activeItemIndex === 0 &&
          state.currentTime < 2.5 &&
          state.hookTitle
        ) {
          const hookAlpha = Math.min(
            1,
            state.currentTime < 0.5
              ? state.currentTime / 0.5
              : (2.5 - state.currentTime) / 0.5,
          );
          ctx.globalAlpha = hookAlpha * alpha;

          const theme = TRANSFORMATION_THEMES.find(
            (t) => t.id === selectedStoryThemeId,
          );
          const hookValue = (
            theme ? `${theme.hookPrefix} ${state.hookTitle}` : state.hookTitle
          ).toUpperCase();

          ctx.font = "italic black 60px sans-serif";
          const measure = ctx.measureText(hookValue);
          const hW = measure.width + 80;
          const hH = 120;

          ctx.fillStyle = "black";
          ctx.fillRect((cW - hW) / 2 + 10, (cH - hH) / 2 + 10, hW, hH); // Shadow

          ctx.fillStyle = "#FFE06E"; // Gold
          ctx.fillRect((cW - hW) / 2, (cH - hH) / 2, hW, hH);

          ctx.strokeStyle = "black";
          ctx.lineWidth = 4;
          ctx.strokeRect((cW - hW) / 2, (cH - hH) / 2, hW, hH);

          ctx.fillStyle = "black";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(hookValue, cW / 2, cH / 2);

          ctx.globalAlpha = alpha;
        }

        // Draw Transformation Identity Overlay (Persistent)
        if (currentJourney) {
          ctx.globalAlpha = 0.6 * alpha;
          ctx.font = "bold 24px sans-serif";
          ctx.textAlign = "left";
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

          const identityText = `${currentJourney.name.toUpperCase()} • ${transformationNarrative?.title.toUpperCase()}`;
          ctx.fillText(identityText, 50, 60);

          // Coach watermark
          const coach =
            COACH_PROFILES.find((c) => c.id === wizardConfig.selectedCoachId) ||
            COACH_PROFILES[0];
          ctx.textAlign = "right";
          ctx.fillText(`COACH ${coach.name.toUpperCase()}`, cW - 50, 60);

          // Subtle progress bar at top
          const totalProgress =
            state.activeItemIndex / state.storyboard.length +
            state.currentTime / (itemToDraw.duration * state.storyboard.length);
          ctx.fillStyle = "rgba(234, 179, 8, 0.3)";
          ctx.fillRect(0, 0, cW * totalProgress, 6);
        }

        // --- Social & Viral Automation Layer: CTA Engine ---
        const totalDuration = state.storyboard.reduce((a, b) => a + (b.duration || 0), 0);
        const remainingGlobal = totalDuration - state.globalTime;
        
        let ctaText = "Generate your training program";
        let ctaStartTime = 5;
        if (state.activeCreatorMode === "tiktok" || state.activeCreatorMode === "square") { ctaText = "Generate your own routine"; ctaStartTime = 5; }
        else if (state.activeCreatorMode === "shorts") { ctaText = "AI-powered mobility orchestration"; ctaStartTime = 5; }
        else if (state.activeCreatorMode === "reels") { ctaText = "Build your recovery session"; ctaStartTime = 4; }
        else if (state.activeCreatorMode === "landscape") { ctaText = "Adaptive recovery engine"; ctaStartTime = 8; }
        
        if (state.activeCreatorMode !== "landscape" && remainingGlobal <= ctaStartTime && remainingGlobal >= 0) {
          ctx.globalAlpha = alpha;
          const ctaAlpha = Math.min(1, (ctaStartTime - remainingGlobal) / 0.5);
          ctx.globalAlpha = ctaAlpha * alpha;
          
          ctx.font = "bold 45px sans-serif";
          const measure = ctx.measureText(ctaText);
          const cW_cta = measure.width + 60;
          const cH_cta = 80;
          
          const px = cW / 2;
          const py = cH / 2 + 150;
          
          ctx.beginPath();
          ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
          ctx.roundRect(px - cW_cta/2, py - cH_cta/2, cW_cta, cH_cta, 40);
          ctx.fill();
          
          ctx.fillStyle = "#FFE06E";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(ctaText, px, py);
          ctx.globalAlpha = alpha;
        }

      };

      if (isTransitioning) {
        const prevItem = state.storyboard[state.activeItemIndex - 1];
        drawScene(prevItem, prevItem.duration, 1 - fadeProgress);
        drawScene(
          state.storyboard[state.activeItemIndex],
          state.currentTime,
          fadeProgress,
        );
      } else {
        drawScene(
          state.storyboard[state.activeItemIndex],
          state.currentTime,
          1,
        );
      }

      ctx.globalAlpha = 1.0;

      exportRafRef.current = window.setTimeout(renderLoop, msPerFrame);
    };
    exportRafRef.current = window.setTimeout(renderLoop, msPerFrame);
  };

  const renderedAssetList = useMemo(() => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 col-span-2 md:col-span-1">
            <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          filteredExercises.map((ex) => (
            <motion.button
              key={ex.id}
              whileHover={{ x: 4 }}
              onClick={() => addToStoryboard(ex)}
              className="w-full group text-left p-2 rounded-xl border border-transparent hover:border-cream/10 hover:bg-cream/5 transition-all flex items-center gap-2 md:gap-3"
            >
              <div className="w-12 h-10 md:w-16 md:h-12 rounded-lg bg-charcoal/40 overflow-hidden relative border border-white/5 flex-shrink-0">
                <img
                  src={ex.thumbnail}
                  alt={ex.name}
                  loading="lazy"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs font-bold leading-tight truncate mb-0.5">
                  {ex.name}
                </p>
                <p className="text-[8px] md:text-[9px] uppercase tracking-widest text-cream/30 truncate">
                  {ex.level}
                </p>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                  recentlyAddedId === ex.id
                    ? "bg-green-500/20 text-green-400"
                    : "bg-cream/5 group-hover:bg-gold group-hover:text-charcoal"
                }`}
              >
                {recentlyAddedId === ex.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    );
  }, [isLoading, filteredExercises, addToStoryboard, recentlyAddedId]);

  const renderedTimeline = useMemo(() => {
    return (
      <>
        <AnimatePresence>
          {storyboard.map((item, idx) => (
            <motion.div
              key={item.instanceId}
              id={`timeline-item-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`${
                timelineZoom === "compact"
                  ? "min-w-[120px] max-w-[120px]"
                  : timelineZoom === "expanded"
                    ? "min-w-[280px] max-w-[280px]"
                    : "min-w-[180px] max-w-[180px]"
              } h-full rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group overflow-hidden shrink-0 ${
                activeItemIndex === idx && !isPaused
                  ? "border-gold/50 bg-gold/5" // Clean editorial bounding box without glow stack
                  : activeItemIndex === idx && isPaused
                    ? "border-white/40 bg-white/5"
                    : "border-charcoal/5 bg-charcoal/10 hover:border-white/20"
              }`}
              onClick={() => {
                if (isDraggingRef.current) return;
                Orchestrator.seekToScene(idx, 0);
              }}
            >
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-full h-full object-cover grayscale-0 brightness-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-[8px] font-bold tracking-widest opacity-50">
                    #{idx + 1}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateItem(idx);
                      }}
                      className="p-1 text-cream/40 hover:text-white transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(idx, "left");
                      }}
                      disabled={idx === 0}
                      className="p-1 text-cream/40 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Left"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(idx, "right");
                      }}
                      disabled={idx === storyboard.length - 1}
                      className="p-1 text-cream/40 hover:text-white disabled:opacity-30 transition-colors"
                      title="Move Right"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromStoryboard(item.instanceId);
                      }}
                      className="p-1 hover:text-red-400 text-cream/40 transition-colors ml-1 border-l border-cream/10 relative group/del"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3 h-3" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/del:opacity-100 bg-charcoal text-cream text-[7px] font-black px-1 py-0.5 rounded tracking-tighter">
                        DEL
                      </div>
                    </button>
                  </div>
                </div>
                <p
                  className="text-[10px] font-bold leading-tight line-clamp-1 pr-1"
                  title={item.name}
                >
                  {item.name}
                </p>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <span className="text-[7px] font-black text-cream/30 uppercase tracking-widest bg-white/5 px-1.5 py-0.5 rounded-sm">
                    Cmd+Z to Undo
                  </span>
                </div>
              </div>

              <div
                className="flex items-center justify-between mt-auto pt-2 relative z-10 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1 bg-charcoal/50 rounded-lg p-1 w-full justify-between border border-cream/10 backdrop-blur-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateItemDuration(item.instanceId, -5);
                    }}
                    className="w-6 h-6 rounded hover:bg-cream/10 flex items-center justify-center text-cream/60 hover:text-white transition-colors active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={item.duration || 0}
                      title="Edit Duration"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setItemDuration(item.instanceId, val);
                      }}
                      className="w-10 text-[9px] font-mono font-bold text-center bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gold/50 rounded text-cream"
                    />
                    <span className="text-[9px] font-mono font-bold text-cream/50 -ml-1">
                      s
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateItemDuration(item.instanceId, 5);
                    }}
                    className="w-6 h-6 rounded hover:bg-cream/10 flex items-center justify-center text-cream/60 hover:text-white transition-colors active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {storyboard.length > 0 && (
          <button
            onClick={() => setSearchQuery("")}
            className="min-w-[140px] h-full rounded-xl border border-dashed border-cream/10 flex flex-col items-center justify-center gap-2 text-cream/30 hover:text-cream/60 hover:border-cream/30 transition-all font-bold text-[10px] uppercase tracking-widest shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Clip
          </button>
        )}
      </>
    );
  }, [
    storyboard,
    activeItemIndex,
    timelineZoom,
    isPaused,
    duplicateItem,
    moveItem,
    removeFromStoryboard,
    updateItemDuration,
    setItemDuration,
  ]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Check cmd/ctrl modifier
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (e.key === " ") {
        e.preventDefault();
        setupAudioContext();
        isPaused ? Orchestrator.play() : Orchestrator.pause();
      } else if (e.key === "ArrowLeft") {
        if (e.shiftKey) {
          e.preventDefault();
          Orchestrator.seek(Orchestrator.timeState.globalTime - 5);
        } else {
          e.preventDefault();
          Orchestrator.seekToScene(Math.max(0, activeItemIndex - 1), 0);
        }
      } else if (e.key === "ArrowRight") {
        if (e.shiftKey) {
          e.preventDefault();
          Orchestrator.seek(Orchestrator.timeState.globalTime + 5);
        } else {
          e.preventDefault();
          Orchestrator.seekToScene(
            Math.min(
              storyboard.length > 0 ? storyboard.length - 1 : 0,
              activeItemIndex + 1,
            ),
            0,
          );
        }
      } else if (e.key === "Escape") {
        Orchestrator.pause();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        // Protect delete scene edge cases
        if (storyboard.length > 0 && storyboard[activeItemIndex]) {
          e.preventDefault();
          removeFromStoryboard(storyboard[activeItemIndex].instanceId);
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (storyboard.length > 0 && storyboard[activeItemIndex]) {
          duplicateItem(activeItemIndex);
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === "s") {
        e.preventDefault();
        // Force save logic happens naturally via state updates plus the autosave loop,
        // but we can fast-track invoking the autosave event if we abstract it.
        // For lightweight scope, we let the autosave catch it, but prevent default browser dialog.
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeItemIndex,
    storyboard,
    handleUndo,
    removeFromStoryboard,
    duplicateItem,
    isPaused,
    setupAudioContext,
  ]);

  const renderedScriptTab = useMemo(() => {
    return (
      <>
        {isGeneratingAi ? (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                Script Architect is drafting...
              </p>
            </div>

            <Skeleton className="h-40 w-full rounded-[2rem]" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>
        ) : storyboard.length === 0 ? (
          <div className="py-24 text-center border-b border-white/5 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
              Sequence Not Initialized
            </p>
            <p className="text-[10px] text-white/50 font-medium max-w-[160px] mx-auto leading-relaxed">
              Build your movement sequence in the Library to trace coaching
              intelligence.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Workout Intelligence Summary Panel */}
            {workoutSummary && (
              <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Brain className="w-24 h-24 text-gold" />
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-gold/20 text-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                    Coaching Intelligence
                  </span>
                </div>

                <div className="space-y-4 relative z-10">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">
                      {workoutSummary.primaryGoal}
                    </h3>
                    <p className="text-[10px] text-white/60 leading-relaxed font-medium">
                      {workoutSummary.reasoning}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] font-black uppercase text-white/30 mb-1">
                        Mobility
                      </p>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400"
                          style={{
                            width: `${workoutSummary.mobilityEmphasis}%`,
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-bold mt-1 text-blue-400">
                        {workoutSummary.mobilityEmphasis}%
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] font-black uppercase text-white/30 mb-1">
                        Strength
                      </p>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400"
                          style={{
                            width: `${workoutSummary.strengthEmphasis}%`,
                          }}
                        />
                      </div>
                      <p className="text-[9px] font-bold mt-1 text-red-400">
                        {workoutSummary.strengthEmphasis}%
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                      <p className="text-[8px] font-black uppercase text-white/30 mb-1">
                        Cardio
                      </p>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400"
                          style={{ width: `${workoutSummary.cardioEmphasis}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-bold mt-1 text-green-400">
                        {workoutSummary.cardioEmphasis}%
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {workoutSummary.safetyNotes.map(
                      (note: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/5 text-[8px] font-bold text-white/70"
                        >
                          <Shield className="w-2.5 h-2.5 text-gold" />
                          {note}
                        </div>
                      ),
                    )}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/5 text-[8px] font-bold text-white/70">
                      <Heart className="w-2.5 h-2.5 text-red-400" />
                      Recovery: {workoutSummary.recoveryFocus}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {storyboard.map((item, idx) => {
                const sceneScript = aiScript.find(
                  (s) =>
                    s.exerciseName?.trim().toLowerCase() ===
                    item.name?.trim().toLowerCase(),
                );
                return (
                  <div
                    key={`script-${item.instanceId}`}
                    className={`p-3 rounded-xl border transition-all group ${activeItemIndex === idx ? "border-gold bg-gold/5" : "border-white/5 bg-white/5"}`}
                    onClick={() => Orchestrator.seekToScene(idx, 0)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                          Scene {idx + 1}
                        </span>
                        {item.reason && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gold/10 text-[7px] font-black uppercase text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                            <Zap className="w-2 h-2" /> Adaptive Logic
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateCustomVideo(
                              item.instanceId,
                              item.name,
                            );
                          }}
                          className={`p-1.5 rounded-lg transition-all ${isGeneratingVideo[item.instanceId] ? "bg-gold/50" : "bg-white/5 text-white/40 hover:text-gold"}`}
                          title="Generate AI Video (VEO)"
                        >
                          <Video className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-2">
                      <p className="text-xs font-bold">{item.name}</p>
                      {item.reason && (
                        <p className="text-[7px] font-black uppercase tracking-wider text-gold/60 mt-0.5">
                          {item.reason}
                        </p>
                      )}
                    </div>

                    <p className="text-[10px] text-white/60 leading-relaxed italic">
                      {sceneScript?.script ||
                        "No script generated for this scene."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }, [
    isGeneratingAi,
    storyboard,
    aiScript,
    activeItemIndex,
    isGeneratingVideo,
    handleGenerateCustomVideo,
    workoutSummary,
  ]);

  const completeWorkout = useCallback(() => {
    if (storyboard.length === 0) return;
    
    // Increment mobility streak in athlete system
    streakEngine.incrementMobilityStreak();
    
    // Track memory
    const durationMins = Math.floor(storyboard.reduce((acc, curr) => acc + curr.duration, 0) / 60);
    snapshotManager.takeDailySnapshot({
      sessionCompleted: true,
      sessionDuration: durationMins,
      preferredVibe: vibe,
    });

    const newReport: WorkoutReport = {
      id: generateId(),
      userId: "anonymous",
      date: new Date().toISOString(),
      durationMinutes: Math.floor(
        storyboard.reduce((acc, curr) => acc + curr.duration, 0) / 60,
      ),
      exercisesCompleted: storyboard.map((item) => item.name),
      perceivedExertion:
        wizardConfig.intensity === "High"
          ? 8
          : wizardConfig.intensity === "Medium"
            ? 6
            : 4,
      formQualityScore: 90,
      coachingSummaries: [workoutSummary?.reasoning],
    };

    setWorkoutReports((prev) => [...prev, newReport]);

    // Logic to advance phase
    if (activeProgram) {
      const workoutsInProgram = workoutReports.length + 1;
      if (
        workoutsInProgram >= 10 &&
        activeProgram.currentPhaseIndex < activeProgram.phases.length - 1
      ) {
        setShowPhaseComplete(
          activeProgram.phases[activeProgram.currentPhaseIndex].name,
        );
        setActiveProgram((prev) =>
          prev
            ? { ...prev, currentPhaseIndex: prev.currentPhaseIndex + 1 }
            : null,
        );
      }
    }

    showNotification("Workout saved to progression history!");
  }, [
    storyboard,
    wizardConfig.intensity,
    workoutSummary?.reasoning,
    activeProgram,
    workoutReports.length,
    showNotification,
  ]);

  const renderedProgressionTab = useMemo(() => {
    if (!currentProgression || !activeProgram) return null;
    const readiness = calculateReadiness(currentProgression);
    const currentPhase = activeProgram.phases[activeProgram.currentPhaseIndex];
    const activeCoach =
      COACH_PROFILES.find((c) => c.id === wizardConfig.selectedCoachId) ||
      COACH_PROFILES[0];
    const dailyInspiration = getDailyInspiration(currentProgression, readiness);
    const theme =
      atmosphere ||
      calculateAtmosphere(
        currentProgression,
        readiness,
        activeCoach,
        currentPhase.name,
      );

    const startRitual = (type: string) => {
      const ritualConfig = {
        ...wizardConfig,
        durationMinutes: 5,
        type: type === "Recovery" ? "Recovery" : "Stretching",
        intensity: type === "Recovery" ? "Low" : "Medium",
        focus: type === "Activation" ? "Full Body" : "Lower Body",
      };
      generateRoutine(ritualConfig);
      setActiveTab("assets");
    };

    return (
      <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto px-4 md:px-6 py-6 space-y-6 custom-scrollbar pb-32">
        {workoutReports.length === 0 ? (
          <div className="space-y-6">
            {/* New User Welcome / Value Discovery */}
            <div className="p-7 border-b border-white/5 space-y-2 opacity-60">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/50">
                Coach Initialization
              </h3>
              <p className="text-xs font-medium leading-relaxed max-w-sm">
                The coaching intelligence module requires runtime data to
                synthesize progressions. Complete a workout to begin tracking
                readiness and adaptive pacing.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">
                System Pipeline
              </h4>
              <div className="grid grid-cols-1 gap-4 opacity-50">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Zap className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white mb-0.5">
                      Momentum Engine
                    </p>
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      We track every session to build your movement profile.
                      Consistency unlocks advanced coaching behaviors.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white mb-0.5">
                      Customized Pathology
                    </p>
                    <p className="text-[9px] text-white/40 leading-relaxed">
                      By selecting pain points in the builder, our engine
                      prioritizes corrective biomechanics for your specific
                      needs.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-white/60"
              >
                Build Your First Session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Journey Dashboard (New) */}
            <div className="mb-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-2 mb-3">
                <Compass className="w-3.5 h-3.5" /> Transformation Journey
              </label>

              <div className="p-6 rounded-[2.5rem] border border-white/10 bg-white/2 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                  <Target className="w-32 h-32" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-serif italic text-white leading-tight">
                      {currentJourney.name}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold/80">
                      {currentJourney.focus}
                    </p>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
                      {currentProgression.completedWorkoutCount >=
                      currentJourney.milestones[
                        currentJourney.milestones.length - 1
                      ].workoutRequirement
                        ? "Journey Complete"
                        : "Progressing"}
                    </span>
                  </div>
                </div>

                {transformationNarrative && (
                  <div className="space-y-4 relative z-10">
                    <div className="p-5 rounded-2xl bg-charcoal/40 border border-white/5 space-y-3 relative overflow-hidden group/narrative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/10 to-transparent opacity-0 group-hover/narrative:opacity-100 transition duration-1000" />
                      <div className="flex items-center gap-2 relative z-10">
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                        <p className="text-[11px] font-bold text-white tracking-tight">
                          {transformationNarrative.title}
                        </p>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed italic relative z-10 font-medium">
                        "{transformationNarrative.message}"
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10">
                        <span className="text-[8px] font-black uppercase tracking-widest text-gold/60">
                          {transformationNarrative.highlight}
                        </span>
                        <div className="flex gap-2">
                          {currentJourney.milestones.map((m, i) => (
                            <div
                              key={m.id}
                              className={`w-2 h-2 rounded-full transition-all duration-700 ${
                                currentProgression.completedWorkoutCount >=
                                m.workoutRequirement
                                  ? "bg-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                                  : "bg-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6 relative z-10 pt-2">
                  <div className="space-y-1">
                    <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">
                      Coaching Tone
                    </p>
                    <p className="text-[11px] text-white font-medium">
                      {currentJourney.coachingTone}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[7px] text-white/30 uppercase font-black tracking-widest">
                      Movement Emphasis
                    </p>
                    <p className="text-[11px] text-white font-medium italic">
                      {currentJourney.movementEmphasis.slice(0, 2).join(" • ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey Picker */}
              <div className="flex gap-2 mt-4 pb-2 overflow-x-auto no-scrollbar mask-fade-right">
                {GOAL_JOURNEYS.map((j) => (
                  <button
                    key={j.id}
                    onClick={() => setCurrentJourneyId(j.id)}
                    className={`shrink-0 px-5 py-4 rounded-2xl border transition-all duration-500 backdrop-blur-sm ${
                      currentJourneyId === j.id
                        ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                        : "border-white/5 bg-white/2 hover:bg-white/5 hover:border-white/10 text-white/40"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold mb-1 whitespace-nowrap ${currentJourneyId === j.id ? "text-white" : ""}`}
                    >
                      {j.name}
                    </p>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-60 whitespace-nowrap">
                      {j.pacingStyle}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Contextual Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-6 rounded-[2.5rem] relative overflow-hidden group transition-all duration-700 shadow-xl`}
              style={{
                background:
                  priorityContext.focus === "recovery"
                    ? "linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(30,58,138,0.1) 100%)"
                    : priorityContext.focus === "performance"
                      ? "linear-gradient(135deg, rgba(234,179,8,0.2) 0%, rgba(234,179,8,0.05) 100%)"
                      : "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: `1px solid ${priorityContext.focus === "recovery" ? "rgba(96,165,250,0.3)" : priorityContext.focus === "performance" ? "rgba(234,179,8,0.3)" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div className="absolute -right-8 -top-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                {priorityContext.icon &&
                  React.cloneElement(priorityContext.icon as any, {
                    className: "w-48 h-48",
                  })}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div
                  className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                    priorityContext.focus === "recovery"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-gold/20 text-gold border-gold/30"
                  }`}
                >
                  {priorityContext.focus} priority
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-white/10 border border-charcoal flex items-center justify-center text-[8px] font-bold"
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              <h3 className="text-2xl font-serif italic text-white mb-2 leading-tight">
                {priorityContext.focus === "recovery"
                  ? "Nervous System Recovery"
                  : priorityContext.focus === "performance"
                    ? "Peak Output Potential"
                    : "Consistent Flow"}
              </h3>
              <p className="text-[11px] text-white/50 leading-relaxed mb-8 max-w-[85%] font-medium italic">
                "{priorityContext.message}"
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (priorityContext.focus === "recovery")
                      startRitual("Recovery");
                    else setShowWizard(true);
                  }}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${
                    priorityContext.focus === "recovery"
                      ? "bg-blue-500 text-white"
                      : "bg-gold text-charcoal"
                  }`}
                >
                  <span className="relative z-10">
                    {priorityContext.primaryAction}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                </button>
                <button
                  onClick={() => setActiveTab("assets")}
                  className="w-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* Contextual Quick Actions */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {priorityContext.focus === "recovery" ? (
                <>
                  <button
                    onClick={() => startRitual("Recovery")}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black uppercase text-blue-400"
                  >
                    <Shield className="w-3 h-3" /> Neural Reset
                  </button>
                  <button
                    onClick={() => setWizardTab("templates")}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40"
                  >
                    <Calendar className="w-3 h-3" /> Slow Flow
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowWizard(true)}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold/10 border border-gold/20 text-[9px] font-black uppercase text-gold"
                  >
                    <Zap className="w-3 h-3" /> Heavy Session
                  </button>
                  <button
                    onClick={() => setActiveTab("growth")}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40"
                  >
                    <Share2 className="w-3 h-3" /> Export Daily
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab("progression")}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-white/40"
              >
                <BarChart3 className="w-3 h-3" /> Insights
              </button>
            </div>

            {/* ADAPTIVE REORDERING: Insights prioritized if recovery focus */}
            {priorityContext.focus === "recovery" && (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex gap-4 items-start">
                <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-red-400">
                    Physiological Load Alert
                  </p>
                  <p className="text-[9px] text-red-500/60 leading-relaxed italic">
                    Coach {activeCoach.name} has detected system strain.
                    High-intensity routines are throttled to protect your
                    baseline.
                  </p>
                </div>
              </div>
            )}

            {/* Beginner Simplification: Hide complex program cards initially */}
            {currentProgression.completedWorkoutCount >= 3 ? (
              <div className="space-y-4">
                {/* Program Status Card */}
                <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Compass className="w-24 h-24 text-gold" />
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gold/20 text-gold">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                        Active Program
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-white/40 uppercase">
                      Phase {activeProgram.currentPhaseIndex + 1}/
                      {activeProgram.phases.length}
                    </span>
                  </div>

                  <h3 className="text-sm font-black uppercase text-white mb-1">
                    {activeProgram.name}
                  </h3>
                  <p className="text-[10px] text-white/50 mb-4">
                    {activeProgram.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[9px] font-bold">
                      <span className="text-white/60">
                        Current: {currentPhase.name}
                      </span>
                      <span className="text-gold">{currentPhase.type}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all duration-1000"
                        style={{
                          width: `${(currentProgression.completedWorkoutCount % 10) * 10}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Momentum & Readiness */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
                    <p className="text-[8px] font-black uppercase text-white/30 mb-2">
                      Momentum
                    </p>
                    <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-white/5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-gold"
                          strokeDasharray={126}
                          strokeDashoffset={
                            126 - (126 * currentProgression.momentumScore) / 100
                          }
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <Zap className="w-2.5 h-2.5 text-gold mb-0.5" />
                        <span className="text-[10px] font-black">
                          {currentProgression.momentumScore}
                        </span>
                      </div>
                    </div>
                    <p className="text-[8px] font-bold text-white/60 uppercase">
                      Intensity Trend
                    </p>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
                    <p className="text-[8px] font-black uppercase text-white/30 mb-2">
                      Readiness
                    </p>
                    <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="3"
                          className="text-white/5"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="3"
                          className={
                            readiness.score > 70
                              ? "text-green-400"
                              : readiness.score > 40
                                ? "text-gold"
                                : "text-red-400"
                          }
                          strokeDasharray={126}
                          strokeDashoffset={126 - (126 * readiness.score) / 100}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black">
                        {readiness.score}
                      </span>
                    </div>
                    <p className="text-[8px] font-bold text-white/60 uppercase">
                      {readiness.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border-b border-white/5 flex flex-col items-center justify-center text-center py-12 opacity-60">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Phase 1: Foundation
                </p>
                <p className="text-xs text-white/50 leading-relaxed max-w-[200px] mt-2">
                  Complete 3 sessions to unlock full performance telemetry and
                  biometric history.
                </p>
              </div>
            )}

            {/* Intelligent Space Utilization: Coach Nudge */}
            <div className="pt-4 pb-8 flex justify-center">
              <div className="flex items-center gap-3 px-4 py-2 opacity-50">
                <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/40">
                  Coach {activeCoach.name} is observing your flow
                </span>
              </div>
            </div>

            {/* Active Coach Profile */}
            <div className="relative group mb-2">
              <div
                className="relative p-4 rounded-xl border flex items-center gap-4 transition-all duration-500"
                style={{
                  borderColor: `${theme.primaryColor}20`,
                  backgroundColor: `${theme.primaryColor}05`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative"
                  style={{
                    backgroundColor: `${theme.primaryColor}10`,
                    border: `1px solid ${theme.primaryColor}30`,
                    boxShadow: `0 8px 16px ${theme.primaryColor}15`,
                  }}
                >
                  <Award
                    className="w-6 h-6"
                    style={{ color: theme.primaryColor }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-charcoal" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-serif italic text-white leading-none">
                      Coach {activeCoach.name}
                    </h3>
                    <span
                      className="px-1.5 py-0.5 rounded-full border text-[6px] font-black uppercase tracking-widest leading-none"
                      style={{
                        backgroundColor: `${theme.primaryColor}10`,
                        borderColor: `${theme.primaryColor}20`,
                        color: theme.primaryColor,
                      }}
                    >
                      {activeCoach.personality}
                    </span>
                  </div>
                  <p className="text-[8px] text-white/50 leading-relaxed italic line-clamp-1">
                    "{activeCoach.tagline}"
                  </p>
                </div>
              </div>
            </div>

            {/* Daily Guidance Snapshot */}
            <div
              className="p-4 rounded-2xl border border-white/5 bg-white/2 space-y-3 relative overflow-hidden"
              style={{
                borderLeft: `4px solid ${theme.primaryColor}`,
                boxShadow: `0 0 40px ${theme.glowColor}`,
              }}
            >
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Daily Guidance
                </label>
                <div
                  className="px-2 py-0.5 rounded-full text-[7px] font-black uppercase border"
                  style={{
                    backgroundColor: `${theme.primaryColor}10`,
                    color: theme.primaryColor,
                    borderColor: `${theme.primaryColor}30`,
                  }}
                >
                  {dailyInspiration.focus}
                </div>
              </div>

              {evolutionMessage && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/10 border border-gold/20">
                  <Award className="w-3 h-3 text-gold" />
                  <span className="text-[9px] font-black uppercase text-gold tracking-tight">
                    {evolutionMessage}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                {dailyInspiration.message}
              </p>

              {/* Quick Actions (Rituals) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => startRitual(dailyInspiration.ritualType)}
                  className="p-3 rounded-xl flex flex-col items-center gap-1 transition-all"
                  style={{
                    backgroundColor: `${theme.primaryColor}10`,
                    border: `1px solid ${theme.primaryColor}30`,
                    color: theme.primaryColor,
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    Start Ritual
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("music")}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 flex flex-col items-center gap-1 hover:bg-white/10 transition-all"
                >
                  <Music className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-tighter">
                    Audio Focus
                  </span>
                </button>
              </div>
            </div>

            {/* Program Status Card */}
            <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Compass className="w-24 h-24 text-gold" />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gold/20 text-gold">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                    Active Program
                  </span>
                </div>
                <span className="text-[9px] font-bold text-white/40 uppercase">
                  Phase {activeProgram.currentPhaseIndex + 1}/
                  {activeProgram.phases.length}
                </span>
              </div>

              <h3 className="text-sm font-black uppercase text-white mb-1">
                {activeProgram.name}
              </h3>
              <p className="text-[10px] text-white/50 mb-4">
                {activeProgram.description}
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[9px] font-bold">
                  <span className="text-white/60">
                    Current: {currentPhase.name}
                  </span>
                  <span className="text-gold">{currentPhase.type}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-1000"
                    style={{
                      width: `${(currentProgression.completedWorkoutCount % 10) * 10}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Momentum & Readiness */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-black uppercase text-white/30 mb-2">
                  Momentum
                </p>
                <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white/5"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-gold"
                      strokeDasharray={126}
                      strokeDashoffset={
                        126 - (126 * currentProgression.momentumScore) / 100
                      }
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <Zap className="w-2.5 h-2.5 text-gold mb-0.5" />
                    <span className="text-[10px] font-black">
                      {currentProgression.momentumScore}
                    </span>
                  </div>
                </div>
                <p className="text-[8px] font-bold text-white/60 uppercase">
                  Intensity Trend
                </p>
              </div>

              <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-black uppercase text-white/30 mb-2">
                  Readiness
                </p>
                <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                  <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-white/5"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="3"
                      className={
                        readiness.score > 70
                          ? "text-green-400"
                          : readiness.score > 40
                            ? "text-gold"
                            : "text-red-400"
                      }
                      strokeDasharray={126}
                      strokeDashoffset={126 - (126 * readiness.score) / 100}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black">
                    {readiness.score}
                  </span>
                </div>
                <p className="text-[8px] font-bold text-white/60 uppercase">
                  {readiness.recommendation}
                </p>
              </div>
            </div>

            {/* Premium Professional Insights Layer */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Movement Intelligence
              </label>
              <div className="grid grid-cols-2 gap-3">
                {readiness.insights.map((insight, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -2 }}
                    className="p-4 rounded-[1.5rem] border border-white/5 bg-white/2 space-y-3 group hover:bg-white/5 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">
                        {insight.label}
                      </span>
                      <div
                        className={`w-1 h-1 rounded-full ${
                          insight.status === "optimal"
                            ? "bg-green-400"
                            : insight.status === "balanced"
                              ? "bg-gold"
                              : insight.status === "strained"
                                ? "bg-red-400"
                                : "bg-blue-400"
                        } shadow-sm shadow-current`}
                      />
                    </div>

                    <div className="flex items-baseline gap-1 relative z-10">
                      <span className="text-xl font-bold text-white tabular-nums">
                        {insight.value}
                      </span>
                      <span
                        className={`text-[6px] font-black uppercase tracking-tighter ${
                          insight.status === "optimal"
                            ? "text-green-400/60"
                            : insight.status === "balanced"
                              ? "text-gold/60"
                              : insight.status === "strained"
                                ? "text-red-400/60"
                                : "text-blue-400/60"
                        }`}
                      >
                        {insight.status}
                      </span>
                    </div>

                    <p className="text-[7px] text-white/40 leading-relaxed italic line-clamp-2 relative z-10 border-t border-white/5 pt-2">
                      {insight.interpretation}
                    </p>

                    {/* Subtle subtle background highlight for status */}
                    <div
                      className={`absolute bottom-0 right-0 w-12 h-12 blur-2xl opacity-5 rounded-full transition-all duration-700 ${
                        insight.status === "optimal"
                          ? "bg-green-400"
                          : insight.status === "balanced"
                            ? "bg-gold"
                            : insight.status === "strained"
                              ? "bg-red-400"
                              : "bg-blue-400"
                      }`}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal/50 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                    Coaching Interpretation
                  </span>
                </div>
                <Activity className="w-3 h-3 text-white/20" />
              </div>

              <div className="space-y-3">
                <div className="flex gap-4">
                  <div className="w-0.5 h-auto bg-gold/30 rounded-full" />
                  <div className="space-y-1">
                    <p className="text-[11px] text-white/90 leading-relaxed italic">
                      {transformationNarrative
                        ? transformationNarrative.message
                        : readiness.score > 80
                          ? "The system reports a highly favorable movement window. System stability is peaking, suggesting active movements will be effectively integrated today."
                          : readiness.score > 60
                            ? "Body is maintaining a stable baseline. Recommend focusing on movement resolution and structural control rather than raw intensity."
                            : "Fatigue markers detected in movement regulation. Coach is throttling intensity to prioritize system restoration and sustainable progress."}
                    </p>
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30">
                      Coach {activeCoach.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coaching Achievements (Milestones) */}
            {currentProgression.achievements.length > 0 && (
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Award className="w-3 h-3" /> Coaching Milestones
                </label>
                <div className="flex gap-2 pb-1 overflow-x-auto custom-scrollbar no-scrollbar">
                  {currentProgression.achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="shrink-0 w-28 p-3 rounded-xl border border-gold/20 bg-gold/5 flex flex-col items-center text-center"
                    >
                      <div className="p-1.5 rounded-full bg-gold/10 text-gold mb-2">
                        <Award className="w-3 h-3" />
                      </div>
                      <p className="text-[8px] font-black uppercase text-white mb-0.5 line-clamp-1">
                        {ach.title}
                      </p>
                      <p className="text-[6px] text-white/40 leading-tight line-clamp-2">
                        {ach.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trends & Assessments (Storytelling) */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <History className="w-3 h-3" /> Historical Trajectory
              </label>
              <div className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white mb-0.5">
                      Foundation Stability
                    </p>
                    <p className="text-[8px] text-white/40">
                      Assessment:{" "}
                      {currentProgression.completedWorkoutCount > 5
                        ? "High resolution"
                        : "Interpolating"}
                    </p>
                  </div>
                  <div className="flex gap-1 items-end h-6">
                    {[40, 60, 55, 75, 85].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 rounded-t-full bg-gold/40"
                        style={{ height: `${h}%`, opacity: 0.2 + i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                    <p className="text-[9px] text-white/60">
                      Consistency Pattern:{" "}
                      <span className="text-white font-bold">
                        {currentProgression.consistencyStreak > 2
                          ? "Strengthening"
                          : "Establishing"}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-400" />
                    <p className="text-[9px] text-white/60">
                      Movement Recovery:{" "}
                      <span className="text-white font-bold">
                        Trending Positive
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insights (simplified/cleaned up) */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                <Brain className="w-3 h-3" /> {activeCoach.name}'s Insights
              </label>
              <div className="space-y-2">
                {/* Personalized Greeting */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-10">
                    <Award className="w-12 h-12 text-gold" />
                  </div>
                  <p className="text-[10px] text-white/70 leading-relaxed italic pr-8">
                    {currentProgression.consistencyStreak > 2
                      ? `"${activeCoach.name} has noted your ${currentProgression.consistencyStreak}-day streak. They're dialing in more specific cues for today's session based on your high readiness."`
                      : `"${activeCoach.name} suggests focusing heavily on form today. We're rebuilding momentum, and quality movement is our priority."`}
                  </p>
                </div>

                {/* Over-training Warning */}
                {readiness.score < 50 && (
                  <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5 flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                      <Shield className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-red-500 mb-0.5">
                        Overtraining Risk
                      </p>
                      <p className="text-[9px] text-red-500/70 leading-relaxed">
                        High-intensity stacking detected. Your recovery trend is
                        declining; recommend active recovery sessions only.
                      </p>
                    </div>
                  </div>
                )}

                {/* Consistency Warning */}
                {currentProgression.consistencyStreak < 2 &&
                  currentProgression.completedWorkoutCount > 0 && (
                    <div className="p-3 rounded-xl border border-gold/30 bg-gold/5 flex items-start gap-3">
                      <div className="p-1.5 rounded-lg bg-gold/10 text-gold shrink-0">
                        <Zap className="w-3 h-3" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gold mb-0.5">
                          Momentum at Risk
                        </p>
                        <p className="text-[9px] text-gold/70 leading-relaxed">
                          Consistency has dipped recently. A short 5-minute
                          movement snack today can restart your streak.
                        </p>
                      </div>
                    </div>
                  )}

                <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                    <Shield className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white mb-0.5">
                      Recovery Distribution
                    </p>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      {readiness.recommendation === "Recover"
                        ? "System recommends shifting next 48 hours toward restorative mobility due to fatigue peaks."
                        : readiness.score < 80
                          ? "Balanced recovery integration detected. Maintaining baseline mobility volume."
                          : "Optimal status. Proposing increased volume for hypertrophy targets."}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-white/5 flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-gold/10 text-gold shrink-0">
                    <BarChart3 className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white mb-0.5">
                      Progression Path
                    </p>
                    <p className="text-[9px] text-white/50 leading-relaxed">
                      {currentProgression.completedWorkoutCount < 5
                        ? "Phase 1: Foundation. Building essential movement patterns and stability."
                        : `Currently ${Math.round(
                            ((currentProgression.completedWorkoutCount % 10) /
                              10) *
                              100,
                          )}% toward phase completion.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Analysis for experienced users */}
            {currentProgression.completedWorkoutCount >= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl border border-gold/10 bg-gold/5 space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Sparkles className="w-12 h-12 text-gold" />
                </div>
                <label className="text-[8px] font-black uppercase tracking-widest text-gold flex items-center gap-2">
                  <Zap className="w-2.5 h-2.5" /> High-Resolution Movement
                  Profile
                </label>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="space-y-1">
                    <p className="text-[7px] text-white/30 uppercase font-black">
                      Force Dispersion
                    </p>
                    <p className="text-[10px] text-white font-medium">
                      Optimal Symmetry
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[7px] text-white/30 uppercase font-black">
                      Neural Efficiency
                    </p>
                    <p className="text-[10px] text-white font-medium">
                      92% Baseline
                    </p>
                  </div>
                </div>
                <p className="text-[7px] text-white/40 leading-relaxed italic relative z-10 border-t border-white/5 pt-2">
                  "Deep analysis indicates pattern mastery is reaching
                  threshold. Coach is preparing advanced stability protocols for
                  Phase 3."
                </p>
              </motion.div>
            )}

            <button
              onClick={completeWorkout}
              disabled={storyboard.length === 0}
              className="w-full py-3 rounded-xl bg-gold text-charcoal font-black uppercase text-[10px] tracking-widest hover:bg-gold/90 transition-all disabled:opacity-50"
            >
              Log Session to History
            </button>

            {/* Switch Program */}
            <div className="p-4 rounded-xl border border-white/5 bg-white/2">
              <h4 className="text-[8px] font-black uppercase text-white/30 mb-3 tracking-widest">
                Switch Program
              </h4>
              <div className="space-y-2">
                {PRESET_PROGRAMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveProgram(p);
                      showNotification(`Now following: ${p.name}`);
                    }}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all ${activeProgram.id === p.id ? "border-gold bg-gold/5" : "border-white/5 bg-white/5 hover:bg-white/10"}`}
                  >
                    <p className="text-[9px] font-bold text-white">{p.name}</p>
                    <p className="text-[7px] text-white/40">
                      {p.phases.length} Phases • {p.phases[0].intensityTarget}{" "}
                      Intensity
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Session History timeline */}
            {workoutReports.length > 0 && (
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <History className="w-3 h-3" /> Recent History
                </label>
                <div className="space-y-2">
                  {workoutReports
                    .slice(-3)
                    .reverse()
                    .map((report) => (
                      <div
                        key={report.id}
                        className="p-3 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-white/5 text-white/40">
                            <Activity className="w-3 h-3" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white">
                              {new Date(report.date).toLocaleDateString()}
                            </p>
                            <p className="text-[8px] text-white/40 uppercase font-black">
                              {report.durationMinutes}m •{" "}
                              {report.exercisesCompleted.length} Exercises
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-3 rounded-full ${i < report.perceivedExertion / 2 ? "bg-gold" : "bg-white/10"}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [
    currentProgression,
    activeProgram,
    completeWorkout,
    storyboard.length,
    workoutReports,
    evolutionMessage,
    atmosphere,
    priorityContext,
    wizardConfig.selectedCoachId,
  ]);

  const TabButton = ({
    id,
    label,
    icon: Icon,
    onClick,
    isActive,
    showGeneratingIndicator,
  }: {
    id: string;
    label: string;
    icon?: any;
    onClick: () => void;
    isActive: boolean;
    showGeneratingIndicator?: boolean;
  }) => (
    <button
      data-tab-id={id}
      id={`tab-btn-${id}`}
      onClick={(e) => {
        if (isNavDraggingRef.current) return;

        // Use a safer scrolling method that doesn't affect the whole window
        const container = e.currentTarget.parentElement;
        if (container) {
          const button = e.currentTarget;
          const containerWidth = container.offsetWidth;
          const buttonWidth = button.offsetWidth;
          const buttonLeft = button.offsetLeft;

          container.scrollTo({
            left: buttonLeft - containerWidth / 2 + buttonWidth / 2,
            behavior: "smooth",
          });
        }

        onClick();
      }}
      className={`relative snap-center shrink-0 min-w-[max-content] px-6 md:px-0 md:min-w-0 md:flex-1 py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${
        isActive ? "text-white" : "text-white/30 hover:text-white/60"
      }`}
    >
      {Icon && (
        <Icon
          className={`w-3.5 h-3.5 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
        />
      )}
      <span className="relative z-10">{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 bg-white/[0.03] border-b-2 border-gold"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {showGeneratingIndicator && (
        <div className="absolute top-1 right-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
        </div>
      )}
    </button>
  );

  // Compute Confidence
  const sessionConfidence = useMemo(() => {
    const dur = parseInt(wizardConfig.duration || "60") / 60;
    return calculateSessionConfidence(dur, athleteDNA, evolutionMetrics);
  }, [wizardConfig.duration, athleteDNA, evolutionMetrics]);

  return (
    <>
      <motion.div
        initial={V.fadeUp.initial}
        animate={V.fadeUp.animate}
        exit={V.fadeUp.exit}
        transition={{
          duration: transitionClasses.cinematic.duration * motionMultiplier,
          ease: transitionClasses.cinematic.ease,
        }}
        className={`flex-1 md:min-h-0 w-full max-w-full bg-charcoal text-cream flex flex-col overflow-x-hidden md:overflow-hidden font-sans antialiased relative transition-all duration-[2000ms] ease-in-out ${ambientClasses}`}
      >
        {/* Adaptive Atmosphere Layer */}
        {generationMessage && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-gold text-charcoal p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-white/20 backdrop-blur-md"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs font-black uppercase tracking-tight">
                {generationMessage}
              </p>
            </motion.div>
          </div>
        )}
        {atmosphere && (
          <div
            className={`absolute inset-0 pointer-events-none z-0 overflow-hidden`}
          >
            <motion.div
              initial={false}
              animate={{
                opacity: atmosphere.intensity * 0.3,
              }}
              className={`absolute inset-0 bg-gradient-to-br ${atmosphere.ambientStyle} transition-all duration-1000`}
            />
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-[20%] -left-[20%] w-[140%] h-[140%] bg-radial-gradient from-gold/5 via-transparent to-transparent blur-[120px]"
              style={{
                backgroundImage: `radial-gradient(circle at center, ${atmosphere.glowColor} 0%, transparent 70%)`,
              }}
            />
          </div>
        )}

        {/* Hidden Export Canvas */}
        <canvas ref={exportCanvasRef} className="hidden" />
        <audio
          ref={soundtrackAudioRef}
          className="hidden"
          crossOrigin="anonymous"
          loop
        />

        <AnimatePresence>
          {showWizard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={transitionClasses.cinematic}
              className="fixed inset-0 h-[100dvh] z-[100] bg-charcoal text-cream flex flex-col md:flex-row overflow-y-auto overflow-x-hidden md:overflow-hidden flex-nowrap"
            >
              <AnimatePresence>
                {isInitializingProtocol && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={transitionClasses.system}
                    className="absolute inset-0 z-[200] bg-charcoal flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gold/5 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 rounded-2xl border-2 border-gold/10" />
                      <div className="absolute inset-2 rounded-xl border border-gold/20" />
                      <Activity className="w-6 h-6 text-gold/80" />
                    </div>
                    <h2 className="text-3xl font-serif italic text-white mb-3">
                      Preparing user content...
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/40">
                      Initializing Adaptive Logic
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar / OS Initialization */}
              <div className="w-full md:w-[420px] bg-charcoal border-b md:border-b-0 md:border-r border-white/5 flex flex-col p-8 md:p-12 relative shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                  {/* Top Branding */}
                  <div className="mb-16">
                    <Link to="/" className="inline-block mb-8 group relative z-50">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...transitionClasses.system, delay: 0.2 }}
                        className="flex items-center gap-3 transition-opacity group-hover:opacity-80"
                      >
                        <Logo size="md" light iconOnly />
                        <span className="font-serif italic text-cream font-medium tracking-tight text-xl hidden md:block">
                          Stretching Pro
                        </span>
                      </motion.div>
                    </Link>

                    <motion.h2
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ ...transitionClasses.system, delay: 0.3 }}
                      className="text-3xl md:text-5xl font-serif italic mb-4 text-white"
                    >
                      Studio Gateway
                    </motion.h2>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ ...transitionClasses.system, delay: 0.4 }}
                      className="text-[10px] md:text-xs text-white/40 uppercase tracking-[0.3em] font-medium"
                    >
                      Adaptive Orchestration
                    </motion.p>
                  </div>

                  {/* Adaptive Entry Intelligence */}
                  <div className="space-y-8 flex-1">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...transitionClasses.system, delay: 0.6 }}
                    >
                      <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold/80 flex items-center gap-2 mb-4">
                        <Activity className="w-3 h-3" /> System Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                          <span className="text-xs text-white/70">
                            Engine Online
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          <span className="text-xs text-white/70">
                            800+ Verified Assets Ready
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...transitionClasses.system, delay: 0.8 }}
                    >
                      <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold/80 flex items-center gap-2 mb-4">
                        <Zap className="w-3 h-3" /> Context Agent
                      </h3>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                        <p className="text-xs text-white/80 leading-relaxed font-light">
                          “Morning routines are optimal right now. Momentum is
                          stable. Atlas has prepared a flow.”
                        </p>
                        <div className="flex items-center gap-2 text-[9px] uppercase tracking-wider text-white/40">
                          <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                          Readiness Calibrated
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Footing */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...transitionClasses.system, delay: 1.2 }}
                    className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/30"
                  >
                    <span>Stretching OS</span>
                    <span>V 1.4.0</span>
                  </motion.div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 md:min-h-0 bg-[#FDFBF7] text-charcoal flex flex-col relative md:overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent pointer-events-none" />

                {/* Scrollable inner content */}
                <div className="flex-1 overflow-y-auto w-full p-4 md:p-12 pb-[calc(2rem+env(safe-area-inset-bottom))] custom-scrollbar relative z-10">
                  <div className="max-w-5xl mx-auto space-y-12 flex flex-col min-h-full">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between shrink-0">
                      {/* Tab Selector */}
                      <div className="flex bg-charcoal/5 p-1.5 rounded-full w-fit shadow-sm border border-charcoal/5">
                        <button
                          onClick={() => setWizardTab("templates")}
                          className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${wizardTab === "templates" ? "bg-white text-charcoal shadow-sm scale-105" : "text-charcoal/40 hover:text-charcoal"}`}
                        >
                          Presets
                        </button>
                        <button
                          onClick={() => setWizardTab("custom")}
                          className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${wizardTab === "custom" ? "bg-white text-charcoal shadow-sm scale-105" : "text-charcoal/40 hover:text-charcoal"}`}
                        >
                          Custom Build
                        </button>
                      </div>
                    </div>

                    {wizardTab === "templates" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center gap-3 mb-8">
                          <div className="h-4 w-1 bg-gold rounded-full" />
                          <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-charcoal/50">
                            Suggested Flows
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                          <AnimatePresence>
                            {STUDIO_TEMPLATES.map((tpl, idx) => (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                  ...transitionClasses.cinematic,
                                  delay: 0.4 + idx * 0.1,
                                }}
                                key={tpl.id}
                                onClick={() => applyTemplate(tpl)}
                                className={`group p-6 rounded-[2rem] bg-white border border-charcoal/5 hover:border-gold/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 text-left relative overflow-hidden ${idx === 0 ? "ring-1 ring-gold/20 shadow-md" : ""}`}
                              >
                                {idx === 0 && (
                                  <div className="absolute top-4 right-4 bg-gold/10 text-gold px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                    Recommended
                                  </div>
                                )}
                                <div className="relative z-10 flex flex-col h-full min-h-[160px]">
                                  <div className="flex items-center mb-6">
                                    <div
                                      className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-colors duration-500 ${idx === 0 ? "bg-gold/10" : "bg-charcoal/5 group-hover:bg-gold/10"}`}
                                    >
                                      {tpl.type === "Cardio" && (
                                        <Activity
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                      {tpl.type === "Strength" && (
                                        <Layers
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                      {(tpl.type === "Mobility" ||
                                        tpl.type === "Stretching") && (
                                        <Target
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                      {tpl.type === "HIIT" && (
                                        <Zap
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                      {tpl.type === "Functional" && (
                                        <Box
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                      {tpl.id === "desk" && (
                                        <Monitor
                                          className={`w-5 h-5 transition-colors ${idx === 0 ? "text-gold" : "text-charcoal/30 group-hover:text-gold"}`}
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <h3 className="font-serif italic text-2xl text-charcoal mb-2 group-hover:text-charcoal transition-colors">
                                    {tpl.name}
                                  </h3>
                                  <p className="text-[11px] font-medium text-charcoal/40 leading-relaxed max-w-[90%] mt-auto">
                                    {tpl.description}
                                  </p>

                                  <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/30 group-hover:text-charcoal/50 transition-colors">
                                      {tpl.duration / 60}m Flow
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-charcoal/20 group-hover:text-gold transition-colors group-hover:translate-x-1" />
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </motion.button>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                      >
                        {/* Step 1: Training Protocol */}
                        <div className="space-y-4 md:space-y-6 mb-12">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-medium uppercase tracking-[0.2em] text-charcoal/50 flex items-center gap-2">
                              <Activity className="w-3 h-3" /> Training Protocol
                            </label>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {WORKOUT_TYPES.map((type) => (
                              <button
                                key={type.id}
                                onClick={() =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    type: type.id as any,
                                  })
                                }
                                className={`p-2.5 md:p-3 rounded-xl transition-all text-left border-2 ${
                                  wizardConfig.type === type.id
                                    ? "border-gold bg-gold/5 outline outline-gold/20 shadow-lg shadow-gold/10"
                                    : "border-charcoal/5 bg-cream/30 hover:border-charcoal/10"
                                }`}
                              >
                                <div
                                  className={`w-7 h-7 rounded-lg mb-2 flex items-center justify-center ${wizardConfig.type === type.id ? "bg-gold text-charcoal" : "bg-charcoal/5 text-charcoal/40"}`}
                                >
                                  {type.id === "Stretching" && (
                                    <Zap className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "Mobility" && (
                                    <Target className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "Cardio" && (
                                    <Activity className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "Strength" && (
                                    <Layers className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "HIIT" && (
                                    <Zap className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "Balance" && (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  {type.id === "Functional" && (
                                    <Box className="w-3.5 h-3.5" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-[10px] md:text-xs font-bold text-charcoal truncate">
                                    {type.label}
                                  </p>
                                  <p className="text-[7px] md:text-[8px] text-charcoal/40 font-black uppercase tracking-tighter">
                                    {type.description}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Step 2: Duration */}
                        <div className="space-y-3 md:space-y-6">
                          <div className="flex items-center justify-between">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 flex items-center gap-2">
                              <Clock className="w-3 h-3" /> Step 2: Session
                              Length
                            </label>
                            <span className="text-[8px] font-black uppercase text-charcoal/40 italic">
                              Micro-sessions (1m) build consistency
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 md:gap-3">
                            {[60, 300, 900, 1800].map((dur) => (
                              <button
                                key={dur}
                                onClick={() =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    duration: dur.toString(),
                                  })
                                }
                                className={`px-2 py-3 md:px-4 rounded-lg md:rounded-xl border text-[10px] md:text-sm font-bold transition-all ${
                                  wizardConfig.duration === dur.toString()
                                    ? "border-gold bg-gold text-charcoal"
                                    : "border-charcoal/10 hover:border-charcoal/30"
                                }`}
                              >
                                {dur === 60 ? "1m" : dur / 60 + "m"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Step 3: Pain Points & Customization */}
                        <div className="space-y-3 md:space-y-6">
                          <div className="flex items-center justify-between">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 flex items-center gap-2">
                              <Activity className="w-3 h-3" /> Step 3:
                              Personalization
                            </label>
                            <span className="text-[8px] font-black uppercase text-blue-500/60">
                              Biomechanical targeting enabled
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Pain Points
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.painPoints.join(",")}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    painPoints: e.target.value
                                      ? e.target.value.split(",")
                                      : [],
                                  })
                                }
                              >
                                <option value="">None</option>
                                <option value="Lower Back Pain">
                                  Lower Back Pain
                                </option>
                                <option value="Neck Pain,Desk Posture">
                                  Desk Worker (Neck/Back)
                                </option>
                                <option value="Tight Hips">Tight Hips</option>
                                <option value="Knee Pain">Knee Pain</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Target Muscles
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.targetMuscles[0] || ""}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    targetMuscles: e.target.value
                                      ? [e.target.value]
                                      : [],
                                  })
                                }
                              >
                                <option value="">Full Body</option>
                                <option value="Glutes">
                                  Glutes & Lower Body
                                </option>
                                <option value="Core">Core & Abs</option>
                                <option value="Upper Body">Upper Body</option>
                                <option value="Pectoralis Major">Chest</option>
                                <option value="Erector Spinae">
                                  Spine/Back
                                </option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Equipment
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.equipment.join(",")}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    equipment: e.target.value.split(","),
                                  })
                                }
                              >
                                <option value="None">No Equipment</option>
                                <option value="Mat">Yoga Mat</option>
                                <option value="Dumbbell">Dumbbells</option>
                                <option value="Resistance Band">
                                  Resistance Band
                                </option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Level
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.level}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    level: e.target.value,
                                  })
                                }
                              >
                                <option value="Beginner">Beginner Level</option>
                                <option value="Intermediate">
                                  Intermediate Level
                                </option>
                                <option value="Expert">Expert Level</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Intensity
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.intensity}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    intensity: e.target.value as any,
                                  })
                                }
                              >
                                <option value="Low">Low (Recovery)</option>
                                <option value="Medium">
                                  Medium (Balanced)
                                </option>
                                <option value="High">High (Push)</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest">
                                Coaching Style
                              </label>
                              <select
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                value={wizardConfig.coachingStyle}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    coachingStyle: e.target.value,
                                  })
                                }
                              >
                                <option value="Encouraging">
                                  Encouraging & Soft
                                </option>
                                <option value="Direct">
                                  Direct & Professional
                                </option>
                                <option value="Intense">
                                  Intense & Motivating
                                </option>
                              </select>
                            </div>

                            <div className="space-y-2 lg:col-span-3">
                              <input
                                type="text"
                                className="w-full bg-cream/50 border border-charcoal/5 rounded-lg px-3 py-2.5 text-[10px] md:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gold/30 text-charcoal"
                                placeholder="Target Focus (e.g. Back, Shoulders, Core)"
                                value={wizardConfig.focus || ""}
                                onChange={(e) =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    focus: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {/* Step 4: Social Format */}
                        <div className="space-y-3 md:space-y-6">
                          <div className="flex items-center justify-between">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 flex items-center gap-2">
                              <Palette className="w-3 h-3" /> Step 4: Social
                              Format
                            </label>
                            <span className="text-[8px] font-black uppercase text-charcoal/40">
                              Optimizes cinematography for platform
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {CREATOR_MODES.slice(0, 4).map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    creatorMode: mode.id,
                                  })
                                }
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                  wizardConfig.creatorMode === mode.id
                                    ? "border-gold bg-gold/5 shadow-lg shadow-gold/10"
                                    : "border-charcoal/5 bg-cream/30 hover:border-charcoal/10"
                                }`}
                              >
                                <p className="text-[9px] font-black uppercase text-charcoal truncate">
                                  {mode.label}
                                </p>
                                <p className="text-[7px] text-charcoal/40 font-bold leading-tight">
                                  {mode.description}
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Step 5: Coaching Presence */}
                        <div className="space-y-3 md:space-y-6 pb-6">
                          <div className="flex items-center justify-between">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 flex items-center gap-2">
                              <Mic2 className="w-3 h-3" /> Step 5: Coaching
                              Identity
                            </label>
                            <span className="text-[8px] font-black uppercase text-gold">
                              Coach maintains cross-session continuity
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {COACH_PROFILES.map((coach) => (
                              <button
                                key={coach.id}
                                onClick={() =>
                                  setWizardConfig({
                                    ...wizardConfig,
                                    selectedCoachId: coach.id,
                                  })
                                }
                                className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                                  wizardConfig.selectedCoachId === coach.id
                                    ? "border-gold bg-gold/5 shadow-xl shadow-gold/10"
                                    : "border-charcoal/5 bg-cream/30 hover:border-charcoal/10"
                                }`}
                              >
                                <div className="relative z-10">
                                  <div className="flex items-center justify-between mb-2">
                                    <p
                                      className={`text-[10px] font-black uppercase tracking-widest ${wizardConfig.selectedCoachId === coach.id ? "text-gold" : "text-charcoal/30"}`}
                                    >
                                      {coach.personality}
                                    </p>
                                    {wizardConfig.selectedCoachId ===
                                      coach.id && (
                                      <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="text-lg font-serif italic text-charcoal mb-0.5">
                                    {coach.name}
                                  </h4>
                                  <p className="text-[9px] text-charcoal/50 leading-relaxed italic mb-2 line-clamp-1">
                                    "{coach.tagline}"
                                  </p>
                                  <p className="text-[8px] text-charcoal/40 leading-relaxed font-medium line-clamp-2">
                                    {coach.philosophy}
                                  </p>
                                </div>
                                <div
                                  className={`absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Spacer to push button to bottom if content is short */}
                    <div className="flex-1 min-h-[0px]" />
                  </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="flex-none pt-4 pb-[calc(2rem+env(safe-area-inset-bottom)+40px)] md:pb-6 md:pt-6 px-4 md:px-12 border-t border-charcoal/5 bg-[#FDFBF7]/95 backdrop-blur-xl sticky bottom-0 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                  <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setIsInitializingProtocol(true);
                        setTimeout(() => {
                          setShowWizard(false);
                          setIsInitializingProtocol(false);
                        }, 1000);
                      }}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/30 hover:text-charcoal transition-colors px-6 py-3 order-2 md:order-1 rounded-full hover:bg-charcoal/5"
                    >
                      Enter Open Studio
                    </button>
                    <div className="flex flex-col md:flex-row gap-3 order-1 md:order-2 w-full md:w-auto">
                      <button
                        onClick={() => generateRoutine()}
                        disabled={dailyExports >= MAX_DAILY_EXPORTS}
                        className={`group px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold uppercase tracking-widest transition-all ${
                          dailyExports >= MAX_DAILY_EXPORTS
                            ? "bg-charcoal/10 text-charcoal/30 cursor-not-allowed"
                            : "bg-charcoal text-cream hover:bg-charcoal/90 transition-colors shadow-lg"
                        } flex items-center justify-center gap-3 text-[10px] md:text-xs`}
                      >
                        {dailyExports >= MAX_DAILY_EXPORTS ? (
                          "Limit Reached"
                        ) : (
                          <>
                            Initialize Protocol{" "}
                            <ArrowRight className="w-4 h-4 text-cream/50 group-hover:text-gold transition-colors group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {dailyExports >= MAX_DAILY_EXPORTS && (
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-4 text-center">
                      You've generated {dailyExports} videos today. Please come
                      back tomorrow for more free generations!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col md:flex-row overflow-x-hidden md:overflow-hidden md:min-h-0 min-w-0 w-full">
          {/* Sidebar - Assets & Search (Order 2 on mobile) */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-r border-cream/10 flex flex-col bg-charcoal md:bg-charcoal/80 md:backdrop-blur-md order-2 md:order-1 md:h-auto overflow-x-hidden md:overflow-hidden shrink-0 md:min-h-0">
            {/* Ad Space Placeholder */}
            <div className="hidden md:block p-3 border-b border-cream/5 text-center shrink-0">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-cream/20">
                Sponsored by Stretching Pro
              </span>
            </div>

            <div
              ref={navRailRef}
              className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory bg-[#1A1A1A] border-b border-white/5 relative z-10 shrink-0 select-none cursor-grab"
            >
              <TabButton
                id="assets"
                label="Library"
                onClick={() => setActiveTab("assets")}
                isActive={activeTab === "assets"}
              />
              <TabButton
                id="script"
                label="Script"
                icon={Mic2}
                onClick={() => {
                  setActiveTab("script");
                  if (aiScript.length === 0) handleGenerateAiScript();
                }}
                isActive={activeTab === "script"}
                showGeneratingIndicator={isGeneratingAi}
              />
              <TabButton
                id="music"
                label="Audio"
                icon={Music2}
                onClick={() => setActiveTab("music")}
                isActive={activeTab === "music"}
              />
              <TabButton
                id="format"
                label="Format"
                icon={Palette}
                onClick={() => setActiveTab("format")}
                isActive={activeTab === "format"}
              />
              <TabButton
                id="growth"
                label="Growth"
                icon={Sparkles}
                onClick={() => {
                  setActiveTab("growth");
                  if (!seoMetadata) handleGenerateSEOMetadata();
                }}
                isActive={activeTab === "growth"}
                showGeneratingIndicator={isGeneratingSEO}
              />
              <TabButton
                id="progression"
                label="Coach"
                icon={TrendingUp}
                onClick={() => setActiveTab("progression")}
                isActive={activeTab === "progression"}
              />
            </div>

            <div className="flex-1 overflow-x-hidden md:overflow-hidden relative md:min-h-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={transitionClasses.system}
                  className="relative md:absolute md:inset-0 flex flex-col pt-4 overflow-x-hidden md:overflow-hidden"
                >
                  {activeTab === "assets" && (
                    <div className="flex-1 flex flex-col md:h-full overflow-x-hidden md:overflow-hidden md:min-h-0">
                      <div className="px-6 pb-6 shrink-0 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <h1 className="text-xl font-serif italic tracking-tight font-light text-white/90">
                              Studio Data
                            </h1>
                          </div>
                          {storyboard.length > 0 && (
                            <button
                              onClick={clearProject}
                              className="text-[9px] font-black uppercase text-red-400 hover:text-red-300 transition-colors tracking-widest px-3 py-1.5"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        <div className="relative group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-gold transition-colors" />
                          <input
                            type="text"
                            placeholder="Search Bio-Patterns..."
                            className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all placeholder:text-white/20"
                            value={searchQuery || ""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <select
                            className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:outline-none focus:border-white/10 transition-all cursor-pointer text-white/40"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                          >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <select
                            className="flex-1 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 text-[10px] font-bold focus:outline-none focus:border-white/10 transition-all cursor-pointer text-white/40"
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value)}
                          >
                            <option value="all">All Levels</option>
                            {uniqueLevels.map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {lvl}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto px-4 py-6 space-y-3 custom-scrollbar">
                        {renderedAssetList}
                      </div>
                    </div>
                  )}

                  {activeTab === "script" && (
                    <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto p-6 space-y-6 custom-scrollbar">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                            <FileText className="w-4 h-4 text-gold" />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-gold text-white/50">
                            Instructional Intelligence
                          </h3>
                        </div>
                        <button
                          onClick={() => handleGenerateAiScript()}
                          disabled={isGeneratingAi || storyboard.length === 0}
                          className="p-2 hover:bg-white/5 rounded-xl text-gold/60 hover:text-gold transition-all disabled:opacity-30"
                          title="Regenerate Script"
                        >
                          <Wand2
                            className={`w-4 h-4 ${isGeneratingAi ? "animate-spin" : ""}`}
                          />
                        </button>
                      </div>
                      {renderedScriptTab}
                    </div>
                  )}

                  {activeTab === "progression" && renderedProgressionTab}

                  {activeTab === "music" && (
                    <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                              <Music2 className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-gold text-white/50">
                              Sonic Atmosphere
                            </h3>
                          </div>
                          <button
                            onClick={() => {
                              setupAudioContext();
                              setIsSoundtrackEnabled(!isSoundtrackEnabled);
                            }}
                            className={`w-11 h-6 rounded-full relative transition-all duration-500 shadow-inner ${isSoundtrackEnabled ? "bg-gold" : "bg-white/5"}`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 rounded-full bg-charcoal shadow-lg transition-all duration-500 ${isSoundtrackEnabled ? "left-6" : "left-1"}`}
                            />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {(
                            Object.keys(SOUNDTRACKS) as Array<
                              keyof typeof SOUNDTRACKS
                            >
                          ).map((preset) => (
                            <button
                              key={preset}
                              onClick={() => {
                                setupAudioContext();
                                setSoundtrackPreset(preset);
                              }}
                              className={`p-4 rounded-3xl border text-left transition-all duration-300 relative overflow-hidden group ${soundtrackPreset === preset ? "border-gold/50 bg-gold/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"}`}
                            >
                              <p
                                className={`text-[9px] font-black uppercase tracking-widest mb-1 ${soundtrackPreset === preset ? "text-gold" : "text-white/20"}`}
                              >
                                {preset}
                              </p>
                              <p className="text-xs font-bold truncate group-hover:text-white transition-colors">
                                {SOUNDTRACKS[preset].name}
                              </p>
                              {soundtrackPreset === preset && (
                                <div className="absolute bottom-0 right-0 p-2 opacity-10">
                                  <Music className="w-8 h-8" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-4 px-2 pt-2">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-white/30">
                            <span>Immersion Level</span>
                            <span className="text-white/60">
                              {Math.round((soundtrackVolume || 0) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={soundtrackVolume || 0.25}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setSoundtrackVolume(isNaN(val) ? 0 : val);
                            }}
                            className="w-full accent-gold h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                              <Activity className="w-4 h-4 text-gold" />
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-gold text-white/50">
                              Pacing Engine
                            </h3>
                          </div>
                          <div className="px-2 py-0.5 rounded-lg bg-gold/10 text-gold text-[8px] font-black uppercase border border-gold/10">
                            Neural
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              id: "natural",
                              label: "Structural Flow",
                              desc: "Dynamic transitions based on neuro-response patterns",
                            },
                            {
                              id: "energetic",
                              label: "Hyper-Paced",
                              desc: "Shortened durations for active metabolic output",
                            },
                            {
                              id: "relaxed",
                              label: "Restorative",
                              desc: "Extended holds for parasympathetic activation",
                            },
                          ].map((mode) => (
                            <button
                              key={mode.id}
                              onClick={() => setPacingMode(mode.id as any)}
                              className={`p-4 rounded-3xl border text-left transition-all group relative overflow-hidden ${pacingMode === mode.id ? "border-gold/50 bg-gold/5" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"}`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span
                                  className={`text-[10px] font-black uppercase tracking-widest ${pacingMode === mode.id ? "text-gold" : "text-white/50"}`}
                                >
                                  {mode.label}
                                </span>
                                {pacingMode === mode.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                                )}
                              </div>
                              <p className="text-[10px] text-white/30 leading-snug group-hover:text-white/50 transition-colors">
                                {mode.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "format" && (
                    <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                            <Palette className="w-4 h-4 text-gold" />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-gold text-white/50">
                            Visual Architecture
                          </h3>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-1">
                            Cinematic Hook Title
                          </label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={hookTitle}
                              onChange={(e) => setHookTitle(e.target.value)}
                              placeholder="Enter catchphrase hook..."
                              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-4 text-sm placeholder:text-white/10 focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all font-bold"
                            />
                            <Sparkles className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/30 group-focus-within:text-gold transition-colors" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                              Creator Presets
                            </label>
                            <span className="text-[8px] font-bold text-gold/40">
                              v1.2.0
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {CREATOR_MODES.map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() => applyCreatorMode(mode.id, wizardConfig)}
                                className={`text-left p-4 rounded-3xl border transition-all relative overflow-hidden group ${activeCreatorMode === mode.id ? "border-gold bg-gold/10 ring-1 ring-gold/20" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"}`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <span
                                    className={`text-[10px] font-black uppercase tracking-widest ${activeCreatorMode === mode.id ? "text-gold" : "text-white/60"}`}
                                  >
                                    {mode.label}
                                  </span>
                                  {activeCreatorMode === mode.id && (
                                    <Check className="w-3.5 h-3.5 text-gold" />
                                  )}
                                </div>
                                <p className="text-[10px] text-white/30 leading-snug group-hover:text-white/50 transition-colors italic">
                                  {mode.description}
                                </p>

                                <div
                                  className={`absolute left-0 top-0 w-1.5 h-full transition-all duration-500 ${activeCreatorMode === mode.id ? "bg-gold" : "bg-transparent group-hover:bg-white/10"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                              Caption Generation
                            </span>
                            <button
                              onClick={() =>
                                setSubtitlesEnabled(!subtitlesEnabled)
                              }
                              className={`w-11 h-6 rounded-full transition-all duration-500 relative ${subtitlesEnabled ? "bg-gold" : "bg-white/5"}`}
                            >
                              <div
                                className={`absolute top-1 w-4 h-4 rounded-full bg-charcoal transition-all duration-500 shadow-xl ${subtitlesEnabled ? "left-6" : "left-1"}`}
                              />
                            </button>
                          </div>

                          <AnimatePresence>
                            {subtitlesEnabled && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-3 gap-2 overflow-hidden"
                              >
                                {(["classic", "bold", "minimal"] as const).map(
                                  (style) => (
                                    <button
                                      key={style}
                                      onClick={() => setSubtitleStyle(style)}
                                      className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${subtitleStyle === style ? "bg-gold text-charcoal border-gold shadow-lg shadow-gold/20" : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"}`}
                                    >
                                      {style}
                                    </button>
                                  ),
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "growth" && (
                    <div className="md:flex-1 overflow-x-hidden md:overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                            <Sparkles className="w-4 h-4 text-gold" />
                          </div>
                          <h3 className="text-[11px] font-black uppercase tracking-widest text-gold text-white/50">
                            Ecosystem Amplification
                          </h3>
                        </div>
                        <button
                          onClick={() => handleGenerateSEOMetadata()}
                          disabled={isGeneratingSEO || storyboard.length === 0}
                          className="p-2 hover:bg-white/5 rounded-xl text-gold/60 hover:text-gold transition-all disabled:opacity-30"
                          title="Regenerate Growth Data"
                        >
                          <Wand2
                            className={`w-4 h-4 ${isGeneratingSEO ? "animate-spin" : ""}`}
                          />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 px-1">
                          Narrative Framing
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {TRANSFORMATION_THEMES.map((theme) => (
                            <button
                              key={theme.id}
                              onClick={() => setSelectedStoryThemeId(theme.id)}
                              className={`p-4 rounded-3xl border text-left transition-all relative overflow-hidden group h-full flex flex-col ${
                                selectedStoryThemeId === theme.id
                                  ? "border-gold bg-gold/10 shadow-xl shadow-gold/5 ring-1 ring-gold/20"
                                  : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                              }`}
                            >
                              <p
                                className={`text-[10px] font-black uppercase tracking-wider mb-1.5 ${selectedStoryThemeId === theme.id ? "text-gold" : "text-white/40"}`}
                              >
                                {theme.label}
                              </p>
                              <p className="text-[9px] text-white/20 leading-relaxed font-medium group-hover:text-white/40 transition-colors flex-1">
                                {theme.description}
                              </p>
                              {selectedStoryThemeId === theme.id && (
                                <div className="absolute top-2 right-2">
                                  <Check className="w-3.5 h-3.5 text-gold" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {selectedStoryThemeId && (
                          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-lg">
                            <p className="text-[10px] text-white/40 leading-relaxed italic font-medium">
                              <span className="text-gold/80 font-black uppercase mr-2 tracking-widest text-[8px]">
                                Intelligence Directive:
                              </span>
                              Prioritizing{" "}
                              {
                                TRANSFORMATION_THEMES.find(
                                  (t) => t.id === selectedStoryThemeId,
                                )?.narrativeFocus
                              }{" "}
                              within all generated metadata and social assets.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        {isGeneratingSEO ? (
                          <div className="space-y-6 py-12 text-center">
                            <div className="space-y-2">
                              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
                                Synthesis in Progress
                              </p>
                              <p className="text-[10px] text-white/20 italic font-medium">
                                Calibrating SEO vectors to movement patterns...
                              </p>
                            </div>
                          </div>
                        ) : storyboard.length === 0 ? (
                          <div className="py-24 text-center space-y-4 opacity-60">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
                              Empty Repository
                            </p>
                            <p className="text-[10px] text-white/50 font-medium max-w-[140px] mx-auto leading-relaxed">
                              Build a ritual in the Library to initialize
                              intelligence vectors.
                            </p>
                          </div>
                        ) : seoMetadata && socialCaptions ? (
                          <div className="space-y-6">
                            <div className="p-5 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group/seo">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                                  Movement SEO Vectors
                                </h4>
                                <button
                                  onClick={() =>
                                    navigator.clipboard.writeText(
                                      seoMetadata.metaDescription,
                                    )
                                  }
                                  className="p-2 bg-white/5 rounded-xl text-white/20 hover:text-gold transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <span className="text-[8px] font-black uppercase text-gold/60 tracking-widest">
                                    Global Title Path
                                  </span>
                                  <p className="text-sm font-serif italic text-white mt-1 leading-tight group-hover/seo:text-glow transition-all">
                                    {seoMetadata.youtubeTitle}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[8px] font-black uppercase text-gold/60 tracking-widest">
                                    Structural Description
                                  </span>
                                  <p className="text-[10px] text-white/50 leading-relaxed mt-1.5 font-medium">
                                    {seoMetadata.metaDescription}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-[8px] font-black uppercase text-gold/60 tracking-widest">
                                    Visibility Anchors
                                  </span>
                                  <p className="text-[10px] text-gold/60 mt-1.5 font-bold tracking-tight">
                                    {seoMetadata.hashtags
                                      ?.map((h: string) => "#" + h)
                                      .join(" ")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-5 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                                  Amplification Captions
                                </h4>
                              </div>
                              <div className="space-y-6">
                                {[
                                  {
                                    id: "tiktok",
                                    label: "TikTok Neural",
                                    color: "#ff0050",
                                    content: socialCaptions.tiktokCaption,
                                  },
                                  {
                                    id: "insta",
                                    label: "Instagram Aesthetic",
                                    color: "#C13584",
                                    content: socialCaptions.instagramCaption,
                                  },
                                  {
                                    id: "shorts",
                                    label: "Short-Form Narrative",
                                    color: "#FF0000",
                                    content:
                                      socialCaptions.youtubeShortsCaption,
                                  },
                                ].map((plat, idx) => (
                                  <div
                                    key={plat.id}
                                    className={`group/plat ${idx !== 0 ? "pt-6 border-t border-white/5" : ""}`}
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <span
                                        className="text-[8px] font-black uppercase tracking-widest flex items-center gap-2"
                                        style={{ color: plat.color }}
                                      >
                                        <div
                                          className="w-1 h-1 rounded-full"
                                          style={{
                                            backgroundColor: plat.color,
                                          }}
                                        />
                                        {plat.label}
                                      </span>
                                      <button
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            plat.content,
                                          )
                                        }
                                        className="opacity-0 group-hover/plat:opacity-100 p-1.5 bg-white/5 rounded-lg text-white/20 hover:text-gold transition-all"
                                      >
                                        <FileText className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-white/60 leading-relaxed whitespace-pre-wrap font-medium">
                                      {plat.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="py-20 text-center space-y-6">
                            <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center mx-auto border border-gold/10 group hover:border-gold/30 transition-all duration-700">
                              <Sparkles className="w-6 h-6 text-gold/40 group-hover:text-gold transition-all duration-1000" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gold/60">
                                Ready for Synthesis
                              </p>
                              <p className="text-[10px] text-white/20 font-bold max-w-[180px] mx-auto italic">
                                Activate AI metadata processing to unlock
                                platform-specific growth hooks.
                              </p>
                            </div>
                            <button
                              onClick={() => handleGenerateSEOMetadata()}
                              className="px-8 py-3 bg-gold/10 text-gold rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gold hover:text-charcoal transition-all border border-gold/30 shadow-xl shadow-gold/5"
                            >
                              Generate Ecosystem Data
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Main Preview Area (Order 1 on mobile) */}
          <div className="flex-1 flex flex-col relative bg-[#0a0a0a] order-1 md:order-2 md:h-auto overflow-x-hidden md:overflow-hidden shrink-0 min-w-0 md:min-h-0">
            {/* Top Control Bar */}
            <div className="sticky top-0 z-50 h-14 md:h-20 border-b border-cream/10 flex items-center justify-between px-3 md:px-8 bg-charcoal/80 overflow-x-auto no-scrollbar shrink-0 backdrop-blur-xl">
              <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                <button
                  onClick={() => {
                    const isExporting =
                      exportState === "preparing" ||
                      exportState === "rendering" ||
                      exportState === "packaging";
                    if (isExporting) {
                      setPendingConfirm({ message: "An export is in progress. Are you sure you want to leave the Studio?", onConfirm: () => navigate("/") });
                      return;
                    }
                    if (storyboard.length > 0) {
                      setPendingConfirm({ message: "You have an active studio session. Leaving will lose any unsaved orchestrations. Return to home?", onConfirm: () => navigate("/") });
                      return;
                    }
                    navigate("/");
                  }}
                  className="flex items-center gap-2 group mr-1 md:mr-2 shrink-0 transition-opacity hover:opacity-80"
                >
                  <Logo size="sm" light iconOnly />
                  <span className="hidden lg:block font-serif italic text-cream font-medium tracking-tight text-sm">
                    Stretching Pro
                  </span>
                </button>
                <div className="w-px h-6 bg-cream/10 hidden md:block" />

                <nav className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                  {[
                    { label: 'Dashboard', path: '/dashboard', className: 'text-gold hover:text-white' },
                    { label: 'Nutrition', path: '/nutrition', className: 'text-cream/40 hover:text-gold' },
                    { label: 'Recovery', path: '/recovery', className: 'text-cream/40 hover:text-gold' }
                  ].map((item) => (
                    <button 
                      key={item.path}
                      onClick={() => {
                        const isExporting =
                          exportState === "preparing" ||
                          exportState === "rendering" ||
                          exportState === "packaging";
                        if (isExporting) {
                          setPendingConfirm({ message: "An export is in progress. Are you sure you want to leave the Studio?", onConfirm: () => navigate(item.path) });
                          return;
                        }
                        if (storyboard.length > 0) {
                          setPendingConfirm({ message: `You have an active studio session. Leaving will lose any unsaved orchestrations. Proceed to ${item.label}?`, onConfirm: () => navigate(item.path) });
                          return;
                        }
                        navigate(item.path);
                      }}
                      className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap ${item.className}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="w-px h-6 bg-cream/10 hidden md:block" />

                <div className="flex items-center bg-cream/5 rounded-lg p-0.5 md:p-1 border border-cream/10">
                  {[
                    {
                      id: "9:16",
                      icon: Smartphone,
                      tip: "Portrait (TikTok/Shorts)",
                    },
                    { id: "16:9", icon: Monitor, tip: "Landscape (YouTube)" },
                    { id: "1:1", icon: LayoutGrid, tip: "Square (Instagram)" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      title={ratio.tip}
                      className={`p-1 md:p-2.5 rounded-lg transition-all flex items-center gap-1 ${aspectRatio === ratio.id ? "bg-gold text-charcoal" : "text-cream/40 hover:text-cream/60"}`}
                    >
                      <ratio.icon className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">
                        {ratio.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-cream/10 hidden md:block" />

                <div className="flex items-center bg-cream/5 rounded-lg p-0.5 md:p-1 border border-cream/10">
                  {[
                    {
                      id: "fit",
                      icon: LayoutGrid,
                      full: "fit",
                      tip: "Safe margins",
                    },
                    {
                      id: "focus",
                      icon: Box,
                      full: "focus",
                      tip: "Center focus",
                    },
                    {
                      id: "cine",
                      icon: Play,
                      full: "cinematic",
                      tip: "Dynamic movement",
                    },
                  ].map((f) => (
                    <button
                      key={f.full}
                      onClick={() => setFramingMode(f.full as any)}
                      title={f.tip}
                      className={`p-1 md:p-2.5 rounded-lg transition-all flex items-center gap-1 ${framingMode === f.full ? "bg-cream text-charcoal" : "text-cream/40 hover:text-cream/60"}`}
                    >
                      <f.icon className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">
                        {f.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center bg-cream/5 rounded-lg p-0.5 md:p-1 border border-cream/10">
                  {[
                    { id: "min", icon: Type, full: "minimal" },
                    { id: "tech", icon: Palette, full: "technical" },
                    { id: "zap", icon: Zap, full: "high-energy" },
                  ].map((v) => (
                    <button
                      key={v.full}
                      onClick={() => setVibe(v.full as any)}
                      className={`p-1 md:p-2.5 rounded-lg transition-all flex items-center gap-1 ${vibe === v.full ? "bg-cream text-charcoal" : "text-cream/40 hover:text-cream/60"}`}
                    >
                      <v.icon className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">
                        {v.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-cream/10 hidden md:block" />

                <div className="flex items-center bg-cream/5 rounded-lg p-0.5 md:p-1 border border-cream/10">
                  {[
                    { id: "cut", full: "none" },
                    { id: "fade", full: "subtle" },
                    { id: "soft", full: "medium" },
                  ].map((t) => (
                    <button
                      key={t.full}
                      onClick={() => setTransitionStyle(t.full as any)}
                      className={`p-1 md:p-2.5 rounded-lg transition-all flex items-center gap-1 ${transitionStyle === t.full ? "bg-cream text-charcoal" : "text-cream/40 hover:text-cream/60"}`}
                    >
                      <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">
                        {t.id}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="w-px h-6 bg-cream/10 hidden lg:block" />

                {/* Subtitles controls */}
                <div className="flex items-center bg-cream/5 rounded-lg p-0.5 md:p-1 border border-cream/10 hidden sm:flex">
                  <button
                    onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                    className={`p-1 md:p-2.5 rounded-lg transition-all flex items-center gap-1 ${subtitlesEnabled ? "bg-blue-500/20 text-blue-400" : "text-cream/40 hover:text-cream/60"}`}
                  >
                    <Type className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight">
                      Subs
                    </span>
                  </button>

                  {subtitlesEnabled && (
                    <div className="flex items-center ml-1 border-l border-cream/10 pl-1">
                      <select
                        value={subtitleSize}
                        onChange={(e) => setSubtitleSize(e.target.value as any)}
                        className="bg-transparent text-[8px] md:text-[9px] font-black uppercase tracking-tight text-cream/80 p-1 md:p-2 focus:outline-none"
                      >
                        <option className="bg-charcoal" value="small">
                          Small
                        </option>
                        <option className="bg-charcoal" value="medium">
                          Med
                        </option>
                        <option className="bg-charcoal" value="large">
                          Large
                        </option>
                      </select>
                      <select
                        value={subtitlePosition}
                        onChange={(e) =>
                          setSubtitlePosition(e.target.value as any)
                        }
                        className="bg-transparent text-[8px] md:text-[9px] font-black uppercase tracking-tight text-cream/80 p-1 md:p-2 focus:outline-none"
                      >
                        <option className="bg-charcoal" value="top">
                          Top
                        </option>
                        <option className="bg-charcoal" value="bottom">
                          Bot
                        </option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-4 shrink-0 relative group/export">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hidden lg:block">
                  Daily quota: {3 - dailyExports} left
                </div>

                {/* Export Tip Overlay */}
                {storyboard.length > 0 && aiScript.length === 0 && (
                  <div className="absolute -top-12 right-0 opacity-0 group-hover/export:opacity-100 transition-opacity pointer-events-none z-[60]">
                    <div className="bg-gold text-charcoal text-[9px] font-black px-3 py-2 rounded-xl shadow-xl whitespace-nowrap border border-charcoal/10 relative">
                      Tip: Generate scripts for AI voiceover first!
                      <div className="absolute top-full right-8 w-2 h-2 bg-gold rotate-45 -translate-y-1" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-end gap-1">
                  {exportState === "ready" || exportState === "review" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setExportState("idle");
                          setRenderProgress(0);
                          if (renderBlobUrlRef.current) {
                            URL.revokeObjectURL(renderBlobUrlRef.current);
                            renderBlobUrlRef.current = null;
                          }
                        }}
                        className="px-4 py-2.5 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest transition-all bg-white/5 text-white/40 hover:text-white"
                      >
                        DISCARD
                      </button>
                      {exportState === "ready" ? (
                        <button
                          onClick={() => setExportState("review")}
                          className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2 md:py-3 rounded-full font-black text-[9px] md:text-sm uppercase tracking-widest transition-all bg-white text-charcoal hover:bg-cream shadow-lg shadow-white/5"
                        >
                          <Monitor className="w-3 h-3 md:w-4 md:h-4" />
                          REVIEW MASTER
                        </button>
                      ) : (
                        <button
                          onClick={downloadReadyExport}
                          className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2 md:py-3 rounded-full font-black text-[9px] md:text-sm uppercase tracking-widest transition-all bg-gold text-charcoal hover:bg-gold/90 shadow-lg shadow-gold/10"
                        >
                          <Download className="w-3 h-3 md:w-4 md:h-4" />
                          EXPORT VIDEO
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={toggleRecording}
                      disabled={
                        exportState === "preparing" ||
                        exportState === "packaging" ||
                        exportState === "failed" ||
                        (!isRecording && dailyExports >= MAX_DAILY_EXPORTS)
                      }
                      className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2 md:py-3 rounded-full font-black text-[9px] md:text-sm uppercase tracking-widest transition-all overflow-hidden relative ${
                        isRecording || exportState === "rendering"
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : exportState !== "idle"
                            ? "bg-white/10 text-white cursor-wait"
                            : dailyExports >= MAX_DAILY_EXPORTS
                              ? "bg-white/10 text-white/20 cursor-not-allowed"
                              : "bg-white text-charcoal hover:bg-cream shadow-lg shadow-white/5"
                      }`}
                    >
                      {/* Render Progress Fill Background */}
                      {(exportState === "rendering" ||
                        exportState === "packaging") && (
                        <div
                          className="absolute inset-0 bg-white/20 transition-all duration-300 pointer-events-none"
                          style={{
                            width: `${renderProgress}%`,
                            transformOrigin: "left",
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-2 md:gap-3">
                        {exportState === "rendering" ? (
                          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                        ) : exportState === "preparing" ||
                          exportState === "packaging" ? (
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin text-white/50" />
                        ) : (
                          <Monitor className="w-3 h-3 md:w-4 md:h-4" />
                        )}

                        {exportState === "preparing"
                          ? "PREPARING COMPOSITION..."
                          : exportState === "rendering"
                            ? `RENDERING TIMELINE (${renderProgress}%)`
                            : exportState === "packaging"
                              ? "PACKAGING MASTER..."
                              : exportState === "failed"
                                ? "RENDER FAILED"
                                : dailyExports >= MAX_DAILY_EXPORTS
                                  ? "DAILY LIMIT"
                                  : "RENDER PROJECT"}
                      </span>
                    </button>
                  )}

                  {storyboard.length > 0 && exportState !== "review" && (
                    <p className="text-[8px] md:text-[9px] text-charcoal/40 font-bold max-w-[240px] text-right pt-2 leading-relaxed uppercase tracking-widest hidden md:block">
                      {exportState === "idle"
                        ? "Rendering involves strict deterministic synchronization. Duration depends on video complexity."
                        : exportState === "rendering"
                          ? "Deterministic orchestration engaged. Workspace locked."
                          : exportState === "ready"
                            ? "FINAL COMPOSITION AVAILABLE"
                            : ""}
                    </p>
                  )}
                </div>

                <AnimatePresence>
                  {exportErrorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-16 right-0 bg-red-950/90 text-red-100 px-4 py-2.5 rounded-xl border border-red-500/30 text-[10px] uppercase font-bold tracking-widest min-w-[200px] text-right shadow-xl backdrop-blur-md"
                    >
                      {exportErrorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Video Stage */}
            <div className="flex-1 flex items-center justify-center p-4 md:p-12 bg-pattern overflow-hidden min-h-[300px] min-w-0">
              <div
                className="relative shadow-xl overflow-hidden ring-1 ring-white/5 transition-all duration-700 ease-out-expo bg-cream z-0"
                style={{ isolation: "isolate" }}
              >
                {/* Dedicated Preview Viewport Wrapper / Stable Aspect Ratio Bounds */}
                <svg
                  viewBox={
                    aspectRatio === "9:16"
                      ? "0 0 9 16"
                      : aspectRatio === "16:9"
                        ? "0 0 16 9"
                        : "0 0 1 1"
                  }
                  className={`opacity-0 pointer-events-none block transition-all duration-700 ${
                    aspectRatio === "16:9"
                      ? "w-[1000px] max-w-full max-h-full h-auto"
                      : aspectRatio === "9:16"
                        ? "h-[750px] max-h-full max-w-full w-auto"
                        : "h-[600px] max-h-full max-w-full w-auto"
                  }`}
                />

                {exportState === "review" && renderBlobUrlRef.current ? (
                  <React.Suspense
                    fallback={
                      <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <Loader2 className="w-8 h-8 text-gold animate-spin" />
                      </div>
                    }
                  >
                    <MasterReviewPlayer
                      src={renderBlobUrlRef.current}
                      metadata={{
                        duration: storyboard.reduce(
                          (acc, item) => acc + item.duration,
                          0,
                        ),
                        fps: isMobileViewport ? 24 : 30,
                        resolution:
                          aspectRatio === "9:16"
                            ? "1080x1920"
                            : aspectRatio === "16:9"
                              ? "1920x1080"
                              : "1080x1080",
                        codec: exportMimeTypeRef.current.includes("mp4")
                          ? "MP4 (H.264)"
                          : "VP8/WebM",
                      }}
                    />
                  </React.Suspense>
                ) : storyboard.length > 0 ? (
                  <div className="absolute inset-0">
                    <AnimatePresence initial={false}>
                      <motion.div
                        key={`player-${activeItemIndex}`}
                        initial={{
                          opacity: transitionStyle === "none" ? 1 : 0,
                        }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: transitionStyle === "none" ? 1 : 0 }}
                        transition={{
                          duration:
                            transitionStyle === "medium"
                              ? 0.8
                              : transitionStyle === "subtle"
                                ? 0.4
                                : 0,
                          ease: "easeInOut",
                        }}
                        className="absolute inset-0"
                      >
                        <StretchAnimationPlayer
                          exPath={`/animations/${storyboard[activeItemIndex].name.toLowerCase().replace(/ /g, "_")}`}
                          exName={storyboard[activeItemIndex].name}
                          isPlaying={!isPaused}
                          hideControls={true}
                          framingMode={framingMode}
                          narrationText={aiScript[activeItemIndex]?.script}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Removing old flash transition */}
                    {/* Scene Transition Overlay */}
                    {transitionStyle === "none" && (
                      <motion.div
                        key={`transition-${activeItemIndex}`}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={transitionClasses.micro}
                        className="absolute inset-0 bg-white z-20 pointer-events-none"
                      />
                    )}

                    {/* Cinematic Depth Overlays */}
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cream/90 to-transparent pointer-events-none mix-blend-screen z-10" />
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-charcoal/30 to-transparent pointer-events-none mix-blend-multiply z-10" />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.08)_100%)] z-10" />

                    {/* Vibe Specific Grid Overlays */}
                    {vibe === "technical" && (
                      <div className="absolute inset-0 pointer-events-none opacity-20 border-[4px] md:border-[8px] border-charcoal/5 z-10">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage:
                              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                            backgroundSize: "40px 40px",
                          }}
                        />
                      </div>
                    )}

                    {/* Overlays for Video Content - Vibe Dependent */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${storyboard[activeItemIndex].instanceId}-${vibe}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={transitionClasses.system}
                        className="absolute inset-0 pointer-events-none p-6 md:p-10 flex flex-col justify-between z-20"
                      >
                        {/* Top Branding (Reduced dominance) */}
                        {!CREATOR_MODES.find((m) => m.id === activeCreatorMode)
                          ?.minimalUI && (
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 md:space-y-2 mix-blend-darken">
                              {vibe === "technical" && (
                                <div className="flex gap-2 opacity-60">
                                  <span className="bg-gold text-charcoal text-[7px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em]">
                                    Live Proc
                                  </span>
                                  <span className="bg-charcoal text-cream/80 text-[7px] md:text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] hidden md:inline">
                                    ID: {storyboard[activeItemIndex].id}
                                  </span>
                                </div>
                              )}
                              <h2
                                className={`font-serif italic leading-[1.1] text-charcoal/90 drop-shadow-sm transition-all ${vibe === "minimal" ? "text-xl md:text-3xl font-medium" : "text-2xl md:text-4xl font-bold"}`}
                              >
                                {storyboard[activeItemIndex].name}
                              </h2>
                              {vibe !== "minimal" && (
                                <p className="text-charcoal/30 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                                  {storyboard[activeItemIndex].category} •
                                  Module
                                </p>
                              )}
                            </div>
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/60 shadow-sm">
                              <Sparkles className="w-3 h-3 md:w-5 md:h-5 text-charcoal/40" />
                            </div>
                          </div>
                        )}

                        {/* Bottom Context (Improved layout) */}
                        <div className="flex items-end justify-between mix-blend-darken">
                          {!CREATOR_MODES.find(
                            (m) => m.id === activeCreatorMode,
                          )?.minimalUI && (
                            <div className="space-y-2 md:space-y-4 max-w-[50%]">
                              <div className="space-y-1">
                                <p className="text-charcoal/40 text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-1.5">
                                  <span className="w-1 h-1 bg-gold rounded-full" />{" "}
                                  Instructions
                                </p>
                                <p className="text-charcoal/80 text-[9px] md:text-xs font-medium leading-relaxed bg-white/30 backdrop-blur-sm p-3 rounded-xl border border-white/40 shadow-sm line-clamp-3">
                                  {storyboard[activeItemIndex].description}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col items-end space-y-3 md:space-y-4">
                            <TimeObserver
                              render={({ localTime: currentTime }) => (
                                <>
                                  <div className="flex items-center gap-1 md:gap-2">
                                    <div className="text-4xl md:text-6xl font-sans font-black text-charcoal tabular-nums italic tracking-tighter drop-shadow-sm">
                                      {Math.max(
                                        0,
                                        Math.ceil(
                                          (storyboard[activeItemIndex]
                                            ?.duration || 0) - currentTime,
                                        ),
                                      )}
                                    </div>
                                    <div className="text-[9px] md:text-xs font-black text-charcoal/30 uppercase vertical-text tracking-widest mt-1">
                                      SEC
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] text-charcoal/30">
                                      Scene {activeItemIndex + 1} /{" "}
                                      {storyboard.length}
                                    </span>
                                    <div className="w-16 md:w-24 h-1 bg-charcoal/10 rounded-full overflow-hidden">
                                      <motion.div
                                        className="h-full bg-charcoal/80"
                                        initial={{ width: 0 }}
                                        animate={{
                                          width: `${(currentTime / (storyboard[activeItemIndex]?.duration || 1)) * 100}%`,
                                        }}
                                        transition={{
                                          ease: "linear",
                                          duration: 0.1,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            />
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Subtitle Overlay (Isolated) */}
                    <SubtitleOverlay
                      subtitlesEnabled={subtitlesEnabled}
                      storyboard={storyboard}
                      activeItemIndex={activeItemIndex}
                      aiScript={aiScript}
                      wizardConfig={wizardConfig}
                      currentProgression={currentProgression}
                      subtitlePosition={subtitlePosition}
                      subtitleStyle={subtitleStyle}
                      subtitleSize={subtitleSize}
                      atmosphere={atmosphere}
                      calculateReadiness={calculateReadiness}
                      COACH_PROFILES={COACH_PROFILES}
                    />

                    {/* Creator Hook Overlay */}
                    <TimeObserver
                      render={(state) => (
                        <AnimatePresence>
                          {activeItemIndex === 0 &&
                            state.localTime < 2.5 &&
                            hookTitle && (
                              <motion.div
                                initial={{ opacity: 0, y: 20, rotate: -2 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                exit={{
                                  opacity: 0,
                                  scale: 1.5,
                                  filter: "blur(10px)",
                                }}
                                className="absolute inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
                              >
                                <div className="bg-gold text-charcoal px-8 py-4 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] border-4 border-charcoal transform -rotate-1">
                                  <h1 className="text-3xl md:text-6xl font-black italic leading-none tracking-tighter uppercase">
                                    {hookTitle}
                                  </h1>
                                </div>
                              </motion.div>
                            )}
                        </AnimatePresence>
                      )}
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-charcoal/30 p-6 md:p-12 text-center bg-cream/80 backdrop-blur-sm z-0">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="max-w-xs space-y-6"
                    >
                      <div className="w-20 h-20 bg-charcoal/5 rounded-full mx-auto flex items-center justify-center border-2 border-dashed border-charcoal/10">
                        <Video className="w-8 h-8 opacity-40" />
                      </div>
                      <div>
                        <h3 className="font-serif italic text-2xl md:text-3xl text-charcoal mb-2">
                          Studio Ready
                        </h3>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-black text-charcoal/40 leading-relaxed mb-8">
                          Your production stage is primed and ready for content.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {[
                          {
                            step: "1",
                            text: "Add routines from the Library",
                            icon: Plus,
                          },
                          {
                            step: "2",
                            text: "Review AI Narration Scripts",
                            icon: Mic2,
                          },
                          {
                            step: "3",
                            text: "Export for social media",
                            icon: Download,
                          },
                        ].map((item) => (
                          <div
                            key={item.step}
                            className="flex items-center gap-4 bg-white/50 p-4 rounded-2xl border border-charcoal/5 shadow-sm"
                          >
                            <span className="w-6 h-6 rounded-full bg-charcoal text-cream text-[10px] font-black flex items-center justify-center shrink-0">
                              {item.step}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal/60 text-left">
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setShowWizard(true)}
                        className="w-full py-4 bg-gold text-charcoal rounded-full font-black uppercase tracking-widest text-xs shadow-lg shadow-gold/10 hover:bg-gold/90 transition-all mt-4"
                      >
                        Use Magic Builder
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Session Intelligence Bar */}
            {intelligenceLogs.length > 0 && storyboard.length > 0 && (
              <div className="bg-charcoal border-t border-cream/5 px-4 md:px-6 py-2.5 flex items-center overflow-x-auto custom-scrollbar gap-3 z-40 relative">
                <div className="flex items-center gap-2 shrink-0 pr-2 border-r border-cream/10 mr-1">
                  <Activity className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cream">
                    Insights
                  </span>
                </div>
                {intelligenceLogs.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 shrink-0 border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold/70 shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                    <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase">
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Timeline Table */}
            <div className="h-48 md:h-64 border-t border-cream/10 bg-charcoal/80 flex flex-col shrink-0 min-h-0 relative select-none">
              {exportState !== "idle" && exportState !== "failed" && (
                <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-8 transition-all duration-500">
                  <div className="flex flex-col items-center gap-3">
                    <Monitor
                      className={`w-8 h-8 md:w-10 md:h-10 text-white/20 ${exportState === "review" || exportState === "ready" ? "" : "animate-pulse"}`}
                    />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/40">
                      {exportState === "review" || exportState === "ready"
                        ? "Master Composition Authoritative"
                        : "Temporal State Locked"}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-white/30 font-medium">
                      {exportState === "review" || exportState === "ready"
                        ? "You are previewing the final delivery package."
                        : "Finalizing orchestration master timeline."}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between px-4 md:px-6 h-10 md:h-12 border-b border-cream/5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-cream/40 relative z-40">
                <div className="flex items-center gap-4">
                  <Layers className="w-3 h-3" />
                  Content Timeline
                </div>
                <div className="flex items-center gap-1 bg-charcoal rounded-lg p-0.5 border border-cream/5">
                  <button
                    onClick={() => setTimelineZoom("compact")}
                    className={`p-1 md:p-1.5 rounded transition-all ${timelineZoom === "compact" ? "bg-cream/10 text-cream" : "hover:bg-cream/5"}`}
                    title="Compact View"
                  >
                    <Search
                      className="w-3 h-3"
                      style={{ transform: "scale(0.8)" }}
                    />
                  </button>
                  <button
                    onClick={() => setTimelineZoom("normal")}
                    className={`p-1 md:p-1.5 rounded transition-all ${timelineZoom === "normal" ? "bg-cream/10 text-cream" : "hover:bg-cream/5"}`}
                    title="Normal View"
                  >
                    <Search className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setTimelineZoom("expanded")}
                    className={`p-1 md:p-1.5 rounded transition-all ${timelineZoom === "expanded" ? "bg-cream/10 text-cream" : "hover:bg-cream/5"}`}
                    title="Expanded View"
                  >
                    <Search
                      className="w-3 h-3"
                      style={{ transform: "scale(1.2)" }}
                    />
                  </button>
                </div>
              </div>

              <div className="flex-1 relative min-h-0 z-40">
                <div className="absolute top-0 left-0 bottom-0 w-6 md:w-12 bg-gradient-to-r from-charcoal/90 to-transparent pointer-events-none z-20" />
                <div className="absolute top-0 right-0 bottom-0 w-6 md:w-12 bg-gradient-to-l from-charcoal/90 to-transparent pointer-events-none z-20" />

                <div
                  className="w-full h-full overflow-x-auto p-3 md:p-4 flex gap-4 custom-scrollbar"
                  ref={timelineRef}
                >
                  {renderedTimeline}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="h-16 shrink-0 px-3 md:px-6 border-t border-cream/5 flex items-center justify-between relative z-40">
                <div className="flex items-center gap-3 md:gap-6">
                  <button
                    onClick={() => {
                      const ctx = setupAudioContext();
                      if (ctx?.state === "suspended") {
                        ctx
                          .resume()
                          .then(() =>
                            isPaused
                              ? Orchestrator.play()
                              : Orchestrator.pause(),
                          );
                      } else {
                        isPaused ? Orchestrator.play() : Orchestrator.pause();
                      }
                    }}
                    disabled={storyboard.length === 0}
                    className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-cream text-charcoal flex items-center justify-center transition-all hover:bg-white active:bg-cream/90 disabled:opacity-50 relative overflow-hidden group shadow-md"
                  >
                    {isAudioUIBuffering && (
                      <div className="absolute inset-0 bg-cream/20 flex items-center justify-center">
                        <div className="w-full h-full border-2 border-charcoal/30 border-t-charcoal animate-spin rounded-full" />
                      </div>
                    )}
                    {isPaused ? (
                      <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    ) : (
                      <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                    )}

                    {/* Keyboard Hint */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-cream text-[6px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                      Space
                    </div>
                  </button>
                  <PlaybackControlsTimeObserver storyboard={storyboard} />
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-cream/5 border border-cream/10">
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-cream/40">
                      Scene
                    </span>
                    <span className="text-[10px] md:text-xs font-mono font-bold">
                      {activeItemIndex + 1}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-cream/5 border border-cream/10">
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-cream/40 whitespace-nowrap">
                      Tasks
                    </span>
                    <span className="text-[10px] md:text-xs font-mono font-bold">
                      {storyboard.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showPhaseComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-charcoal/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-lg p-8 rounded-3xl border border-gold/30 bg-gold/5 text-center space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gold shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/10">
                    <Award className="w-10 h-10 text-gold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">
                      Phase Complete
                    </p>
                    <h2 className="text-3xl font-serif italic text-white">
                      {showPhaseComplete}
                    </h2>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-white/30">
                    Progression Summary
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/40 uppercase">
                        Total Sessions
                      </p>
                      <p className="text-xl font-black text-gold">
                        {currentProgression?.completedWorkoutCount}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/40 uppercase">
                        Max Readiness
                      </p>
                      <p className="text-xl font-black text-gold">94%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/40 uppercase">
                        Best Streak
                      </p>
                      <p className="text-xl font-black text-gold">
                        {currentProgression?.consistencyStreak} Days
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-white/40 uppercase">
                        Focus Mastery
                      </p>
                      <p className="text-xl font-black text-green-400">High</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/60 leading-relaxed italic pr-4">
                    "Foundation patterns are now integrated at a neuromuscular
                    level. Moving to specialized hypertrophy protocols."
                  </p>
                </div>

                <button
                  onClick={() => setShowPhaseComplete(null)}
                  className="w-full py-4 rounded-xl bg-gold text-charcoal font-black uppercase text-[12px] tracking-[0.2em] shadow-lg shadow-gold/10 hover:bg-gold/90 transition-all"
                >
                  Enter Next Phase
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Structured SEO Data for SERP Ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Stretching Program - Free AI Workout Program & Exercise Routine Video Generator",
              operatingSystem: "Web",
              applicationCategory: "MultimediaApplication",
              description:
                "The ultimate free AI workout program and exercise routine video generator assistant for Grow Young Fitness. Generate high-quality Stretching, Cardio, and Strength routines for YouTube, TikTok, and Reels.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
            }),
          }}
        />

        <style
          dangerouslySetInnerHTML={{
            __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(241, 236, 229, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(241, 236, 229, 0.2);
        }
        .bg-pattern {
          background-image: radial-gradient(rgba(241, 236, 229, 0.05) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `,
          }}
        />

        <AnimatePresence>
          {pendingConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#111] border border-white/10 p-6 md:p-8 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col gap-6"
              >
                <h3 className="text-cream text-lg font-bold">Please Confirm</h3>
                <p className="text-cream/70 text-sm">{pendingConfirm.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setPendingConfirm(null)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={pendingConfirm.onConfirm}
                    className="flex-1 px-4 py-3 bg-gold hover:bg-white text-charcoal font-bold rounded-xl transition-colors text-sm"
                  >
                    Proceed
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
