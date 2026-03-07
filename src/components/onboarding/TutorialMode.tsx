import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Info, ChevronRight, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface TutorialModeProps {
  onComplete: () => void;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to MEIT",
      content: "Montgomery Emergency Intelligence Trainer (MEIT) simulates the high-pressure environment of emergency dispatch.",
      icon: Shield
    },
    {
      title: "The Triage Process",
      content: "Your job is to classify incoming calls into three categories: Emergency, Non-Emergency, or City Services.",
      icon: Info
    },
    {
      title: "System Impact",
      content: "Incorrect decisions increase system load and response delays, potentially putting lives at risk.",
      icon: ChevronRight
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 p-10 rounded-3xl max-w-lg w-full shadow-2xl relative"
      >
        <button 
          onClick={onComplete}
          className="absolute top-6 right-6 text-zinc-500 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
            <currentStep.icon className="text-blue-500 w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">{currentStep.title}</h3>
          <p className="text-zinc-400 mb-10 leading-relaxed">{currentStep.content}</p>
          
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-zinc-800'}`} 
              />
            ))}
          </div>

          <Button 
            onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
            className="w-full"
          >
            {step < steps.length - 1 ? "Next" : "Start Training"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
