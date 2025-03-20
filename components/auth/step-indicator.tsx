'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

/**
 * Step indicator for multi-step forms with animations
 */
export function StepIndicator({ 
  currentStep, 
  totalSteps, 
  labels 
}: StepIndicatorProps) {
  // Generate numeric labels if none provided
  const stepLabels = labels || Array.from({ length: totalSteps }, (_, i) => `${i + 1}`);
  
  return (
    <div className="flex items-center justify-center mb-8 w-full">
      {stepLabels.map((label, index) => (
        <div key={index} className="flex items-center">
          {/* Step circle */}
          <motion.div 
            className={`flex items-center justify-center w-10 h-10 rounded-full 
              ${index < currentStep 
                ? 'bg-primary text-white' 
                : index === currentStep 
                  ? 'bg-gradient-to-r from-primary to-accent text-white' 
                  : 'bg-gray-100 text-gray-500'}`}
            initial={{ scale: 0.9 }}
            animate={{ 
              scale: index === currentStep ? 1.1 : 1,
              transition: { duration: 0.3 }
            }}
          >
            {label}
          </motion.div>
          
          {/* Connector line between steps */}
          {index < totalSteps - 1 && (
            <div className="relative h-1 w-16 mx-1">
              <div className="absolute h-full bg-gray-200 rounded w-full"></div>
              {index < currentStep && (
                <motion.div 
                  className="absolute h-full bg-primary rounded"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 