import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Maximize, RotateCcw, Volume2, VolumeX, CheckCircle, FileCheck, Layers, Video } from "lucide-react";

interface MasterReviewPlayerProps {
  src: string;
  metadata?: {
    duration: number;
    fps: number;
    resolution: string;
    codec: string;
  };
}

export function MasterReviewPlayer({ src, metadata }: MasterReviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowOverlay(false), 2000);
    } else {
      setShowOverlay(true);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showOverlay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowOverlay(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, "0");
    const s = Math.floor(timeInSeconds % 60).toString().padStart(2, "0");
    const ms = Math.floor((timeInSeconds % 1) * 100).toString().padStart(2, "0");
    return `${m}:${s}:${ms}`;
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 z-50 bg-charcoal flex flex-col items-center justify-center group"
      onMouseMove={() => setShowOverlay(true)}
      onClick={() => setShowOverlay(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Confidence Overlay (Top Left) */}
      <div 
        className={`absolute top-4 left-4 flex flex-col gap-1 transition-opacity duration-1000 ${showOverlay && !isPlaying ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center gap-2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase">Master Package Stable</span>
        </div>
        <div className="flex items-center gap-2 bg-charcoal/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
          <FileCheck className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-bold tracking-widest text-white/70 uppercase">Audio Synchronized</span>
        </div>
      </div>

      {/* Metadata Panel (Top Right) */}
      <div 
        className={`absolute top-4 right-4 bg-charcoal/90 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col gap-3 min-w-[200px] transition-opacity duration-1000 ${showOverlay && !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Master Details</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[9px] font-medium tracking-widest uppercase text-white/40">
            <span>Duration</span>
            <span className="text-white/80">{formatTime(metadata?.duration || duration)}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-medium tracking-widest uppercase text-white/40">
            <span>Framerate</span>
            <span className="text-white/80">{metadata?.fps || "30.00"} FPS</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-medium tracking-widest uppercase text-white/40">
            <span>Resolution</span>
            <span className="text-white/80">{metadata?.resolution || "1080x1920"}</span>
          </div>
          <div className="flex justify-between items-center text-[9px] font-medium tracking-widest uppercase text-white/40">
            <span>Codec</span>
            <span className="text-white/80">{metadata?.codec || "VP8/WebM"}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div 
        className={`absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 flex flex-col gap-4 ${showOverlay ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        {/* Progress Bar */}
        <div className="relative h-1 bg-white/10 rounded-full cursor-pointer group/progress">
          <div 
            className="absolute top-0 left-0 h-full bg-gold rounded-full"
            style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
          />
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            step="0.01" 
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = parseFloat(e.target.value);
                setCurrentTime(parseFloat(e.target.value));
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-charcoal flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <div className="text-[10px] font-mono tracking-wider text-white/50">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="w-8 h-8 rounded-full bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full bg-white/5 text-white/70 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
