import { videoDatabase } from '../constants/videoDatabase';
import { findBestMatch } from '../utils/matchExercise';

export function getYoutubeThumbnail(embedUrl: string | null | undefined): string | null {
  if (!embedUrl) return null;

  const match = embedUrl.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (!match) return null;

  return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
}

export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  url = url.trim();
  
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  
  if (url.includes('youtube.com/embed/')) {
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }
  }

  if (url.length === 11 && !url.includes('/')) {
    return `https://www.youtube.com/embed/${url}`;
  }
  
  return null;
}

export function getVideoUrl(exerciseName: string): string | null {
  if (!exerciseName) return null;
  
  const match = findBestMatch(exerciseName, videoDatabase);
  
  console.log("Original Name:", exerciseName);
  console.log("Matched Name:", match);

  if (match) {
    return videoDatabase[match];
  }
  
  return null;
}

