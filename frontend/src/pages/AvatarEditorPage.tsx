import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
<<<<<<< HEAD
import { userAPI } from '../services/api';
import Avatar from '../components/Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG, AVATAR_OPTIONS, AVATAR_REQUIREMENTS } from '../utils/avatar';
=======
import Avatar from '../components/Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG, AVATAR_OPTIONS } from '../utils/avatar';
>>>>>>> 082367f (Article readibility improvement)
import toast from 'react-hot-toast';

const AvatarEditorPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'skinColor' | 'hairColor' | 'hairStyle' | 'eyes' | 'mouth' | 'accessories'>('skinColor');

  // Initialize avatar config from user or use default
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(() => {
    if (user && user.avatarSkinColor && user.avatarHairColor && user.avatarHair && user.avatarEyes && user.avatarMouth) {
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
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSaveAvatar = async () => {
    if (!user) return;

<<<<<<< HEAD
    // Check if user meets the PP requirements for premium features
    if (totalRequirement > 0 && !canAfford) {
      toast.error(`You need ${totalRequirement} ProvePoints to unlock these premium features. You have ${user.provePoints.toFixed(2)} PP.`);
      return;
    }

    setIsLoading(true);
    try {
      await userAPI.updateAvatar(user.id, {
        avatarSkinColor: avatarConfig.skinColor,
        avatarHairColor: avatarConfig.hairColor,
        avatarHair: avatarConfig.hair,
        avatarEyes: avatarConfig.eyes,
        avatarMouth: avatarConfig.mouth,
        avatarAccessories: avatarConfig.accessories
      });
      
      // Update the user context with new avatar data
      updateUser({
        avatarSkinColor: avatarConfig.skinColor,
        avatarHairColor: avatarConfig.hairColor,
        avatarHair: avatarConfig.hair,
        avatarEyes: avatarConfig.eyes,
        avatarMouth: avatarConfig.mouth,
        avatarAccessories: avatarConfig.accessories
      });
      
      toast.success('Avatar updated successfully!');
      // Stay in the shop instead of navigating away
=======
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/auth/update-avatar', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          avatarSkinColor: avatarConfig.skinColor,
          avatarHairColor: avatarConfig.hairColor,
          avatarHair: avatarConfig.hair,
          avatarEyes: avatarConfig.eyes,
          avatarMouth: avatarConfig.mouth,
          avatarAccessories: avatarConfig.accessories,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update avatar');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      toast.success('Avatar updated successfully!');
      navigate('/profile');
>>>>>>> 082367f (Article readibility improvement)
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatarConfig = (key: keyof AvatarConfig, value: string) => {
    setAvatarConfig(prev => ({ ...prev, [key]: value }));
  };

<<<<<<< HEAD
  // Check if user has premium features
  const hasPremiumHair = user?.avatarHair && user.avatarHair !== 'shortHair'; // shortHair is default
  const hasPremiumEyes = user?.avatarEyes && user.avatarEyes !== 'normal'; // normal is default
  const hasPremiumMouth = user?.avatarMouth && user.avatarMouth !== 'teethSmile'; // teethSmile is default
  const hasPremiumAccessories = user?.avatarAccessories && user.avatarAccessories !== 'none'; // none is default

  // Calculate total PP requirement for premium features
  const calculateRequirement = () => {
    let requirement = 0;
    
    // Hair style requirement (if selecting premium hair and user doesn't already have premium hair access)
    if (avatarConfig.hair !== user?.avatarHair && !hasPremiumHair && avatarConfig.hair !== 'shortHair') {
      requirement += AVATAR_REQUIREMENTS.hairStyle;
    }
    
    // Eyes requirement (if selecting premium eyes and user doesn't already have premium eyes access)
    if (avatarConfig.eyes !== user?.avatarEyes && !hasPremiumEyes && avatarConfig.eyes !== 'normal') {
      requirement += AVATAR_REQUIREMENTS.eyes;
    }
    
    // Mouth requirement (if selecting premium mouth and user doesn't already have premium mouth access)
    if (avatarConfig.mouth !== user?.avatarMouth && !hasPremiumMouth && avatarConfig.mouth !== 'teethSmile') {
      requirement += AVATAR_REQUIREMENTS.mouth;
    }
    
    // Accessories requirement (if selecting premium accessories and user doesn't already have premium accessories access)
    if (avatarConfig.accessories !== user?.avatarAccessories && !hasPremiumAccessories && avatarConfig.accessories !== 'none') {
      requirement += AVATAR_REQUIREMENTS.accessories;
    }
    
    return requirement;
  };

  const totalRequirement = calculateRequirement();
  const canAfford = (user?.provePoints || 0) >= totalRequirement;

  // Check if an option is premium
  const isPremiumOption = (category: string, value: string) => {
    switch (category) {
      case 'hair':
        return value !== 'shortHair';
      case 'eyes':
        return value !== 'normal';
      case 'mouth':
        return value !== 'teethSmile';
      case 'accessories':
        return value !== 'none';
      default:
        return false;
    }
  };

  // Check if user already owns a premium option
  const ownsOption = (category: string, value: string) => {
    switch (category) {
      case 'hair':
        return hasPremiumHair && user?.avatarHair === value;
      case 'eyes':
        return hasPremiumEyes && user?.avatarEyes === value;
      case 'mouth':
        return hasPremiumMouth && user?.avatarMouth === value;
      case 'accessories':
        return hasPremiumAccessories && user?.avatarAccessories === value;
      default:
        return false;
    }
  };

=======
>>>>>>> 082367f (Article readibility improvement)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-white mb-1">Avatar Editor</h1>
          <p className="text-slate-300">Customize your avatar appearance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Avatar Preview */}
          <div className="glass-card p-6 text-center flex flex-col justify-center">
            <h2 className="text-xl font-bold text-white mb-4">Preview</h2>
            <div className="flex justify-center mb-4">
              <Avatar config={avatarConfig} size={180} />
            </div>
            <p className="text-slate-300 text-sm">
              Your avatar appearance
            </p>
          </div>

          {/* Customization Tabs */}
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Customization</h2>
            
            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-1 mb-6 bg-slate-800/50 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('skinColor')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'skinColor'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Skin Color
              </button>
              <button
                onClick={() => setActiveTab('hairColor')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'hairColor'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Hair Color
              </button>
              <button
                onClick={() => setActiveTab('hairStyle')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'hairStyle'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Hair Style
              </button>
              <button
                onClick={() => setActiveTab('eyes')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'eyes'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Eyes
              </button>
              <button
                onClick={() => setActiveTab('mouth')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'mouth'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Mouth
              </button>
              <button
                onClick={() => setActiveTab('accessories')}
                className={`px-2 py-2 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'accessories'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Accessories
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {/* Skin Color Tab */}
              {activeTab === 'skinColor' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Skin Color</label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.skinColor.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('skinColor', option.value)}
                          className={`w-16 h-16 rounded-full border-3 transition-all flex flex-col items-center justify-center ${
                            avatarConfig.skinColor === option.value
                              ? 'border-white scale-110 shadow-xl'
                              : 'border-slate-500 hover:border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: option.color }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hair Color Tab */}
              {activeTab === 'hairColor' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Hair Color</label>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATAR_OPTIONS.hairColor.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('hairColor', option.value)}
                          className={`w-16 h-16 rounded-full border-3 transition-all ${
                            avatarConfig.hairColor === option.value
                              ? 'border-white scale-110 shadow-xl'
                              : 'border-slate-500 hover:border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: option.color }}
                          title={option.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hair Style Tab */}
              {activeTab === 'hairStyle' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Hair Style</label>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
<<<<<<< HEAD
                      {AVATAR_OPTIONS.hair.map((option) => {
                        const isPremium = isPremiumOption('hair', option.value);
                        const isOwned = ownsOption('hair', option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => updateAvatarConfig('hair', option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${
                              avatarConfig.hair === option.value
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } ${isPremium && !isOwned ? 'border border-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {isPremium && !isOwned && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-yellow-400">{AVATAR_REQUIREMENTS.hairStyle} PP</span>
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
=======
                      {AVATAR_OPTIONS.hair.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('hair', option.value)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            avatarConfig.hair === option.value
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
>>>>>>> 082367f (Article readibility improvement)
                    </div>
                  </div>
                </div>
              )}

              {/* Eyes Tab */}
              {activeTab === 'eyes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Eyes</label>
                    <div className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
                      {AVATAR_OPTIONS.eyes.map((option) => {
                        const isPremium = isPremiumOption('eyes', option.value);
                        const isOwned = ownsOption('eyes', option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => updateAvatarConfig('eyes', option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${
                              avatarConfig.eyes === option.value
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } ${isPremium && !isOwned ? 'border border-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {isPremium && !isOwned && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-yellow-400">{AVATAR_REQUIREMENTS.eyes} PP</span>
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
=======
                      {AVATAR_OPTIONS.eyes.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('eyes', option.value)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            avatarConfig.eyes === option.value
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
>>>>>>> 082367f (Article readibility improvement)
                    </div>
                  </div>
                </div>
              )}

              {/* Mouth Tab */}
              {activeTab === 'mouth' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Mouth</label>
                    <div className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
                      {AVATAR_OPTIONS.mouth.map((option) => {
                        const isPremium = isPremiumOption('mouth', option.value);
                        const isOwned = ownsOption('mouth', option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => updateAvatarConfig('mouth', option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${
                              avatarConfig.mouth === option.value
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } ${isPremium && !isOwned ? 'border border-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {isPremium && !isOwned && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-yellow-400">{AVATAR_REQUIREMENTS.mouth} PP</span>
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
=======
                      {AVATAR_OPTIONS.mouth.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('mouth', option.value)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            avatarConfig.mouth === option.value
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
>>>>>>> 082367f (Article readibility improvement)
                    </div>
                  </div>
                </div>
              )}

              {/* Accessories Tab */}
              {activeTab === 'accessories' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">Accessories</label>
                    <div className="grid grid-cols-2 gap-2">
<<<<<<< HEAD
                      {AVATAR_OPTIONS.accessories.map((option) => {
                        const isPremium = isPremiumOption('accessories', option.value);
                        const isOwned = ownsOption('accessories', option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => updateAvatarConfig('accessories', option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${
                              avatarConfig.accessories === option.value
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } ${isPremium && !isOwned ? 'border border-yellow-500/50' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{option.label}</span>
                              {isPremium && !isOwned && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-yellow-400">{AVATAR_REQUIREMENTS.accessories} PP</span>
                                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
=======
                      {AVATAR_OPTIONS.accessories.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => updateAvatarConfig('accessories', option.value)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            avatarConfig.accessories === option.value
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
>>>>>>> 082367f (Article readibility improvement)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
<<<<<<< HEAD
        <div className="text-center mt-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAvatar}
              disabled={isLoading || (totalRequirement > 0 && !canAfford)}
              className={`px-6 py-2 font-medium rounded-lg transition-all disabled:cursor-not-allowed ${
                isLoading || (totalRequirement > 0 && !canAfford)
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {isLoading ? 'Saving...' : totalRequirement > 0 ? `Save Avatar (Requires ${totalRequirement} PP)` : 'Save Avatar'}
            </button>
          </div>
=======
        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAvatar}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Avatar'}
          </button>
>>>>>>> 082367f (Article readibility improvement)
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorPage;
