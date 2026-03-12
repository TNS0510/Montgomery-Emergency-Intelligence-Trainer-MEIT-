import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Activity, 
  BarChart3, 
  RotateCcw,
  Info,
  Timer,
  Trophy,
  RefreshCw
} from 'lucide-react';

import { ResponseCategory, DecisionRecord, Scenario } from './types';
import { useSimulation } from './hooks/useSimulation';
import { scenarioEngine } from './services/scenarioEngine';
import { aiFeedbackService } from './services/aiFeedbackService';
import { storageService } from './services/storageService';
import { brightDataService } from './services/brightDataService';
import { arcgisService } from './services/arcgisService';

import { Button } from './components/ui/Button';
import { ScenarioCard } from './components/simulation/ScenarioCard';
import { MetricsDisplay } from './components/simulation/MetricsDisplay';
import { FeedbackOverlay } from './components/simulation/FeedbackOverlay';
import { FeedbackPanel } from './components/simulation/FeedbackPanel';
import { TutorialMode } from './components/onboarding/TutorialMode';
import CityMap, { MapMarker } from './components/ui/CityMap';

export type AppMode = 'landing' | 'training' | 'recruit' | 'insights';

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastDecision, setLastDecision] = useState<DecisionRecord | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string>("");
  const [highScore, setHighScore] = useState(0);
  const [ambientMarkers, setAmbientMarkers] = useState<MapMarker[]>([]);

  const {
    scenarios,
    currentScenarioIndex,
    history,
    metrics,
    remainingTime,
    isGameOver,
    handleDecision,
    nextScenario,
    reset,
    setScenarios,
  } = useSimulation(mode);

  const currentScenario = scenarios[currentScenarioIndex];

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch static scenarios first as a reliable base
      const staticScenarios = await scenarioEngine.getScenarios();
      
      // 2. Fetch live incidents from ArcGIS
      const arcgisMarkers = await arcgisService.getIncidents();

      // 3. Fetch live incidents from Bright Data
      const liveScenarios = await brightDataService.getLiveIncidents(staticScenarios);
      const brightDataMarkers: MapMarker[] = liveScenarios.map(scenario => ({
        id: String(scenario.id),
        name: scenario.category, 
        position: [scenario.location.lat, scenario.location.lng],
        isAmbient: true
      }));

      setAmbientMarkers([...arcgisMarkers, ...brightDataMarkers]);

      // 4. Set scenarios for the simulation
      const allScenarios = [...staticScenarios, ...liveScenarios];
      allScenarios.sort(() => Math.random() - 0.5); // Shuffle the deck

      setScenarios(allScenarios);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setLoading(false);
    }
  }, [setScenarios]);

  useEffect(() => {
    const init = async () => {
      await refreshData();
      setHighScore(storageService.getHighScore());
      
      const progress = storageService.getProgress();
      if (!progress) {
        setShowTutorial(true);
      }
    };
    init();
  }, [refreshData]);

  useEffect(() => {
    if (isGameOver && history.length > 0) {
      if (metrics.score > highScore) {
        setHighScore(metrics.score);
        storageService.saveHighScore(metrics.score);
      }

      const getFeedback = async () => {
        const feedback = await aiFeedbackService.generateFeedback(history, scenarios);
        setAiFeedback(feedback);
      };
      getFeedback();
    }
  }, [isGameOver, history, scenarios, metrics.score, highScore]);

  const onDecision = useCallback((choice: ResponseCategory | 'timeout') => {
    const record = handleDecision(choice);
    if (record) {
      setLastDecision(record);
      setShowFeedback(true);
    }
  }, [handleDecision]);

  const onNext = useCallback(() => {
    setShowFeedback(false);
    nextScenario();
  }, [nextScenario]);

  const onReset = useCallback(() => {
    reset();
    setMode('landing');
    setAiFeedback("");
    setAmbientMarkers([]); // Clear live markers on reset
  }, [reset]);

  const handleAcceptIncident = useCallback((id: string) => {
    // A real implementation might involve:
    // 1. Finding the incident in the ambientMarkers list
    // 2. Converting it into a full-fledged Scenario
    // 3. Adding it to the beginning of the current scenario queue
    console.log(`Incident ${id} has been accepted and could be added to the simulation queue.`);
    
    // For now, let's just remove it from the map to show it's been handled
    setAmbientMarkers(prev => prev.filter(marker => marker.id !== id));
  }, []);

  const scenarioMarkers: MapMarker[] = useMemo(() => {
    return currentScenario?.location
      ? [{
          id: String(currentScenario.id),
          name: currentScenario.location.name,
          position: [currentScenario.location.lat, currentScenario.location.lng]
        }]
      : [];
  }, [currentScenario]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Initializing System... (Fetching Live Incidents)</p>
        </div>
      </div>
    );
  }

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center animate-pulse-red">
            <Shield className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter mb-4 text-white">MEIT</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          Montgomery Emergency Intelligence Trainer. Experience the high-stakes world of emergency triage and see the impact of every decision.
        </p>
      </motion.div>

      <div className="w-full max-w-5xl mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'training', title: 'TRAINING MODE', desc: 'Learn the fundamentals of call classification.', icon: Info },
            { id: 'recruit', title: 'RECRUIT MODE', desc: 'High-pressure survival simulation with active timers.', icon: Activity },
            { id: 'insights', title: 'SYSTEM INSIGHTS', desc: 'Analyze workforce impact and response data.', icon: BarChart3 },
          ].map((item, idx) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setMode(item.id as AppMode)}
              className="group bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl text-left hover:border-blue-500/50 transition-all hover:bg-zinc-900"
            >
              <item.icon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
      
      {highScore > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-500/10 border border-yellow-500/20 px-6 py-3 rounded-full flex items-center gap-4"
        >
          <Trophy className="w-6 h-6 text-yellow-500" />
          <div className="text-left">
            <p className="text-sm font-bold text-white">High Score</p>
            <p className="text-xs text-zinc-400">{highScore} points</p>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderSim = () => (
    <div className="max-w-7xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <MetricsDisplay 
          metrics={metrics} 
          current={currentScenarioIndex + 1} 
          total={scenarios.length} 
        />
        
        {currentScenario && (
          <ScenarioCard 
            scenario={currentScenario} 
            onDecision={onDecision} 
            disabled={showFeedback} 
          />
        )}

        {showFeedback && currentScenario && (
          <FeedbackPanel scenario={currentScenario} />
        )}
      </div>
      
      <div className="space-y-8">
        <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-mono font-bold text-red-500">{remainingTime}s</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-500"
              initial={{ width: "100%" }}
              animate={{ width: `${(remainingTime / 10) * 100}%` }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </div>
        </div>
        
        <div className="h-[400px]">
          <CityMap 
            markers={scenarioMarkers} 
            ambientMarkers={ambientMarkers}
            onAcceptIncident={handleAcceptIncident} 
          />
        </div>
      </div>

      <FeedbackOverlay 
        show={showFeedback} 
        decision={lastDecision} 
        scenario={currentScenario} 
        onNext={onNext} 
      />
    </div>
  );

  const renderInsights = () => {
    const accuracy = Math.round((metrics.correctDecisions / history.length) * 100) || 0;
    const totalDecisions = history.length;
    const estimatedDelay = metrics.wrongDecisions * 2; // Each wrong decision adds 2 minutes of delay
    const dispatcherLoad = metrics.wrongDecisions * 3 - metrics.correctDecisions * 1; // Each wrong decision adds 3%, each correct one reduces 1%

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-extrabold tracking-tighter text-white">Simulation Complete</h2>
          <div className="flex gap-4">
            <Button variant="outline" onClick={refreshData} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh Live Incidents
            </Button>
            <Button variant="outline" onClick={onReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restart Simulation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-white">Triage Accuracy</h3>
                <span className="text-3xl font-mono font-bold text-blue-500">{accuracy}%</span>
              </div>
              <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden mb-12">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${accuracy}%` }}
                  className="h-full bg-blue-500"
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              
              <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl italic text-zinc-300 leading-relaxed relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 font-mono">AI Analyst Evaluation</span>
                {aiFeedback ? `"${aiFeedback}"` : "Analyzing performance..."}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Decision History</h3>
              </div>
              <div className="divide-y divide-zinc-800">
                {history.map((record, idx) => {
                  const scenario = scenarios.find(s => s.id === record.scenarioId);
                  return (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                      <div className="flex items-center gap-4">
                        {record.isCorrect ? (
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{scenario?.location?.name || 'Unknown Location'}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                            Choice: {record.choice} | Correct: {record.correct}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 font-mono">CALL #{idx + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
              <h3 className="text-xl font-bold text-white mb-8">Session Summary</h3>
               <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Total Decisions</span>
                  <span className="text-lg font-bold text-white">{totalDecisions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Correct Decisions</span>
                  <span className="text-lg font-bold text-green-500">{metrics.correctDecisions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Incorrect Decisions</span>
                  <span className="text-lg font-bold text-red-500">{metrics.wrongDecisions}</span>
                </div>
                <hr className="border-zinc-700 my-4" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Estimated Delay Added</span>
                  <span className="text-lg font-bold text-white">{estimatedDelay} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Dispatcher Load Change</span>
                  <span className={`text-lg font-bold ${dispatcherLoad > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {dispatcherLoad > 0 ? '+' : ''}{dispatcherLoad}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showTutorial && <TutorialMode onComplete={() => setShowTutorial(false)} />}
      
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white leading-none">MEIT</h1>
              <p className="text-[8px] text-zinc-500 uppercase tracking-[0.2em] font-mono">Montgomery Emergency Intelligence Trainer</p>
            </div>
          </div>
          
          {(mode === 'training' || mode === 'recruit') && (
            <div className="flex items-center gap-6 text-sm font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span>Score:</span>
                <span className="font-bold text-white">{metrics.score}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Time:</span>
                <span className="font-bold text-white">{remainingTime}s</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Mode:</span>
                <span className="font-bold text-white capitalize">{mode}</span>
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">System Online</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} CST
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {mode === 'landing' && renderLanding()}
        {(mode === 'training' || mode === 'recruit') && !isGameOver && renderSim()}
        {(mode === 'insights' || isGameOver) && renderInsights()}
      </main>

      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          &copy; 2026 Montgomery Public Safety Education Initiative. For Training Purposes Only.
        </p>
      </footer>
    </div>
  );
}
