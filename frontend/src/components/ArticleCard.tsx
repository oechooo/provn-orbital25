import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ArticleWithMarket } from '../../../shared/types';
import OrderWidget from './OrderWidget';
import { articleAPI } from '../services/api';
import { useAuth } from '../contexts/SimpleAuthContext';

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
  const truePercent = Math.round(probTrue * 100);
  const falsePercent = Math.round(probFalse * 100);

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
                      TRUE {truePercent}%
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
                      FALSE {falsePercent}%
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
    </div>
  );
};

export default ArticleCard;