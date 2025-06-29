import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import { stakeAPI, userAPI } from '../services/api';
import ProtectedRoute from '../components/ProtectedRoute';
import Avatar from '../components/Avatar';
import AvatarEditor from '../components/AvatarEditor';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatar';
import toast from 'react-hot-toast';

interface Stake {
  id: number;
  prediction: boolean;
  stakeAmount: number;
  upside: number;
  resolved: boolean;
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

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

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
    fetchUserStakes();
  }, []);

  const fetchUserStakes = async () => {
    try {
      setLoading(true);
      const response = await stakeAPI.getUserStakes();
      setStakes(response.stakes || []);
    } catch (error) {
      console.error('Error fetching stakes:', error);
      toast.error('Failed to load stakes');
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
    if (!stake.resolved || stake.market.outcome === null) {
      return { status: 'pending', color: 'text-yellow-400', text: 'Pending' };
    }
    
    const won = stake.prediction === stake.market.outcome;
    return {
      status: won ? 'won' : 'lost',
      color: won ? 'text-green-400' : 'text-red-400',
      text: won ? `Won ${(stake.stakeAmount * stake.upside).toFixed(2)} PP` : `Lost ${stake.stakeAmount.toFixed(2)} PP`
    };
  };

  const handleAvatarSave = async (newConfig: AvatarConfig) => {
    try {
      setAvatarLoading(true);
      await userAPI.updateAvatar(user.id, {
        avatarSkinColor: newConfig.skinColor,
        avatarHairColor: newConfig.hairColor,
        avatarHair: newConfig.hair,
        avatarEyes: newConfig.eyes,
        avatarMouth: newConfig.mouth,
        avatarAccessories: newConfig.accessories
      });
      
      // Update the user context with new avatar data
      updateUser({
        avatarSkinColor: newConfig.skinColor,
        avatarHairColor: newConfig.hairColor,
        avatarHair: newConfig.hair,
        avatarEyes: newConfig.eyes,
        avatarMouth: newConfig.mouth,
        avatarAccessories: newConfig.accessories
      });
      
      toast.success('Avatar updated successfully!');
      setShowAvatarEditor(false);
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setAvatarLoading(false);
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
                onClick={() => setShowAvatarEditor(true)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {user.provePoints.toFixed(2)}
                </div>
                <div className="text-sm text-slate-300">Prove Points</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {stakes.filter(s => s.resolved && s.prediction === s.market.outcome).length}
                </div>
                <div className="text-sm text-slate-300">Correct Predictions</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {stakes.length}
                </div>
                <div className="text-sm text-slate-300">Total Stakes</div>
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

          {/* My Stakes */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">My Stakes</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-slate-300">Loading your stakes...</p>
              </div>
            ) : stakes.length === 0 ? (
              <div className="text-center text-slate-400 py-12">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-xl font-semibold mb-2">No stakes yet</p>
                <p className="text-sm">Start making predictions to see your stakes here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stakes.map((stake) => {
                  const result = getStakeResult(stake);
                  return (
                    <div key={stake.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                            {stake.market.article.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            <span className="flex items-center gap-1">
                              📰 {stake.market.article.sourceName}
                            </span>
                            <span className="flex items-center gap-1">
                              📅 {formatDate(stake.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${stake.prediction ? 'text-green-400' : 'text-red-400'}`}>
                              {stake.prediction ? 'TRUE' : 'FALSE'}
                            </div>
                            <div className="text-xs text-slate-400">Prediction</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">
                              {stake.stakeAmount.toFixed(2)} PP
                            </div>
                            <div className="text-xs text-slate-400">Staked</div>
                          </div>
                          
                          <div className="text-center">
                            <div className={`text-lg font-bold ${result.color}`}>
                              {result.text}
                            </div>
                            <div className="text-xs text-slate-400">Result</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Avatar Editor Modal */}
        {showAvatarEditor && (
          <AvatarEditor
            initialConfig={getCurrentAvatarConfig()}
            onSave={handleAvatarSave}
            onCancel={() => setShowAvatarEditor(false)}
            isLoading={avatarLoading}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
