import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

interface Article {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  sourceName: string;
  author: string | null;
  publishedAt: string;
  category: string | null;
}

interface Market {
  id: number;
  articleId: number;
  outcome: boolean | null;
  sharesTrue: number;
  sharesFalse: number;
  probTrue: number;
  probFalse: number;
  createdAt: string;
  article: Article;
  stakes: any[];
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [prediction, setPrediction] = useState<boolean>(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMarketData(parseInt(id));
    }
  }, [id]);

  const fetchMarketData = async (marketId: number) => {
    try {
      setLoading(true);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`http://localhost:3000/api/markets/${marketId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.market) {
        setMarket(data.market);
      } else {
        throw new Error('No market data in response');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Request timed out. Please try again.');
        } else {
          toast.error(`Failed to load article: ${error.message}`);
        }
      } else {
        toast.error('Failed to load article details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceStake = async () => {
    if (!user || !market) {
      toast.error('Please log in to place a stake');
      return;
    }

    if (stakeAmount <= 0) {
      toast.error('Stake amount must be greater than 0');
      return;
    }

    if (stakeAmount > user.provePoints) {
      toast.error('Insufficient ProvePoints');
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          marketId: market.id,
          stakeAmount,
          prediction
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place stake' }));
        throw new Error(errorData.message || 'Failed to place stake');
      }
      
      toast.success(`Stake placed successfully! You predicted: ${prediction ? 'TRUE' : 'FALSE'}`);
      
      // Refresh market data
      await fetchMarketData(market.id);
      
      // Reset form
      setStakeAmount(10);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place stake');
    } finally {
      setPlacing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card p-8 animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-slate-300 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { article } = market;
  const totalStakes = market.stakes.length;
  const totalVolume = market.stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {article.category || 'News'}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {getTimeSince(article.publishedAt)}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex items-center gap-4 text-slate-300 text-sm mb-6">
                  <span className="font-medium">{article.sourceName}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>By {article.author}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Article Image */}
              {article.urlToImage && (
                <div className="mb-6">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Article Description */}
              {article.description && (
                <div className="mb-6">
                  <p className="text-xl text-white leading-relaxed font-medium">
                    {article.description}
                  </p>
                </div>
              )}

              {/* Article Content */}
              {article.content && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Article Preview</h3>
                  <div className="bg-slate-800/50 rounded-lg p-6 border-l-4 border-purple-500">
                    <p className="text-white leading-relaxed whitespace-pre-line text-lg">
                      {article.content.replace(/\s*\[\+\d+\s+chars?\]$/, '')}
                    </p>
                    {article.content.includes('[+') && (
                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          📖 This is a preview. Click "Read Full Article" below to see the complete story.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Read Full Article */}
              <div className="border-t border-slate-700 pt-6">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Read Full Article at {article.sourceName}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Market Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-6">
              
              {/* Market Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Prediction Market</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    market.outcome === null ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {market.outcome === null ? 'Active' : 'Resolved'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  What do you think about this story's truthfulness?
                </p>
              </div>

              {/* Current Odds */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Current Odds</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-green-600/20 border border-green-600/30 rounded-lg p-3">
                    <span className="text-green-400 font-medium">TRUE</span>
                    <span className="text-white font-bold">{(market.probTrue * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                    <span className="text-red-400 font-medium">FALSE</span>
                    <span className="text-white font-bold">{(market.probFalse * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Market Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Stakes:</span>
                    <span className="text-white">{totalStakes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="text-white">{totalVolume.toFixed(2)} PP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-white">{getTimeSince(market.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Place Stake */}
              {user && market.outcome === null ? (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Place Your Stake</h4>
                  
                  {/* Prediction Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-300">Your Prediction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPrediction(true)}
                        className={`p-3 rounded-lg border transition-all ${
                          prediction
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'border-slate-600 text-slate-300 hover:border-green-500'
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => setPrediction(false)}
                        className={`p-3 rounded-lg border transition-all ${
                          !prediction
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'border-slate-600 text-slate-300 hover:border-red-500'
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  {/* Stake Amount */}
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Stake Amount (Available: {user.provePoints.toFixed(2)} PP)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={user.provePoints}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Place Stake Button */}
                  <button
                    onClick={handlePlaceStake}
                    disabled={placing || stakeAmount <= 0 || stakeAmount > user.provePoints}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {placing ? 'Placing...' : `Stake ${stakeAmount.toFixed(2)} PP on ${prediction ? 'TRUE' : 'FALSE'}`}
                  </button>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">Sign in to place stakes</p>
                  <Link 
                    to="/login" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <p>This market has been resolved</p>
                  {market.outcome !== null && (
                    <p className="mt-2 font-semibold">
                      Result: <span className={market.outcome ? 'text-green-400' : 'text-red-400'}>
                        {market.outcome ? 'TRUE' : 'FALSE'}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
