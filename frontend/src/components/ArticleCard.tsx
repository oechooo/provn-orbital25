import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ArticleWithMarket } from '../../../shared/types';
import OrderWidget from './OrderWidget';
import OutcomeWidget from './OutcomeWidget';
import { articleAPI, marketAPI } from '../services/api';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

interface ArticleCardProps {
  article: ArticleWithMarket;
  formatDate: (dateString: string) => string;
  defaultImage?: string;
  onArticleUpdate?: (updatedArticle: ArticleWithMarket) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, formatDate, defaultImage = '/default-news.png', onArticleUpdate }) => {
  const imageUrl = article.urlToImage || defaultImage;
  const [showOrderWidget, setShowOrderWidget] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean>(true);
  const [currentArticle, setCurrentArticle] = useState<ArticleWithMarket>(article);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [adminAction, setAdminAction] = useState<'setOutcome' | 'resolve' | null>(null);
  const [showOutcomeWidget, setShowOutcomeWidget] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get dynamic probabilities from currentArticle.market
  const probTrue = currentArticle.market && typeof currentArticle.market.probTrue === 'number' && !isNaN(currentArticle.market.probTrue)
    ? currentArticle.market.probTrue
    : 0.5;
  
  const probFalse = currentArticle.market && typeof currentArticle.market.probFalse === 'number' && !isNaN(currentArticle.market.probFalse)
    ? currentArticle.market.probFalse
    : 0.5;

  // Convert to percentages for display
  const truePercent = Math.round(probTrue * 1000) / 10;
  const falsePercent = Math.round(probFalse * 1000) / 10;

  // Auto-refresh article data every second
  const refreshArticleData = async () => {
    if (!currentArticle.market?.id) return;
    
    try {
      // Fetch fresh articles and find the current one
      const response = await articleAPI.getArticles();
      const updatedArticle = response.articles.find((a: ArticleWithMarket) => a.id === currentArticle.id);
      
      if (updatedArticle && updatedArticle.market) {
        setCurrentArticle(updatedArticle);
        onArticleUpdate?.(updatedArticle);
      }
    } catch (error) {
      console.error('Failed to refresh article data:', error);
    }
  };

  // Set up auto-refresh every second
  useEffect(() => {
    const interval = setInterval(refreshArticleData, 1000);
    return () => clearInterval(interval);
  }, [currentArticle.id, currentArticle.market?.id]);

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAdminMenu) {
        const target = event.target as Element;
        // Check if the click is outside the admin menu container
        const adminMenuContainer = target.closest('[data-admin-menu]');
        if (!adminMenuContainer) {
          setShowAdminMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAdminMenu]);

  // Update currentArticle when article prop changes
  useEffect(() => {
    setCurrentArticle(article);
  }, [article]);

  // Handle stake button clicks with authentication check
  const handleStakeClick = (prediction: boolean) => {
    if (!user) {
      // If user is not logged in, redirect to login
      navigate('/login');
      return;
    }
    
    // If user is logged in, proceed with staking
    setSelectedPrediction(prediction);
    setShowOrderWidget(true);
  };

  // Admin action handlers
  const handleResolveMarket = async () => {
    if (!currentArticle.market?.id) return;
    
    try {
      await marketAPI.adminResolveMarket(currentArticle.market.id);
      await refreshArticleData();
      setAdminAction(null);
      toast.success('Market resolved successfully');
    } catch (error) {
      console.error('Error resolving market:', error);
      toast.error('Failed to resolve market');
    }
  };

  const handleAdminAction = (action: 'setOutcome' | 'resolve') => {
    setAdminAction(action);
    setShowAdminMenu(false);
  };

  const capitalizeCategory = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div
      className="w-full relative flex flex-col bg-slate-900/80 border border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden"
      style={{ maxWidth: '100%' }}
    >
      {/* Admin Menu - Kebab */}
      {user?.isAdmin && (
        <div className="absolute top-4 right-4 z-10" data-admin-menu>
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              title="Admin Actions"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            
            {showAdminMenu && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg py-1 min-w-48 z-20">
                <button
                  onClick={() => {
                    setShowOutcomeWidget(true);
                    setShowAdminMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Set Outcome ({currentArticle.market?.outcome === true ? 'TRUE' : currentArticle.market?.outcome === false ? 'FALSE' : 'NONE'})
                </button>
                <button
                  onClick={() => handleAdminAction('resolve')}
                  className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  Resolve Market
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 self-center">
          <img
            src={imageUrl}
            alt={currentArticle.title}
            className="object-cover w-full h-full"
            onError={e => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + defaultImage) {
                target.src = defaultImage;
              }
            }}
          />
        </div>
        {/* Article Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-cyan-400 font-semibold tracking-wide">
                {capitalizeCategory(currentArticle.category || 'News')}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{formatDate(currentArticle.publishedAt)}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">
                {currentArticle.sourceName || 'Unknown Source'}
                {currentArticle.author && ` (${currentArticle.author})`}
              </span>
            </div>
            <Link
              to={`/article/${currentArticle.id}`}
              className="block text-lg md:text-xl font-bold text-slate-100 hover:text-pink-400 transition-colors leading-snug mb-1"
            >
              {currentArticle.title}
            </Link>
            <p className="text-slate-300 text-sm md:text-base mb-2 line-clamp-3">
              {currentArticle.description || 'No summary available'}
            </p>
            
            {/* Market Prediction Bar - positioned below description */}
            <div className="flex items-center gap-2 mt-2 pr-8">
              <div className="flex-1 h-6 flex rounded overflow-hidden border border-slate-600 relative max-w-lg">
                {/* True probability section */}
                <div
                  className={`h-full ${truePercent >= 80 ? 'bg-emerald-500/90' : truePercent >= 50 ? 'bg-emerald-500/80' : 'bg-emerald-500/70'}`}
                  style={{ width: `${truePercent}%` }}
                >
                  {truePercent > 20 && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-900 drop-shadow-sm">
                      TRUE {truePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
                {/* False probability section */}
                <div
                  className={`h-full ${falsePercent >= 80 ? 'bg-red-500/90' : falsePercent >= 50 ? 'bg-red-500/80' : 'bg-red-500/70'}`}
                  style={{ width: `${falsePercent}%` }}
                >
                  {falsePercent > 20 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-900 drop-shadow-sm">
                      FALSE {falsePercent.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
              {/* Question mark tooltip */}
              <div className="relative">
                <div className="w-4 h-4 bg-slate-600 hover:bg-slate-500 rounded-full flex items-center justify-center cursor-help transition-colors group">
                  <span className="text-xs text-slate-300 font-bold">?</span>
                  {/* Tooltip - positioned to the right side, longer and flatter */}
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-4 py-1.5 bg-slate-800 text-slate-200 text-xs rounded-lg shadow-lg border border-slate-600 w-80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    Users vote on whether this story is true or false, and the bar shows the crowd's current prediction.
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Staking Buttons and Market Close Info */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleStakeClick(true)}
                  className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded transition-colors shadow-sm"
                >
                  Stake TRUE
                </button>
                <button
                  onClick={() => handleStakeClick(false)}
                  className="px-2 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition-colors shadow-sm"
                >
                  Stake FALSE
                </button>
              </div>
              <div className="text-xs text-slate-400 flex-1">
                {currentArticle.market?.nextResolve && (
                  <span>
                    Market resolves on {new Date(currentArticle.market.nextResolve).toLocaleDateString()} at {new Date(currentArticle.market.nextResolve).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Widget Modal */}
      {showOrderWidget && currentArticle.market && (
        <OrderWidget
          marketId={currentArticle.market.id}
          prediction={selectedPrediction}
          currentProbTrue={probTrue}
          currentProbFalse={probFalse}
          onClose={() => setShowOrderWidget(false)}
          onSuccess={() => {
            console.log('Stake placed successfully, refreshing article data...');
            refreshArticleData(); // Immediate refresh after stake
          }}
        />
      )}

      {/* Outcome Widget */}
      {showOutcomeWidget && currentArticle.market && (
        <OutcomeWidget
          marketId={currentArticle.market.id}
          currentOutcome={currentArticle.market.outcome}
          onClose={() => setShowOutcomeWidget(false)}
          onSuccess={async () => {
            await refreshArticleData();
          }}
        />
      )}

      {/* Admin Action Modals */}
      {adminAction === 'resolve' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setAdminAction(null)}>
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-slate-100 mb-4">Resolve Market</h3>
            <p className="text-slate-300 mb-6">
              This will resolve the market using the current market logic. 
              If the market outcome is already set, it will use that outcome. 
              Otherwise, it will resolve based on the current prediction probabilities.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleResolveMarket()}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
              >
                Resolve Market
              </button>
              <button
                onClick={() => setAdminAction(null)}
                className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;