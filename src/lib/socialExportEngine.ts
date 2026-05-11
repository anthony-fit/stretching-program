import { Exercise } from "../data/exercises";
import { StoryboardItem } from "./biomechanicalAnalyzer";

export interface SocialExportPreset {
  id: string;
  name: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  pacingModifier: "fast" | "standard" | "slow";
  subtitlePosition: "center" | "bottom" | "top";
  overlayTiming: {
    hookDuration: number;
    ctaStartTime: number; // seconds from end
  };
  ctaText: string;
}

export const EXPORT_PRESETS: SocialExportPreset[] = [
  {
    id: "tiktok",
    name: "TikTok Vertical",
    aspectRatio: "9:16",
    pacingModifier: "fast",
    subtitlePosition: "center",
    overlayTiming: { hookDuration: 3, ctaStartTime: 5 },
    ctaText: "Generate your own routine",
  },
  {
    id: "shorts",
    name: "YouTube Shorts",
    aspectRatio: "9:16",
    pacingModifier: "fast",
    subtitlePosition: "bottom",
    overlayTiming: { hookDuration: 4, ctaStartTime: 5 },
    ctaText: "AI-powered mobility orchestration",
  },
  {
    id: "reels",
    name: "Instagram Reels",
    aspectRatio: "9:16",
    pacingModifier: "fast",
    subtitlePosition: "center",
    overlayTiming: { hookDuration: 3, ctaStartTime: 4 },
    ctaText: "Build your recovery session",
  },
  {
    id: "landscape",
    name: "Standard Landscape",
    aspectRatio: "16:9",
    pacingModifier: "standard",
    subtitlePosition: "bottom",
    overlayTiming: { hookDuration: 5, ctaStartTime: 8 },
    ctaText: "Adaptive recovery engine",
  },
  {
    id: "square",
    name: "Square Preview",
    aspectRatio: "1:1",
    pacingModifier: "standard",
    subtitlePosition: "bottom",
    overlayTiming: { hookDuration: 4, ctaStartTime: 5 },
    ctaText: "Generate your own routine",
  },
];

export function generateHookOverlay(config: any): string {
  const goal = (config.type || "").toLowerCase();
  const pain = config.painPoints && config.painPoints.length > 0 ? config.painPoints[0].toLowerCase() : "";
  const focus = (config.focus || "").toLowerCase();
  
  if (pain) {
    if (goal.includes("mobility") || goal.includes("stretch")) {
      return `Mobility reset for tight ${pain}`;
    }
    return `Relief for your ${pain} in minutes`;
  }
  
  if (goal.includes("recovery") || goal.includes("mobility") || goal.includes("stretch")) {
    return `Desk posture reset & recovery`;
  }
  
  if (goal.includes("fat burn") || goal.includes("hiit")) {
    return `Fat-burning flow for ${focus}`;
  }
  
  return `Fix tight ${focus} in 15 minutes`;
}

export function selectSmartThumbnailFrame(items: StoryboardItem[]): StoryboardItem | null {
  if (items.length === 0) return null;
  // look for peak movement, posture frame, high motion, or recovery highlight.
  // heuristically: find items that are not just "Child's Pose" initially unless it's a recovery session.
  // find items with 'high' load score or 'mobility' category
  const dynamicItems = items.filter(i => 
    i.category.toLowerCase().includes("strength") || 
    i.category.toLowerCase().includes("mobility")
  );
  if (dynamicItems.length > 0) {
    // pick one from middle
    return dynamicItems[Math.floor(dynamicItems.length / 2)];
  }
  return items[Math.floor(items.length / 2)];
}

export function applySocialPacing(items: StoryboardItem[], presetId: string): StoryboardItem[] {
  const preset = EXPORT_PRESETS.find(p => p.id === presetId);
  if (!preset) return items;
  
  if (preset.pacingModifier === "fast") {
    // Tighten intro timing, increase subtitle cadence effectively by shortening overly long holds if not stretching
    return items.map((item, idx) => {
      let d = item.duration;
      // reduce overly long holds
      if (d > 45 && !item.category.toLowerCase().includes("stretching") && !item.category.toLowerCase().includes("recovery")) {
        d = 40;
      }
      // tighten first intro 
      if (idx === 0 && d > 30) {
        d = 30;
      }
      return { ...item, duration: d, baseDuration: d };
    });
  }
  
  return items;
}
