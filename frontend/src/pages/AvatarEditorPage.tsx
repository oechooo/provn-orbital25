import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import Avatar from '../components/Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG, AVATAR_OPTIONS } from '../utils/avatar';
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
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
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorPage;
