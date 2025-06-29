import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import Avatar from '../components/Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatar';
import toast from 'react-hot-toast';

const AvatarEditorPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  // Avatar customization options
  const skinColors = ['#FBD5AB', '#F7C794', '#E8AC65', '#D18B47', '#B76E3C', '#8B4513'];
  const hairColors = ['#2C1B18', '#724C34', '#8B4513', '#D2691E', '#DEB887', '#F0E68C', '#FF6347', '#8A2BE2'];
  const hairStyles = ['short', 'long', 'curly', 'buzz', 'ponytail', 'bald'];
  const eyeStyles = ['normal', 'wide', 'sleepy', 'wink', 'glasses'];
  const mouthStyles = ['smile', 'neutral', 'frown', 'laugh', 'surprised'];
  const accessories = ['none', 'hat', 'headband', 'sunglasses'];

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Avatar Editor</h1>
          <p className="text-slate-300 text-lg">Customize your avatar appearance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Preview */}
          <div className="glass-card p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>
            <div className="flex justify-center mb-6">
              <Avatar config={avatarConfig} size={200} />
            </div>
            <p className="text-slate-300 text-sm">
              This is how your avatar will appear across the platform
            </p>
          </div>

          {/* Customization Options */}
          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Customization</h2>
            
            <div className="space-y-6">
              {/* Skin Color */}
              <div>
                <label className="block text-white font-medium mb-3">Skin Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {skinColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateAvatarConfig('skinColor', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        avatarConfig.skinColor === color
                          ? 'border-white scale-110'
                          : 'border-slate-500 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-white font-medium mb-3">Hair Color</label>
                <div className="grid grid-cols-8 gap-2">
                  {hairColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateAvatarConfig('hairColor', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        avatarConfig.hairColor === color
                          ? 'border-white scale-110'
                          : 'border-slate-500 hover:border-slate-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Style */}
              <div>
                <label className="block text-white font-medium mb-3">Hair Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {hairStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => updateAvatarConfig('hair', style)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        avatarConfig.hair === style
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eyes */}
              <div>
                <label className="block text-white font-medium mb-3">Eyes</label>
                <div className="grid grid-cols-3 gap-2">
                  {eyeStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => updateAvatarConfig('eyes', style)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        avatarConfig.eyes === style
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouth */}
              <div>
                <label className="block text-white font-medium mb-3">Mouth</label>
                <div className="grid grid-cols-3 gap-2">
                  {mouthStyles.map((style) => (
                    <button
                      key={style}
                      onClick={() => updateAvatarConfig('mouth', style)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        avatarConfig.mouth === style
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-white font-medium mb-3">Accessories</label>
                <div className="grid grid-cols-2 gap-2">
                  {accessories.map((accessory) => (
                    <button
                      key={accessory}
                      onClick={() => updateAvatarConfig('accessories', accessory)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        avatarConfig.accessories === accessory
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {accessory}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAvatar}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditorPage;
