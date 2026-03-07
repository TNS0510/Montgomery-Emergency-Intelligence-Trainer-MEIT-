import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  BarChart3, 
  RotateCcw,
  Info
} from 'lucide-react';

import { TriageCategory, DecisionRecord, Scenario } from './types';
import { useSimulation } from './hooks/useSimulation';
import { scenarioEngine } from './services/scenarioEngine';
import { aiFeedbackService } from './services/aiFeedbackService';
import { storageService } from './services/storageService';

import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { ScenarioCard } from './components/simulation/ScenarioCard';
import { MetricsDisplay } from './components/simulation/MetricsDisplay';
import { FeedbackOverlay } from './components/simulation/FeedbackOverlay';
import { TutorialMode } from './components/onboarding/TutorialMode';

type AppMode = 'landing' | 'training' | 'recruit' | 'insights';

export default function App() {
  const [mode, setMode] = useState<AppMode>('landing');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastDecision, setLastDecision] = useState<DecisionRecord | null>(null);
  const [timeLeft, setTimeLeft] = useState(100);
  const [aiFeedback, setAiFeedback] = useState<string>("");

  const {
    currentScenarioIndex,
    currentScenario,
    score,
    history,
    metrics,
    isGameOver,
    handleDecision,
    nextScenario,
    reset
  } = useSimulation(scenarios);

  useEffect(() => {
    const init = async () => {
      const data = await scenarioEngine.getScenarios();
      setScenarios(data);
      setLoading(false);
      
      const progress = storageService.getProgress();
      if (!progress) {
        setShowTutorial(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isGameOver && history.length > 0) {
      const getFeedback = async () => {
        const feedback = await aiFeedbackService.generateFeedback(history, scenarios);
        setAiFeedback(feedback);
      };
      getFeedback();
    }
  }, [isGameOver, history, scenarios]);

  // Recruit Mode Timer
  useEffect(() => {
    let timer: number;
    if (mode === 'recruit' && !showFeedback && !isGameOver && !loading) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            onDecision('timeout' as any);
            return 100;
          }
          return prev - 1.5;
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [mode, showFeedback, isGameOver, loading]);

  const onDecision = (choice: TriageCategory) => {
    const record = handleDecision(choice);
    if (record) {
      setLastDecision(record);
      setShowFeedback(true);
    }
  };

  const onNext = () => {
    setShowFeedback(false);
    setTimeLeft(100);
    nextScenario();
  };

  const onReset = () => {
    reset();
    setMode('landing');
    setAiFeedback("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Initializing System...</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
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
  );

  const renderSim = () => (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <MetricsDisplay 
        metrics={metrics} 
        current={currentScenarioIndex + 1} 
        total={scenarios.length} 
      />

      {mode === 'recruit' && (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-red-500"
            initial={{ width: '100%' }}
            animate={{ width: `${timeLeft}%` }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </div>
      )}

      {currentScenario && (
        <ScenarioCard 
          scenario={currentScenario} 
          onDecision={onDecision} 
          disabled={showFeedback} 
        />
      )}

      <FeedbackOverlay 
        show={showFeedback} 
        decision={lastDecision} 
        scenario={currentScenario} 
        onNext={onNext} 
      />
    </div>
  );

  const renderInsights = () => {
    const accuracy = Math.round((score / history.length) * 100) || 0;

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-extrabold tracking-tighter text-white">Simulation Results</h2>
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart Trainer
          </Button>
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
                          <p className="text-sm font-medium text-white">{scenario?.location}</p>
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
              <h3 className="text-xl font-bold text-white mb-8">Workforce Impact</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Response Delay</span>
                    <span className="text-xs font-bold text-white font-mono">{metrics.delay} MINS</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (metrics.delay / 20) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">Officer Utilization</span>
                    <span className="text-xs font-bold text-white font-mono">{metrics.officerUtil}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${metrics.officerUtil}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">System Strain</span>
                    <span className={`text-xs font-bold font-mono ${metrics.load > 70 ? 'text-red-500' : 'text-green-500'}`}>
                      {metrics.load > 70 ? 'CRITICAL' : metrics.load > 40 ? 'ELEVATED' : 'STABLE'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${metrics.load > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${metrics.load}%` }} />
                  </div>
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
