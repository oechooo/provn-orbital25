import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import { articleAPI, marketAPI } from '../services/api';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch recent articles for preview
      const articlesResponse = await articleAPI.getArticles({ limit: 3 });
      setRecentArticles(articlesResponse.articles || []);

      // Fetch market statistics
      const marketsResponse = await marketAPI.getMarkets();
      const markets = marketsResponse.markets || [];
      
      const stats = {
        totalMarkets: markets.length,
        activeMarkets: markets.filter((m: any) => !m.isResolved).length,
        totalVolume: markets.reduce((sum: number, m: any) => sum + m.totalStake, 0),
      };
      setMarketStats(stats);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };  return (
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
            {/* Floating Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8 animate-float">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live prediction markets • 10K+ users
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
              Truth Through
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-text">
                Prediction
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Harness the <span className="text-cyan-400 font-semibold">wisdom of crowds</span> to verify news accuracy. 
              Bet on outcomes, earn rewards, and help create a more trustworthy information ecosystem.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/news"
                  className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/25"
                >
                  <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    View Markets
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-lg font-bold text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:text-white transform hover:scale-105 transition-all duration-300"
                >
                  Dashboard
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
            
            {/* Scroll Indicator */}
            <div className="mt-20 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Market Statistics Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Live Market Data
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">Intelligence</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real-time insights from our prediction ecosystem
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-200 border-opacity-20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : marketStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl font-black text-white mb-4 animate-counter">
                    {marketStats.totalMarkets}
                  </div>
                  <div className="text-gray-300 font-medium text-lg">Total Markets</div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl font-black text-white mb-4 animate-counter">
                    {marketStats.activeMarkets}
                  </div>
                  <div className="text-gray-300 font-medium text-lg">Active Markets</div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl font-black text-white mb-4 animate-counter">
                    {marketStats.totalVolume?.toLocaleString() || '0'}
                  </div>
                  <div className="text-gray-300 font-medium text-lg">ProvePoints Wagered</div>
                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <p className="text-gray-400 text-lg">Unable to load market statistics</p>
              </div>
            </div>
          )}
        </div>
      </div>      {/* Recent News Preview Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">Markets</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Recent articles with active prediction markets
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-purple-200 border-opacity-20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {recentArticles.map((article, index) => (
                <div key={index} className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-3xl blur group-hover:blur-xl transition duration-300"></div>
                  <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    {article.urlToImage && (
                      <div className="w-full h-48 mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                        <img 
                          src={article.urlToImage} 
                          alt={article.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {article.description || article.content?.substring(0, 150) + '...'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium">
                        {article.sourceName}
                      </span>
                    </div>
                    
                    {/* Market indicator */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        Market Active
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-12">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <p className="text-gray-400 text-lg">No recent articles available</p>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <Link
              to="/news"
              className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-2xl hover:from-cyan-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
            >
              <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Explore All Markets
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>      {/* How It Works Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Three simple steps to help verify news accuracy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur group-hover:blur-xl transition duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="absolute top-6 left-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Read News</h3>
                <p className="text-gray-300 leading-relaxed">
                  Browse curated news articles from reliable sources with active prediction markets.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur group-hover:blur-xl transition duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="absolute top-6 left-6 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Make Predictions</h3>
                <p className="text-gray-300 leading-relaxed">
                  Use your ProvePoints to bet on whether news claims will prove true or false.
                </p>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur group-hover:blur-xl transition duration-300"></div>
              <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="absolute top-6 left-6 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn Rewards</h3>
                <p className="text-gray-300 leading-relaxed">
                  Win ProvePoints for accurate predictions and help create a more trustworthy news ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-12">
              <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Predict?</span>
              </h2>
              <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join our community and help create a more trustworthy information ecosystem through 
                <span className="text-cyan-400 font-semibold"> prediction markets</span>
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl hover:from-cyan-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
                  >
                    <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                    <span className="relative flex items-center">
                      Start Predicting Today
                      <svg className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  
                  <div className="text-gray-400 text-lg">
                    Free to join • No credit card required
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;