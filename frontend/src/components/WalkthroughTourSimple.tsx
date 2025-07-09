import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';

const WalkthroughTour: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: 'Welcome to Provn.io!',
      content: 'Welcome to the future of news verification! Provn.io uses prediction markets to help determine the truth of news stories.',
    },
    {
      title: 'Get Started',
      content: 'To participate in prediction markets and earn Prove Points, click the "Login" button in the navigation bar to create an account.',
    }
  ];

  useEffect(() => {
    // Always show the walkthrough when the home page is loaded and user is not logged in
    if (!user) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem('provn-tour-seen', 'true');
  };

  const skipTour = () => {
    completeTour();
  };

  if (!isVisible || user) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
      
      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <button
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Skip
              </button>
            </div>
            
            {/* Content */}
            <p className="text-gray-700 text-lg leading-relaxed">
              {steps[currentStep].content}
            </p>
            
            {/* Progress Dots */}
            <div className="flex items-center justify-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
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
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              
              <button
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalkthroughTour;
