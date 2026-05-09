import { useEffect, useState } from 'react';

/**
 * Orchestration Kernel
 * 
 * This is the definitive source of truth for all temporal state in the application.
 * - React does not drive time; it subscribes to time.
 * - Audio does not dictate time; it aligns to time.
 * - Export loops do not generate time; they request deterministic steps from this kernel.
 */

export type PlaybackState = 'playing' | 'paused' | 'seeking' | 'ended';

export interface SceneMeta {
  id: string;
  duration: number;
}

export interface OrchestratorTimeState {
  globalTime: number;
  localTime: number;
  activeSceneIndex: number;
}

type TimeSubscription = (timeState: OrchestratorTimeState) => void;
type StateSubscription = (state: PlaybackState) => void;

class OrchestrationEngine {
  private globalTime: number = 0;
  private state: PlaybackState = 'paused';
  private rate: number = 1.0;
  private scenes: SceneMeta[] = [];
  private totalDuration: number = 0;
  
  private rafId: number | null = null;
  private lastRafTime: number = 0;
  private isAudioBuffering: boolean = false;
  
  private isExporting: boolean = false;
  private exportFps: number = 60;

  private timeSubscribers: Set<TimeSubscription> = new Set();
  private stateSubscribers: Set<StateSubscription> = new Set();

  public get timeState(): OrchestratorTimeState {
    return this.calculateTimeState(this.globalTime);
  }

  public get currentState() {
    return this.state;
  }

  public setScenes(scenes: SceneMeta[]) {
    this.scenes = scenes;
    this.totalDuration = scenes.reduce((acc, s) => acc + s.duration, 0) + 1.5; // +1.5s cinematic hold
    // Notify in case globalTime is now out of bounds
    if (this.globalTime > this.totalDuration && this.totalDuration > 0) {
      this.globalTime = this.totalDuration;
    }
    this.notifyTime();
  }

  public updateSceneDuration(index: number, newDuration: number) {
    if (index < 0 || index >= this.scenes.length) return;
    if (this.scenes[index].duration !== newDuration) {
      this.scenes[index].duration = newDuration;
      this.totalDuration = this.scenes.reduce((acc, s) => acc + s.duration, 0) + 1.5;
      this.notifyTime();
    }
  }

  public subscribeTime(callback: TimeSubscription) {
    this.timeSubscribers.add(callback);
    return () => this.timeSubscribers.delete(callback);
  }

  public subscribeState(callback: StateSubscription) {
    this.stateSubscribers.add(callback);
    return () => this.stateSubscribers.delete(callback);
  }

  private calculateTimeState(gTime: number): OrchestratorTimeState {
    if (this.scenes.length === 0) {
      return { globalTime: gTime, localTime: 0, activeSceneIndex: 0 };
    }
    
    let timeAcc = 0;
    for (let i = 0; i < this.scenes.length; i++) {
      const sceneDur = this.scenes[i].duration;
      if (gTime >= timeAcc && gTime < timeAcc + sceneDur) {
        return { globalTime: gTime, localTime: gTime - timeAcc, activeSceneIndex: i };
      }
      timeAcc += sceneDur;
    }
    
    // If exactly at or past the end
    const lastIdx = this.scenes.length - 1;
    return { 
      globalTime: gTime, 
      localTime: this.scenes[lastIdx].duration, // Capped at end of last scene
      activeSceneIndex: lastIdx 
    };
  }

  private notifyTime() {
    const ts = this.calculateTimeState(this.globalTime);
    this.timeSubscribers.forEach(sub => sub(ts));
  }

  private notifyState() {
    this.stateSubscribers.forEach(sub => sub(this.state));
  }

  public play() {
    if (this.state === 'playing') return;
    if (this.totalDuration > 0 && this.globalTime >= this.totalDuration) {
      this.globalTime = 0; // Seamless restart
    }
    
    this.state = 'playing';
    this.notifyState();
    this.lastRafTime = performance.now();
    
    if (!this.isExporting) {
      this.tick();
    }
  }

  public pause() {
    if (this.state === 'paused') return;
    
    this.state = 'paused';
    this.notifyState();
    
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public seek(targetGlobalTime: number) {
    this.globalTime = Math.max(0, this.totalDuration > 0 ? Math.min(targetGlobalTime, this.totalDuration) : targetGlobalTime);
    
    const wasPlaying = this.state === 'playing';
    
    // Announce seeking phase for temporal receivers to synchronously reconcile
    this.state = 'seeking';
    this.notifyState();
    this.notifyTime();

    if (wasPlaying) {
      this.state = 'playing';
      this.notifyState();
      this.lastRafTime = performance.now();
      if (!this.isExporting) {
        this.tick();
      }
    } else {
      this.state = 'paused';
      this.notifyState();
    }
  }

  public seekToScene(index: number, localTimeOffset: number = 0) {
    let target = 0;
    for (let i = 0; i < Math.min(index, this.scenes.length); i++) {
      target += this.scenes[i].duration;
    }
    this.seek(target + localTimeOffset);
  }

  public setRate(rate: number) {
    this.rate = rate;
  }
  
  public setAudioBuffering(isBuffering: boolean) {
    this.isAudioBuffering = isBuffering;
    if (!isBuffering && this.state === 'playing') {
      this.lastRafTime = performance.now(); // Reset drift when resuming from buffer
    }
  }

  public getTotalDuration() {
    return this.totalDuration;
  }

  // --- External Governance (Export Parity) ---

  public beginDeterministicExport(fps: number = 60) {
    this.pause();
    this.isExporting = true;
    this.exportFps = fps;
    this.globalTime = 0;
    this.notifyTime();
  }

  public stepDeterministic() {
    if (!this.isExporting) return;
    
    this.globalTime += 1 / this.exportFps;
    
    if (this.totalDuration > 0 && this.globalTime >= this.totalDuration) {
      this.globalTime = this.totalDuration;
      this.state = 'ended';
      this.notifyState();
    }
    this.notifyTime();
  }

  public endDeterministicExport() {
    this.isExporting = false;
    this.globalTime = 0;
    this.notifyTime();
  }

  // --- Internal Clock ---

  private tick = () => {
    if (this.state !== 'playing' || this.isExporting) return;

    if (this.isAudioBuffering) {
      // Just wait for buffering to resolve without advancing time
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const now = performance.now();
    const dt = (now - this.lastRafTime) / 1000;
    this.lastRafTime = now;

    this.globalTime += dt * this.rate;

    if (this.totalDuration > 0 && this.globalTime >= this.totalDuration) {
      this.globalTime = this.totalDuration;
      this.state = 'ended';
      this.notifyTime();
      this.notifyState();
      this.rafId = null;
      return;
    }

    this.notifyTime();
    this.rafId = requestAnimationFrame(this.tick);
  }
}

export const Orchestrator = new OrchestrationEngine();

export function useOrchestrator() {
  const [timeState, setTimeState] = useState<OrchestratorTimeState>(Orchestrator.timeState);
  const [playbackState, setPlaybackState] = useState<PlaybackState>(Orchestrator.currentState);

  useEffect(() => {
    const unsubTime = Orchestrator.subscribeTime(setTimeState);
    const unsubState = Orchestrator.subscribeState(setPlaybackState);
    return () => {
      unsubTime();
      unsubState();
    };
  }, []);

  return { ...timeState, playbackState, totalDuration: Orchestrator.getTotalDuration() };
}
