import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import { articleAPI, marketAPI } from '../services/api';
import MarketCard from '../components/MarketCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [simpleStats, setSimpleStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch simple stats
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/markets/simple-stats`);
        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          console.log('Simple stats:', stats); // Debug log
          setSimpleStats(stats);
        } else {
          console.error('Stats API error:', statsResponse.status);
          // Set default stats if API fails
          setSimpleStats({ users: 0, stories: 0 });
        }
      } catch (statsError) {
        console.error('Error fetching simple stats:', statsError);
        // Set default stats if API fails
        setSimpleStats({ users: 0, stories: 0 });
      }
      
      // Fetch all markets with their articles
      try {
        const marketsResponse = await marketAPI.getMarkets();
        const allMarkets = marketsResponse.markets || [];
        
        // Set first 6 markets for display
        setMarkets(allMarkets.slice(0, 6));
        
        // Calculate stats
        const marketStatsData = {
          totalMarkets: allMarkets.length,
          activeMarkets: allMarkets.filter((m: any) => !m.resolved).length,
          totalStakes: allMarkets.reduce((sum: number, m: any) => sum + (m.stakes?.length || 0), 0),
        };
        setMarketStats(marketStatsData);
      } catch (error) {
        console.error('Error fetching markets:', error);
        // Set empty markets and default stats if API fails
        setMarkets([]);
        setMarketStats({
          totalMarkets: 0,
          activeMarkets: 0,
          totalStakes: 0
        });
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load market data - running in offline mode');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshNews = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await articleAPI.refreshArticles();
      toast.success('News refreshed! New markets may be available.');
      await fetchHomeData();
    } catch (error) {
      console.error('Error refreshing news:', error);
      toast.error('Failed to refresh news');
    } finally {
      setRefreshing(false);
    }
  };

  const handleStakeSuccess = () => {
    // Refresh data after successful stake
    fetchHomeData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              {simpleStats ? `${simpleStats.users} users staking on ${simpleStats.stories} stories` : 'Loading statistics...'}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Have a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Stake
              </span>
              {' '}in the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                Truth
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Stake your Prove Points on news truthfulness. Join a community that fights misinformation through prediction markets.
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3">
                  <span className="text-white font-medium">
                    Balance: <span className="text-cyan-400 font-bold">{user.provePoints.toFixed(2)} PP</span>
                  </span>
                </div>
                <Link
                  to="/news"
                  className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                >
                  <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    View News
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl hover:from-cyan-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
                >
                  <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    Start Predicting
                    <svg className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:text-white transform hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Statistics Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Live Prediction Markets
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Stake on the truthfulness of breaking news. Use prediction markets to verify information and earn Prove Points.
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-8 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : marketStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">
                {marketStats.totalMarkets}
              </div>
              <div className="text-slate-300">Total Markets</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {marketStats.activeMarkets}
              </div>
              <div className="text-slate-300">Active Markets</div>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {marketStats.totalStakes}
              </div>
              <div className="text-slate-300">Total Stakes</div>
            </div>
          </div>
        ) : null}

        {/* Refresh Button */}
        <div className="text-center mb-8">
          <button
            onClick={handleRefreshNews}
            disabled={refreshing}
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {refreshing ? 'Refreshing...' : 'Refresh News & Markets'}
          </button>
        </div>

        {/* Markets Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Featured Markets</h3>
            <Link
              to="/news"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              View All News →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-4"></div>
                  <div className="h-20 bg-slate-700 rounded mb-4"></div>
                  <div className="h-8 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : markets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  onStakeSuccess={handleStakeSuccess}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-white mb-2">No Markets Available</h3>
              <p className="text-slate-300 mb-6">
                No prediction markets are currently active. Try refreshing to load new markets from recent news.
              </p>
              <button
                onClick={handleRefreshNews}
                disabled={refreshing}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
              >
                {refreshing ? 'Loading...' : 'Load Markets'}
              </button>
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-lg text-slate-300">Simple steps to start verifying news</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Read News</h3>
              <p className="text-slate-300">Browse breaking news articles from verified sources</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stake Points</h3>
              <p className="text-slate-300">Use your Prove Points to bet on article truthfulness</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Earn Rewards</h3>
              <p className="text-slate-300">Win points when markets resolve in your favor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;