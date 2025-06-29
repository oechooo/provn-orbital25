import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import { marketAPI, stakeAPI } from '../services/api';
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
    console.log('ArticleDetailPage mounted with id:', id);
    if (id) {
      fetchMarketData(parseInt(id));
    }
  }, [id]);

  const fetchMarketData = async (marketId: number) => {
    try {
      setLoading(true);
      console.log('Fetching market data for ID:', marketId);
      
      // Test basic connectivity first
      try {
        const testResponse = await fetch('http://localhost:3000/api/markets');
        console.log('Basic connectivity test status:', testResponse.status);
      } catch (connError) {
        console.error('Connectivity test failed:', connError);
      }
      
      const response = await marketAPI.getMarketById(marketId);
      console.log('API Response:', response);
      setMarket(response.market);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast.error('Failed to load article details');
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
      await stakeAPI.createStake(market.id, stakeAmount, prediction);
      
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
            <div className="text-white mt-4">Loading market ID: {id}</div>
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
            <p className="text-slate-300 mb-6">Attempted to load market ID: {id}</p>
            <p className="text-slate-300 mb-6">Market data: {market ? 'Found' : 'Not found'}</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <article className="glass-card p-6 mb-6">
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full text-xs font-medium">
                    {article.category?.toUpperCase() || 'NEWS'}
                  </span>
                  <span>•</span>
                  <span>{article.sourceName}</span>
                  <span>•</span>
                  <span>{getTimeSince(article.publishedAt)}</span>
                </div>
                
                <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                
                {article.author && (
                  <p className="text-slate-300 mb-4">By {article.author}</p>
                )}
                
                {article.description && (
                  <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {article.description}
                  </p>
                )}
              </div>

              {/* Article Image */}
              {article.urlToImage && (
                <div className="mb-6">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Article Content */}
              {article.content && (
                <div className="prose prose-invert prose-lg max-w-none mb-6">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {article.content.replace(/\[.*?\]/g, '')}
                  </p>
                </div>
              )}

              {/* External Link */}
              <div className="border-t border-slate-700 pt-6">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Read Full Article
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-1M14 6h6m0 0v6m0-6L10 16" />
                  </svg>
                </a>
              </div>
            </article>
          </div>

          {/* Market Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Prediction Market</h2>
              
              {/* Market Question */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Will this story prove to be accurate and significant?
                </h3>
                <p className="text-sm text-slate-400">
                  Predict whether the claims in this article will be confirmed by reliable sources and have lasting impact.
                </p>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(market.probTrue * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-300">TRUE odds</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-400">
                    {(market.probFalse * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-red-300">FALSE odds</div>
                </div>
              </div>

              {/* Market Activity */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Market Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Stakes:</span>
                    <span className="text-white">{totalStakes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Volume:</span>
                    <span className="text-white">{totalVolume} PP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Created:</span>
                    <span className="text-white">{formatDate(market.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Staking Interface */}
              {user ? (
                <div className="border-t border-slate-700 pt-6">
                  <h4 className="text-white font-semibold mb-4">Place Your Stake</h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">
                      Your Prediction
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPrediction(true)}
                        className={`p-3 rounded-lg border transition-colors ${
                          prediction 
                            ? 'bg-green-600/20 border-green-500 text-green-400' 
                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => setPrediction(false)}
                        className={`p-3 rounded-lg border transition-colors ${
                          !prediction 
                            ? 'bg-red-600/20 border-red-500 text-red-400' 
                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-slate-400 mb-2">
                      Stake Amount (ProvePoints)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={user.provePoints}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                    />
                    <div className="text-xs text-slate-400 mt-1">
                      Available: {user.provePoints} PP
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceStake}
                    disabled={placing || stakeAmount <= 0 || stakeAmount > user.provePoints}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-semibold"
                  >
                    {placing ? 'Placing Stake...' : `Stake ${stakeAmount} PP on ${prediction ? 'TRUE' : 'FALSE'}`}
                  </button>
                </div>
              ) : (
                <div className="border-t border-slate-700 pt-6">
                  <div className="text-center">
                    <p className="text-slate-400 mb-4">Sign in to participate in this market</p>
                    <Link 
                      to="/login"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Stakes */}
            {market.stakes.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-white mb-4">Recent Stakes</h3>
                <div className="space-y-3">
                  {market.stakes.slice(0, 5).map((stake, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{stake.user?.username || 'Anonymous'}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          stake.prediction 
                            ? 'bg-green-900/20 text-green-400' 
                            : 'bg-red-900/20 text-red-400'
                        }`}>
                          {stake.prediction ? 'TRUE' : 'FALSE'}
                        </span>
                      </div>
                      <span className="text-white">{stake.stakeAmount} PP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
