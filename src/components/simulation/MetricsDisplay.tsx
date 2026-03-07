import React from 'react';
import { SimulationMetrics } from '../../types';

interface MetricsDisplayProps {
  metrics: SimulationMetrics;
  current: number;
  total: number;
}

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({ metrics, current, total }) => {
  return (
    <div className="flex flex-wrap items-center justify-between mb-8 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">System Load</span>
          <span className={`text-xl font-mono font-bold ${metrics.load > 70 ? 'text-red-500' : 'text-green-500'}`}>
            {metrics.load}%
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Response Delay</span>
          <span className="text-xl font-mono font-bold text-blue-500">{metrics.delay}m</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Units Available</span>
          <span className={`text-xl font-mono font-bold ${metrics.availableUnits < 3 ? 'text-red-500' : 'text-white'}`}>
            {metrics.availableUnits}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Call Queue</span>
          <div className="text-xl font-mono font-bold text-white">
            {current} / {total}
          </div>
        </div>
      </div>
    </div>
  );
};
