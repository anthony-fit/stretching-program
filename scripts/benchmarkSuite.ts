import { EXERCISE_DATABASE } from '../src/data/exercises';
import { generateLocalRoutine } from '../src/services/localRoutineService';
import { analyzeAndBalanceRoutine } from '../src/lib/biomechanicalAnalyzer';
import { applyAdaptiveGoalEngine } from '../src/lib/adaptiveGoalEngine';
import { applyProgressiveAdaptation } from '../src/lib/progressiveAdaptationEngine';
import { applyMovementIntelligence } from '../src/lib/movementIntelligence';
import { applyAdaptiveRhythm } from '../src/lib/adaptiveRhythmEngine';

interface BenchmarkConfig {
  name: string;
  durationMinutes: number;
  level: string;
  focus: string;
}

const EXPERIMENTS: BenchmarkConfig[] = [
  { name: '1m Mobility', durationMinutes: 1, level: 'Beginner', focus: 'Mobility' },
  { name: '5m Strength', durationMinutes: 5, level: 'Intermediate', focus: 'Strength' },
  { name: '15m Recovery', durationMinutes: 15, level: 'Beginner', focus: 'Recovery' },
  { name: '30m Cardio', durationMinutes: 30, level: 'Advanced', focus: 'Cardio' }
];

async function runBenchmark() {
  console.log("==========================================");
  console.log("  ORCHESTRATION PIPELINE BENCHMARK SUITE  ");
  console.log("==========================================\\n");
  
  let totalAnomalies = 0;
  const startTotal = performance.now();

  for (const config of EXPERIMENTS) {
    console.log(`-- Running: ${config.name} --`);
    const t0 = performance.now();
    
    // 1. Generate Deterministic Blueprint
    const routine = generateLocalRoutine(config.level, config.focus, config.durationMinutes, EXERCISE_DATABASE);
    const targetSeconds = config.durationMinutes * 60;
    
    let items = routine.exercises.map(ex => {
       const mapped = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
       return {
         ...(mapped || EXERCISE_DATABASE[0]), // fallback
         duration: typeof ex.duration === 'number' ? ex.duration : 60,
         baseDuration: typeof ex.duration === 'number' ? ex.duration : 60,
         name: ex.name
       };
    });
    
    let scripts = items.map(i => ({ exerciseName: i.name, script: "Mock script." }));
    
    const tBlueprint = performance.now();
    
    // 2. Biomechanical
    const biomechResult = analyzeAndBalanceRoutine(items as any, EXERCISE_DATABASE);
    items = biomechResult.items;
    const tBiomech = performance.now();
    
    // 3. Adaptive Goal
    const adaptiveResult = applyAdaptiveGoalEngine(items as any, EXERCISE_DATABASE, { focus: config.focus, level: config.level, type: config.focus });
    items = adaptiveResult.items;
    const tAdaptive = performance.now();
    
    // 4. Memory / Progressive
    const memoryResult = applyProgressiveAdaptation(items as any, scripts, EXERCISE_DATABASE, { focus: config.focus });
    items = memoryResult.items;
    scripts = memoryResult.scripts;
    const tMemory = performance.now();
    
    // 5. Movement Intelligence
    const movementResult = applyMovementIntelligence(items as any, scripts);
    items = movementResult.items;
    scripts = movementResult.scripts;
    const tMovement = performance.now();
    
    // 6. Adaptive Rhythm
    const rhythmResult = applyAdaptiveRhythm(items as any, scripts, targetSeconds);
    items = rhythmResult.items;
    scripts = rhythmResult.scripts;
    const tRhythm = performance.now();
    
    const durationSum = items.reduce((acc, i) => acc + i.duration, 0);
    const msTotal = (tRhythm - t0).toFixed(2);
    
    console.log(`  Generation Speed:   ${msTotal} ms`);
    console.log(`  Final Items:        ${items.length}`);
    console.log(`  Expected Duration:  ${targetSeconds}s`);
    console.log(`  Actual Duration:    ${durationSum}s`);
    console.log(`  Rhythm Profile:     ${rhythmResult.diagnostics?.profile}`);
    console.log(`  Flow Score:         ${movementResult.diagnostics?.finalScore}`);
    console.log(`  Flow Issues:        ${movementResult.diagnostics?.issues?.length || 0}`);
    console.log(`  Pacing Spread:      ${rhythmResult.diagnostics?.varianceScore}% variance`);
    
    if (Math.abs(durationSum - targetSeconds) > 5) {
        console.log(`  [!] ANOMALY: Duration drift detected`);
        totalAnomalies++;
    }
    if ((movementResult.diagnostics?.finalScore || 100) < 80) {
        console.log(`  [!] ANOMALY: Poor flow score (<80)`);
        totalAnomalies++;
    }
    
    console.log(""); // spacing
  }

  const msTotalSuite = (performance.now() - startTotal).toFixed(2);
  console.log(`\\nBenchmark Suite Complete in ${msTotalSuite} ms`);
  console.log(`Total regressions / anomalies found: ${totalAnomalies}`);
}

runBenchmark().catch(console.error);
