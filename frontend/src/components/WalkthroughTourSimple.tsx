import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export interface WalkthroughTourRef {
  startTour: () => void;
}

const WalkthroughTour = forwardRef<WalkthroughTourRef>((_props, ref) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [modalPosition, setModalPosition] = useState<any>({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  });

  // Function to calculate modal position based on highlighted element
  const calculateModalPosition = (elementSelector: string | null): any => {
    if (!elementSelector) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const element = document.querySelector(elementSelector);
    if (!element) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Special handling for news page elements
    if (elementSelector.includes('article-list') || elementSelector.includes('article-card')) {
      // For news page, position modal in a corner that doesn't obstruct content
      if (viewportWidth > 768) {
        return {
          top: '10%',
          right: '5%',
          transform: 'none',
          maxWidth: '280px'
        };
      } else {
        return {
          top: '10%',
          left: '5%',
          transform: 'none',
          maxWidth: '250px'
        };
      }
    }

    // Special handling for article content
    if (elementSelector.includes('article-content')) {
      // Position modal on the right side for article content
      if (viewportWidth > 768) {
        return {
          top: '20%',
          right: '5%',
          transform: 'none',
          maxWidth: '300px'
        };
      } else {
        return {
          top: '10%',
          left: '5%',
          transform: 'none',
          maxWidth: '280px'
        };
      }
    }

    // Special handling for prediction interface
    if (elementSelector.includes('prediction-interface')) {
      // Position modal on the left side for prediction interface
      if (viewportWidth > 768) {
        return {
          top: '20%',
          left: '5%',
          transform: 'none',
          maxWidth: '300px'
        };
      } else {
        return {
          top: '10%',
          left: '5%',
          transform: 'none',
          maxWidth: '280px'
        };
      }
    }

    // Special handling for ProvePoints
    if (elementSelector.includes('prove-points')) {
      return {
        top: rect.bottom + 20 + 'px',
        right: '10%',
        transform: 'none'
      };
    }

    // Default positioning logic
    let position: any = {};

    // Determine vertical position
    if (rect.top > viewportHeight / 2) {
      // Element is in bottom half, position modal above
      position.bottom = (viewportHeight - rect.top + 20) + 'px';
    } else {
      // Element is in top half, position modal below
      position.top = (rect.bottom + 20) + 'px';
    }

    // Determine horizontal position
    if (rect.left > viewportWidth / 2) {
      // Element is in right half, position modal to the left
      position.right = (viewportWidth - rect.right + 20) + 'px';
    } else {
      // Element is in left half, position modal to the right
      position.left = (rect.left + 20) + 'px';
    }

    return position;
  };

  const steps = [
    {
      title: 'Welcome to Provn.io! 🎉',
      content: 'Welcome to the future of news verification! Provn.io uses prediction markets to help determine the truth of news stories. Let\'s take a quick tour! Please get a coffee while we load the tour, it may take up to 3 minutes for our backend to come fully online.',
      icon: '🎉',
      page: null,
      highlight: null,
      action: null
    },
    {
      title: 'Navigation Bar',
      content: 'This is your main navigation. From here you can access News, Login, and your Profile. Let\'s start by exploring the news!',
      icon: '🧭',
      page: null,
      highlight: '[data-tour="navbar"]',
      action: null
    },
    {
      title: 'Let\'s Explore News',
      content: 'Click on "News" to see the latest articles where you can make predictions and earn ProvePoints!',
      icon: '📰',
      page: '/news',
      highlight: '[data-tour="news-link"]',
      action: () => navigate('/news')
    },
    {
      title: 'Article Feed',
      content: 'Here you can see all the latest news articles. Each article has prediction markets where you can bet on whether the story is true or false!',
      icon: '📋',
      page: null,
      highlight: '[data-tour="article-list"]',
      action: null
    },
    {
      title: 'Article Cards',
      content: 'Each card shows a news article with its headline, source, and current prediction percentages. Click on any article to make predictions!',
      icon: '📄',
      page: null,
      highlight: '[data-tour="article-card"]',
      action: null
    },
    {
      title: 'Interacting with News',
      content: 'Now let\'s open an article to see the full content! You can read the complete story, check the source details, and see all the information you need to make an informed prediction.',
      icon: '🤝',
      page: null,
      highlight: '[data-tour="article-card"]',
      action: () => {
        // Find the first article card and click it to open the article page
        const firstArticleCard = document.querySelector('[data-tour="article-card"]') as HTMLElement;
        if (firstArticleCard) {
          const link = firstArticleCard.querySelector('a') || firstArticleCard.closest('a');
          if (link) {
            (link as HTMLAnchorElement).click();
          }
        }
      }
    },
    {
      title: 'Reading the Article',
      content: 'Perfect! Here you can read the full article content, check the source details, and gather all the information you need to make an informed prediction. Take your time to understand the story before making your decision.',
      icon: '📖',
      page: null,
      highlight: '[data-tour="article-content"]',
      action: null
    },
    {
      title: 'Making Predictions',
      content: 'Now that you\'ve read the article, scroll down to see the prediction interface. Here you can stake your ProvePoints on TRUE or FALSE outcomes based on your analysis of the story.',
      icon: '🎯',
      page: null,
      highlight: '[data-tour="prediction-interface"]',
      action: null
    },
    {
      title: 'ProvePoints System',
      content: user 
        ? 'Your ProvePoints (PP) are shown in the top right. That\'s your currency for making predictions. You start with 100 PP!'
        : 'To see your ProvePoints balance and make predictions, you need to be logged in. Would you like to sign up now to start earning and spending ProvePoints?',
      icon: '💰',
      page: null,
      highlight: user ? '[data-tour="prove-points"]' : '[data-tour="login-button"]',
      action: user ? null : () => navigate('/login')
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
      content: 'In your profile, you can see your prediction history, total earnings, and customize your avatar. Keep making smart predictions to climb the leaderboard!',
      icon: '🏆',
      page: null,
      highlight: null,
      action: null
    },
    {
      title: 'Ready to Start!',
      content: 'You\'re all set! Start exploring articles, make your first predictions, and earn ProvePoints. Good luck and happy predicting!',
      icon: '🚀',
      page: null,
      highlight: null,
      action: null
    }
  ];

  // Expose startTour method to parent components
  useImperativeHandle(ref, () => ({
    startTour: () => {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }));

  useEffect(() => {
    // Show the walkthrough when visiting home page
    if (location.pathname === '/' && !localStorage.getItem('provn-tour-seen')) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isVisible && steps[currentStep]) {
      const currentStepData = steps[currentStep];
      setHighlightedElement(currentStepData.highlight);
      
      // Navigate to the required page if specified
      if (currentStepData.page && location.pathname !== currentStepData.page) {
        // Don't navigate immediately, let user click next to navigate
      }
      
      // Calculate modal position based on highlighted element
      try {
        const newPosition = calculateModalPosition(currentStepData.highlight);
        setModalPosition(newPosition);
      } catch (error) {
        console.warn('Error calculating modal position:', error);
        // Use default position if calculation fails
        setModalPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
      }
    }
  }, [currentStep, isVisible, location.pathname]);

  const nextStep = () => {
    if (currentStep >= steps.length) {
      console.warn('Attempted to go beyond last step, completing tour');
      completeTour();
      return;
    }
    
    const currentStepData = steps[currentStep];
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      // Execute action after updating step (with small delay for better UX)
      if (currentStepData.action) {
        setTimeout(() => {
          try {
            currentStepData.action?.();
          } catch (error) {
            console.warn('Error executing step action:', error);
          }
        }, 500);
      }
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

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Backdrop - very light, no blur to avoid obscuring content */}
      <div className="fixed inset-0 bg-black/5 z-40" />
      
      {/* Highlight element */}
      {highlightedElement && (
        <style>
          {`
            ${highlightedElement} {
              position: relative !important;
              z-index: 45 !important;
              box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.3) !important;
              border-radius: 8px !important;
              animation: tour-pulse 2s infinite;
            }
            @keyframes tour-pulse {
              0%, 100% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.3); }
              50% { box-shadow: 0 0 0 2px rgba(168, 85, 247, 1), 0 0 25px rgba(168, 85, 247, 0.5); }
            }
          `}
        </style>
      )}
      
      {/* Tour Modal with dynamic positioning */}
      <div 
        className="fixed z-50 pointer-events-none"
        style={{
          ...modalPosition,
          maxWidth: modalPosition.maxWidth || '20rem'
        }}
      >
        <div className="bg-white/95 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl p-6 mx-4 pointer-events-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{currentStepData.icon}</span>
                <h3 className="text-lg font-bold text-gray-900">
                  {currentStepData.title}
                </h3>
              </div>
              <button
                onClick={skipTour}
                className="text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentStepData.content}
            </p>
            
            {/* Progress */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
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
              <span className="text-xs text-gray-500">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between items-center pt-2">
              {currentStep > 0 ? (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Back
                </button>
              ) : (
                <div />
              )}
              
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

WalkthroughTour.displayName = 'WalkthroughTour';

export default WalkthroughTour;
