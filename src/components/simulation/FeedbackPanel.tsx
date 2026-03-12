import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { Scenario } from '../../types';

interface FeedbackPanelProps {
  scenario: Scenario;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ scenario }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-green-500/10 border border-green-500/30 text-green-200 p-6 rounded-2xl mt-6"
    >
      <div className="flex items-center gap-4 mb-4">
        <CheckCircle className="w-6 h-6 text-green-400" />
        <h4 className="text-lg font-bold text-white">Correct Decision</h4>
      </div>
      <div>
        <p className="font-bold">Reason:</p>
        <p>{scenario.reason}</p>
      </div>
    </motion.div>
  );
};
