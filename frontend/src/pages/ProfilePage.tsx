import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
import { stakeAPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Avatar from '../components/Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatar';
import toast from 'react-hot-toast';

interface Stake {
  id: number;
  prediction: boolean;
  stakeAmount: number;
  upside: number;
  resolved: boolean;
  won: boolean | null;
  createdAt: string;
  market: {
    id: number;
    probTrue: number;
    probFalse: number;
    outcome: boolean | null;
    article: {
      id: number;
      title: string;
      sourceName: string;
      publishedAt: string;
    };
  };
}

interface Article {
  id: number;
  title: string;
  description: string | null;
  sourceName: string;
  author: string | null;
  publishedAt: string;
  createdAt: string;
  category: string | null;
  market: {
    id: number;
    probTrue: number;
    probFalse: number;
    outcome: boolean | null;
  } | null;
}

const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stakes' | 'articles'>('stakes');

  if (!user) return null;

  // Get current avatar config from user or use default
  const getCurrentAvatarConfig = (): AvatarConfig => {
    if (user.avatarSkinColor && user.avatarHairColor && user.avatarHair && user.avatarEyes && user.avatarMouth) {
      return {
        skinColor: user.avatarSkinColor,
        hairColor: user.avatarHairColor,
        hair: user.avatarHair,
        eyes: user.avatarEyes,
        mouth: user.avatarMouth,
        accessories: user.avatarAccessories || 'none'
      };
    }
    return DEFAULT_AVATAR_CONFIG;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Refresh user data (including updated provePoints balance)
      await refreshUser();
      
      // Fetch stakes and articles in parallel
      const [stakesResponse, articlesResponse] = await Promise.all([
        stakeAPI.getUserStakes(),
        fetch(`${API_BASE_URL}/articles/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      setStakes(stakesResponse.stakes || []);
      
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setArticles(articlesData.articles || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStakeResult = (stake: Stake) => {
    if (!stake.resolved) {
      return { status: 'pending', color: 'text-yellow-400', text: `Pending ${(stake.stakeAmount * stake.upside).toFixed(2)}PP` };
    }
    
    // For resolved stakes, use the 'won' field to determine the result
    if (stake.won === null) {
      // Refunded stake
      return { status: 'refunded', color: 'text-blue-400', text: `Refunded ${stake.stakeAmount.toFixed(2)}PP` };
    } else if (stake.won === true) {
      // Won stake
      return { status: 'won', color: 'text-green-400', text: `Won ${(stake.stakeAmount * stake.upside).toFixed(2)}PP` };
    } else {
      // Lost stake
      return { status: 'lost', color: 'text-red-400', text: `Lost ${stake.stakeAmount.toFixed(2)}PP` };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ProtectedRoute>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="glass-card p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
              <Avatar 
                config={getCurrentAvatarConfig()} 
                size={120} 
                onClick={() => navigate('/profile/avatar')}
                className="flex-shrink-0"
              />
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                  Welcome, {user.username}!
                </h1>
                <p className="text-slate-300 text-sm">Click your avatar to customize it</p>
              </div>
            </div>

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {user.provePoints.toFixed(2)}
                </div>
                <div className="text-sm text-slate-300">Prove Points</div>
                <button
                  onClick={() => refreshUser()}
                  className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Refresh Balance
                </button>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {stakes.filter(s => s.resolved && s.won === true).length}
                </div>
                <div className="text-sm text-slate-300">Correct Predictions</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {stakes.length}
                </div>
                <div className="text-sm text-slate-300">Total Stakes</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {articles.length}
                </div>
                <div className="text-sm text-slate-300">Articles Created</div>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Member Since
                </label>
                <div className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              {/* Logout Button */}
              <div className="pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* My Stakes & Articles */}
          <div className="glass-card p-8">
            {/* Tab Navigation */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('stakes')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'stakes'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  My Stakes ({stakes.length})
                </button>
                <button
                  onClick={() => setActiveTab('articles')}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'articles'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  My Articles ({articles.length})
                </button>
              </div>
              <button
                onClick={fetchUserData}
                disabled={loading}
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 border border-cyan-500/30 text-cyan-300 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-slate-300">Loading your {activeTab}...</p>
              </div>
            ) : activeTab === 'stakes' ? (
              stakes.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  <div className="text-6xl mb-4"></div>
                  <p className="text-xl font-semibold mb-2">No stakes yet</p>
                  <p className="text-sm">Start making predictions to see your stakes here!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-2 text-sm font-semibold text-slate-300">Article</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Source</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Prediction</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Stake</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Upside</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stakes.map((stake, index) => {
                        const result = getStakeResult(stake);
                        return (
                          <tr 
                            key={stake.id} 
                            className={`hover:bg-white/5 transition-all duration-200 ${
                              index % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                            }`}
                          >
                            <td className="py-4 px-2">
                              <div className="max-w-xs">
                                <h3 
                                  className="text-white font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors duration-200"
                                  onClick={() => navigate(`/article/${stake.market.article.id}`)}
                                >
                                  {stake.market.article.title}
                                </h3>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <div className="text-slate-300 text-sm">
                                <div className="font-medium">{stake.market.article.sourceName}</div>
                                <div className="text-xs text-slate-400 mt-1">{formatDate(stake.createdAt)}</div>
                              </div>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                                stake.prediction 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {stake.prediction ? 'TRUE' : 'FALSE'}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className="text-white font-semibold text-sm">
                                {stake.stakeAmount.toFixed(2)} PP
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className="text-slate-300 font-semibold text-sm">
                                {stake.upside.toFixed(2)}x
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className={`font-semibold text-sm ${result.color}`}>
                                {result.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // My Articles Tab
              articles.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  <div className="text-6xl mb-4">?</div>
                  <p className="text-xl font-semibold mb-2">No articles yet</p>
                  <p className="text-sm mb-4">Start creating articles to see them here!</p>
                  <button
                    onClick={() => navigate('/create-article')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Create Your First Article
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-2 text-sm font-semibold text-slate-300">Title</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Category</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Market Status</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Current Odds</th>
                        <th className="text-center py-4 px-2 text-sm font-semibold text-slate-300">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article, index) => (
                        <tr 
                          key={article.id} 
                          className={`hover:bg-white/5 transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white/2' : 'bg-transparent'
                          }`}
                        >
                          <td className="py-4 px-2">
                            <div className="max-w-sm">
                              <h3 
                                className="text-white font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors duration-200"
                                onClick={() => navigate(`/article/${article.id}`)}
                              >
                                {article.title}
                              </h3>
                              {article.description && (
                                <p className="text-slate-400 text-xs mt-1 line-clamp-1">
                                  {article.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                              {article.category || 'General'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-center">
                            {article.market ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                article.market.outcome === null 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {article.market.outcome === null ? 'Active' : 'Resolved'}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">No Market</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {article.market ? (
                              <div className="text-xs">
                                <div className="text-green-400">T: {(article.market.probTrue * 100).toFixed(0)}%</div>
                                <div className="text-red-400">F: {(article.market.probFalse * 100).toFixed(0)}%</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="py-4 px-2 text-center">
                            <span className="text-slate-300 text-xs">
                              {formatDate(article.createdAt)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;