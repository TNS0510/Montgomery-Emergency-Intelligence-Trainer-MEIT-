import React from 'react';
import { motion } from 'motion/react';
import { MapPin, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { Scenario, TriageCategory } from '../../types';
import { Badge } from '../ui/Badge';

interface ScenarioCardProps {
  scenario: Scenario;
  onDecision: (choice: TriageCategory) => void;
  disabled?: boolean;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ scenario, onDecision, disabled }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl"
    >
      <div className="p-8 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <Badge variant="blue">{scenario.category}</Badge>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{scenario.location}</span>
          </div>
        </div>
      </div>
      
      <div className="p-10">
        <h2 className="text-3xl font-bold text-white leading-tight mb-8">
          "{scenario.incident}"
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            disabled={disabled}
            onClick={() => onDecision(TriageCategory.EMERGENCY)}
            className="flex flex-col items-center justify-center p-6 bg-red-600/10 border border-red-600/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all group disabled:opacity-50"
          >
            <AlertTriangle className="w-8 h-8 mb-2 text-red-500 group-hover:text-white" />
            <span className="font-bold uppercase tracking-widest text-xs">Emergency</span>
          </button>
          <button 
            disabled={disabled}
            onClick={() => onDecision(TriageCategory.NON_EMERGENCY)}
            className="flex flex-col items-center justify-center p-6 bg-yellow-600/10 border border-yellow-600/20 rounded-2xl hover:bg-yellow-600 hover:text-black transition-all group disabled:opacity-50"
          >
            <Clock className="w-8 h-8 mb-2 text-yellow-500 group-hover:text-black" />
            <span className="font-bold uppercase tracking-widest text-xs">Non-Emergency</span>
          </button>
          <button 
            disabled={disabled}
            onClick={() => onDecision(TriageCategory.REDIRECT)}
            className="flex flex-col items-center justify-center p-6 bg-green-600/10 border border-green-600/20 rounded-2xl hover:bg-green-600 hover:text-white transition-all group disabled:opacity-50"
          >
            <RotateCcw className="w-8 h-8 mb-2 text-green-500 group-hover:text-white" />
            <span className="font-bold uppercase tracking-widest text-xs">City Services</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
