import React from 'react';
import { SimulationMetrics } from '../../types';

interface MetricsDisplayProps {
  metrics: Omit<SimulationMetrics, 'load' | 'delay' | 'officerUtil' | 'availableUnits'>;
  current: number;
  total: number;
}

const MetricsDisplayComponent: React.FC<MetricsDisplayProps> = ({ metrics, current, total }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Score</span>
        <span className="text-2xl font-mono font-bold text-blue-500 block">{metrics.score}</span>
      </div>
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Correct</span>
        <span className="text-2xl font-mono font-bold text-green-500 block">{metrics.correctDecisions}</span>
      </div>
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Incorrect</span>
        <span className="text-2xl font-mono font-bold text-red-500 block">{metrics.wrongDecisions}</span>
      </div>
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Missed</span>
        <span className="text-2xl font-mono font-bold text-yellow-500 block">{metrics.missedCalls}</span>
      </div>
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Avg. Time</span>
        <span className="text-2xl font-mono font-bold text-white block">
          {metrics.averageResponseTime.toFixed(1)}s
        </span>
      </div>
    </div>
  );
};

export const MetricsDisplay = React.memo(MetricsDisplayComponent);
