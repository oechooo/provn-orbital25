import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const WalkthroughTour: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  // Add function to manually start tour
  const startTour = () => {
    setIsVisible(true);
    setCurrentStep(0);
  };

  // Make the startTour function available globally
  useEffect(() => {
    (window as any).startProvnTour = startTour;
    return () => {
      delete (window as any).startProvnTour;
    };
  }, []);

  const steps = [
    {
      title: 'Welcome to Provn.io!',
      content: 'Welcome to the future of news verification! Let\'s take a guided tour of how Provn.io works. This interactive tour will show you the actual pages and features!',
      icon: '🌟',
      page: '/',
      highlight: null,
      action: null
    },
    {
      title: 'Your Homepage',
      content: 'This is your homepage! Here you can see the latest news and get an overview of Provn.io. Notice the navigation bar at the top.',
      icon: '🏠',
      page: '/',
      highlight: '[data-tour="navbar"]',
      action: null
    },
    {
      title: 'Explore News',
      content: 'Let\'s check out the news section where you can see all available articles for prediction! Click "Next" to navigate there now.',
      icon: '📰',
      page: '/news',
      highlight: null,
      action: () => navigate('/news')
    },
    {
      title: 'The News Page',
      content: 'Welcome to the news page! Here you can see all the articles available for predictions. Each article shows its title, description, and most importantly - the market confidence percentages.',
      icon: '📊',
      page: '/news',
      highlight: '[data-tour="article-list"]',
      action: null
    },
    {
      title: 'Understanding Articles',
      content: 'Each article card shows market confidence with TRUE/FALSE percentages. Higher percentages mean more community confidence. Notice how each article has prediction markets attached!',
      icon: '�',
      page: '/news',
      highlight: '[data-tour="article-card"]',
      action: null
    },
    {
      title: 'Visit an Article',
      content: 'Now let\'s visit an actual article to see how predictions work! Click "Next" and we\'ll take you to a real article page.',
      icon: '🎯',
      page: '/news',
      highlight: '[data-tour="article-link"]',
      action: () => navigate('/article/34')
    },
    {
      title: 'Article Detail Page',
      content: 'Here\'s where the magic happens! This is a real article detail page. You can read the full article, see the current market probabilities, and place your own predictions using ProvePoints.',
      icon: '🔍',
      page: '/article/34',
      highlight: '[data-tour="article-content"]',
      action: null
    },
    {
      title: 'Making Predictions',
      content: 'See the prediction interface on the right? This is where you can stake ProvePoints on whether you think this news will prove TRUE or FALSE. The market updates in real-time based on community predictions!',
      icon: '💎',
      page: '/article/34',
      highlight: '[data-tour="prediction-interface"]',
      action: null
    },
    {
      title: 'ProvePoints System',
      content: 'Your ProvePoints (PP) are shown in the top right. That\'s your currency for making predictions. You start with 100 PP! If you\'re not logged in, you\'ll see the login button instead.',
      icon: '�',
      page: null,
      highlight: '[data-tour="prove-points"]',
      action: null
    },
    {
      title: 'Your Profile',
      content: 'Let\'s visit your profile to customize your avatar and track your progress! If you\'re not logged in, this will take you to the login page.',
      icon: '✨',
      page: '/profile',
      highlight: null,
      action: () => user ? navigate('/profile') : navigate('/login')
    },
    {
      title: 'Track Your Success',
      content: 'In your profile, you can see your prediction history, customize your avatar, and track your PP earnings! This is your personal dashboard for success.',
      icon: '🏆',
      page: '/profile',
      highlight: '.avatar-section',
      action: null
    },
    {
      title: 'Ready to Start!',
      content: 'You\'ve completed the tour! You\'ve seen the news page, visited an actual article, and learned how predictions work. Ready to start making your own predictions and earning ProvePoints?',
      icon: '🚀',
      page: null,
      highlight: null,
      action: null
    }
  ];

  useEffect(() => {
    // Show the walkthrough for new users (not logged in) or if they haven't seen it
    const hasSeenTour = localStorage.getItem('provn-tour-seen');
    const isHomePage = window.location.pathname === '/';
    
    if (!user && isHomePage && !hasSeenTour) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [user]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextStepData = steps[nextStepIndex];
      
      // Execute action if present
      if (nextStepData.action) {
        nextStepData.action();
      }
      
      // Navigate to page if specified
      if (nextStepData.page && nextStepData.page !== location.pathname) {
        navigate(nextStepData.page);
      }
      
      // Set highlight element
      setHighlightedElement(nextStepData.highlight);
      
      setCurrentStep(nextStepIndex);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    setHighlightedElement(null);
    localStorage.setItem('provn-tour-seen', 'true');
  };

  const skipTour = () => {
    completeTour();
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      const prevStepData = steps[prevStepIndex];
      
      // Navigate to previous page if specified
      if (prevStepData.page && prevStepData.page !== location.pathname) {
        navigate(prevStepData.page);
      }
      
      // Set highlight element
      setHighlightedElement(prevStepData.highlight);
      
      setCurrentStep(prevStepIndex);
    }
  };

  // Calculate optimal modal position based on highlighted element
  const calculateModalPosition = (elementSelector: string | null) => {
    if (!elementSelector) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    try {
      const element = document.querySelector(elementSelector);
      if (!element) {
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      }

      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const modalWidth = 500; // Approximate modal width
      const modalHeight = 400; // Approximate modal height

      // Determine best position - avoid overlapping with highlighted element
      let position = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

      // Check if element is in the center - move modal to side
      if (rect.left > modalWidth && rect.right < viewportWidth - modalWidth) {
        // Element is centered horizontally - position modal to the side
        if (rect.left > viewportWidth / 2) {
          // Element is on right side - position modal on left
          position = {
            top: '50%',
            left: '20%',
            transform: 'translate(-50%, -50%)'
          };
        } else {
          // Element is on left side - position modal on right
          position = {
            top: '50%',
            left: '80%',
            transform: 'translate(-50%, -50%)'
          };
        }
      } else if (rect.top > modalHeight) {
        // Element is in lower part - position modal at top
        position = {
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      } else if (rect.bottom < viewportHeight - modalHeight) {
        // Element is in upper part - position modal at bottom
        position = {
          top: '80%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      } else if (rect.left > modalWidth) {
        // Element is on right - position modal on left
        position = {
          top: '50%',
          left: '25%',
          transform: 'translate(-50%, -50%)'
        };
      } else if (rect.right < viewportWidth - modalWidth) {
        // Element is on left - position modal on right
        position = {
          top: '50%',
          left: '75%',
          transform: 'translate(-50%, -50%)'
        };
      }

      return position;
    } catch (error) {
      console.warn('Error calculating modal position:', error);
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  // Update modal position when highlighted element changes
  useEffect(() => {
    const updatePosition = () => {
      const newPosition = calculateModalPosition(highlightedElement);
      setModalPosition(newPosition);
    };

    // Update position immediately
    updatePosition();

    // Update position on window resize
    window.addEventListener('resize', updatePosition);
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timeoutId);
    };
  }, [highlightedElement]);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Subtle overlay that doesn't completely block content */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-50 pointer-events-none" />
      
      {/* Enhanced spotlight effect for highlighted elements */}
      {highlightedElement && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0">
            {/* This creates a prominent "spotlight" effect on the highlighted element */}
            <style>{`
              ${highlightedElement} {
                position: relative !important;
                z-index: 51 !important;
                box-shadow: 0 0 0 4px rgba(168, 85, 247, 1), 0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4) !important;
                border-radius: 12px !important;
                animation: pulse-highlight 2s infinite !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(0px) !important;
              }
              
              @keyframes pulse-highlight {
                0%, 100% { 
                  box-shadow: 0 0 0 4px rgba(168, 85, 247, 1), 0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4);
                  transform: scale(1);
                }
                50% { 
                  box-shadow: 0 0 0 8px rgba(168, 85, 247, 1), 0 0 40px rgba(168, 85, 247, 1), 0 0 80px rgba(168, 85, 247, 0.6);
                  transform: scale(1.02);
                }
              }
            `}</style>
          </div>
        </div>
      )}
      
      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div 
          className="absolute bg-white/95 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 max-w-md w-auto mx-4 pointer-events-auto transition-all duration-300 ease-out"
          style={modalPosition}
        >
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{steps[currentStep].icon}</div>
                <h2 className="text-xl font-bold text-gray-900">
                  {steps[currentStep].title}
                </h2>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip
              </button>
            </div>
            
            {/* Content */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4">
              <p className="text-gray-700 text-base leading-relaxed">
                {steps[currentStep].content}
              </p>
              
              {/* Show current page indicator */}
              {steps[currentStep].page && (
                <div className="mt-3 text-xs text-purple-600 font-medium">
                  📍 Currently on: {steps[currentStep].page === '/' ? 'Homepage' : steps[currentStep].page.replace('/', '').charAt(0).toUpperCase() + steps[currentStep].page.slice(2)}
                </div>
              )}
            </div>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={goToPreviousStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-30 disabled:cursor-not-allowed font-medium rounded-lg hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                ← Back
              </button>
              
              <button
                onClick={nextStep}
                className={`px-6 py-2 font-bold rounded-lg transition-all duration-300 text-sm ${
                  currentStep === steps.length - 1
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                }`}
              >
                {currentStep === steps.length - 1 ? '🚀 Start!' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalkthroughTour;
