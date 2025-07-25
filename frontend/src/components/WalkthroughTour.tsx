import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Provn.io!',
    content: 'Welcome to the future of news verification! Provn.io uses prediction markets to help determine the truth of news stories. Let\'s get you started.',
    position: 'center'
  },
  {
    id: 'login-prompt',
    title: 'Get Started',
    content: 'To participate in prediction markets and earn Prove Points, you\'ll need to create an account. Click the "Login" button in the navigation bar to get started.',
    target: '[data-tour="login-button"]',
    position: 'bottom'
  }
];

const WalkthroughTour: React.FC = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Only show tour for non-logged-in users who haven't seen it
    const tourSeen = localStorage.getItem('provn-tour-seen');
    if (!user && !tourSeen) {
      setHasSeenTour(false);
      // Start tour after a short delay
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsActive(false);
    localStorage.setItem('provn-tour-seen', 'true');
    setHasSeenTour(true);
  };

  const skipTour = () => {
    completeTour();
  };

  const getStepPosition = (step: TourStep) => {
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        const stepWidth = 320;
        const stepHeight = 200;
        
        // Ensure the tooltip doesn't go off-screen
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = rect.left + (rect.width / 2) - (stepWidth / 2);
        let top = rect.bottom + 10;
        
        switch (step.position) {
          case 'bottom':
            top = rect.bottom + 10;
            // Adjust horizontal position if it would go off-screen
            if (left < 10) left = 10;
            if (left + stepWidth > viewportWidth - 10) left = viewportWidth - stepWidth - 10;
            break;
          case 'top':
            top = rect.top - stepHeight - 10;
            if (left < 10) left = 10;
            if (left + stepWidth > viewportWidth - 10) left = viewportWidth - stepWidth - 10;
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (stepHeight / 2);
            left = rect.left - stepWidth - 10;
            if (left < 10) left = rect.right + 10; // Fallback to right side
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (stepHeight / 2);
            left = rect.right + 10;
            if (left + stepWidth > viewportWidth - 10) left = rect.left - stepWidth - 10; // Fallback to left side
            break;
          default:
            return {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            };
        }
        
        // Ensure vertical position doesn't go off-screen
        if (top < 10) top = 10;
        if (top + stepHeight > viewportHeight - 10) top = viewportHeight - stepHeight - 10;
        
        return { top, left };
      }
    }
    
    // Center position for steps without target
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    };
  };

  const highlightElement = (selector: string) => {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
      el.classList.remove('tour-highlight');
    });
    
    // Add highlight to target element
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tour-highlight');
    }
  };

  useEffect(() => {
    if (isActive && TOUR_STEPS[currentStep]?.target) {
      highlightElement(TOUR_STEPS[currentStep].target!);
    }
    
    return () => {
      // Cleanup highlights when component unmounts or step changes
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [isActive, currentStep]);

  console.log('WalkthroughTour component is rendering');

  if (!isActive || user || hasSeenTour) {
    return <div>WalkthroughTour is inactive or hidden.</div>;
  }

  const currentStepData = TOUR_STEPS[currentStep];
  const position = getStepPosition(currentStepData);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Tour Step */}
      <div
        className="fixed z-50 bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 max-w-sm"
        style={position}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {currentStepData.title}
            </h3>
            <button
              onClick={skipTour}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Skip
            </button>
          </div>
          
          {/* Content */}
          <p className="text-gray-700 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
          
          {/* Progress */}
          <div className="flex items-center space-x-2">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-purple-500'
                    : index < currentStep
                    ? 'bg-purple-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex justify-between items-center pt-2">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              {currentStep === TOUR_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
        
        {/* Arrow pointer for targeted steps */}
        {currentStepData.target && currentStepData.position !== 'center' && (
          <div 
            className={`absolute w-3 h-3 bg-white/95 rotate-45 ${
              currentStepData.position === 'bottom' 
                ? '-top-1.5 left-1/2 -translate-x-1/2' 
                : currentStepData.position === 'top'
                ? '-bottom-1.5 left-1/2 -translate-x-1/2'
                : currentStepData.position === 'left'
                ? 'top-1/2 -right-1.5 -translate-y-1/2'
                : 'top-1/2 -left-1.5 -translate-y-1/2'
            }`}
          />
        )}
      </div>
    </>
  );
};

export default WalkthroughTour;
