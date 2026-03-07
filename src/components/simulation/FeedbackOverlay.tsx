import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { DecisionRecord, Scenario } from '../../types';
import { Button } from '../ui/Button';

interface FeedbackOverlayProps {
  show: boolean;
  decision: DecisionRecord | null;
  scenario: Scenario;
  onNext: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ show, decision, scenario, onNext }) => {
  if (!show || !decision) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl max-w-lg w-full shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          {decision.isCorrect ? (
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
          )}
          <div>
            <h3 className={`text-2xl font-bold ${decision.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {decision.isCorrect ? 'Correct Triage' : 'Improper Triage'}
            </h3>
            <p className="text-zinc-500 text-sm uppercase tracking-widest font-mono">
              Official Protocol: {decision.correct}
            </p>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Rationale</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{scenario.reason}</p>
          </div>
          <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">System Impact</h4>
            <p className="text-zinc-300 text-sm leading-relaxed">{scenario.impact}</p>
          </div>
        </div>

        <Button onClick={onNext} className="w-full py-4 gap-2">
          Next Incoming Call
          <ChevronRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};
