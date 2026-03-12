import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Shield, 
  Flame, 
  HeartPulse, 
  Brain, 
  ArrowDownCircle 
} from 'lucide-react';
import { Scenario, ResponseCategory } from '../../types';
import { Badge } from '../ui/Badge';

interface ScenarioCardProps {
  scenario: Scenario;
  onDecision: (choice: ResponseCategory) => void;
  disabled?: boolean;
}

const responseOptions = [
  { category: ResponseCategory.POLICE, icon: Shield, color: 'blue', label: 'Police' },
  { category: ResponseCategory.FIRE, icon: Flame, color: 'red', label: 'Fire' },
  { category: ResponseCategory.MEDICAL, icon: HeartPulse, color: 'yellow', label: 'Medical' },
  { category: ResponseCategory.MENTAL_HEALTH, icon: Brain, color: 'purple', label: 'Mental Health' },
  { category: ResponseCategory.LOW_PRIORITY, icon: ArrowDownCircle, color: 'gray', label: 'Low Priority' }
];

const ScenarioCardComponent: React.FC<ScenarioCardProps> = ({ scenario, onDecision, disabled }) => {
  return (
    <motion.div
      key={scenario.id}
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
            <span className="font-medium">{scenario?.location?.name || 'Unknown Location'}</span>
          </div>
        </div>
      </div>
      
      <div className="p-10">
        <h2 className="text-3xl font-bold text-white leading-tight mb-8">
          "{scenario.incident}"
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {responseOptions.map((option) => (
            <button
              key={option.category}
              disabled={disabled}
              onClick={() => onDecision(option.category)}
              className={`flex flex-col items-center justify-center p-6 bg-${option.color}-600/10 border border-${option.color}-600/20 rounded-2xl hover:bg-${option.color}-600 hover:text-white transition-all group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option.icon className={`w-8 h-8 mb-2 text-${option.color}-500 group-hover:text-white`} />
              <span className="font-bold uppercase tracking-widest text-xs text-center">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const ScenarioCard = React.memo(ScenarioCardComponent);
