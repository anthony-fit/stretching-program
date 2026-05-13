export interface AudioAsset {
  url: string;
  duration?: number;
}

export interface TTSProvider {
  synthesize(text: string, voice?: string): Promise<AudioAsset | null>;
}

// In-memory cache for narration assets
const audioCache = new Map<string, string>();

function hashString(str: string): string {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return hash.toString();
}

/**
 * Fallback TTS Provider using a public unauthenticated API 
 * for demonstration of a real HTTP TTS pipeline without Gemini.
 */
export class StreamElementsTTSProvider implements TTSProvider {
  async synthesize(text: string, voice: string = "Brian"): Promise<AudioAsset | null> {
    if (!text) return null;
    
    const hash = hashString(`${text}-${voice}`);
    if (audioCache.has(hash)) {
      console.log("[TTS] Using cached audio asset");
      return { url: audioCache.get(hash)! };
    }

    try {
      // Using a free, unauthenticated TTS API for demonstration of a real HTTP provider
      const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      audioCache.set(hash, blobUrl);
      
      return { url: blobUrl };
    } catch (error) {
      console.warn("[TTS] Generation failed:", error);
      return null;
    }
  }
}

export const ttsProvider = new StreamElementsTTSProvider();

