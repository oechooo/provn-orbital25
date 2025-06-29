import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AvatarEditor from '../components/AvatarEditor';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatar';
import toast from 'react-hot-toast';

const AvatarEditorPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleAvatarSave = async (newConfig: AvatarConfig) => {
    setIsLoading(true);
    try {
      await updateUser({
        avatarSkinColor: newConfig.skinColor,
        avatarHairColor: newConfig.hairColor,
        avatarHair: newConfig.hair,
        avatarEyes: newConfig.eyes,
        avatarMouth: newConfig.mouth,
        avatarAccessories: newConfig.accessories
      });
      
      toast.success('Avatar updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              Avatar Shop
            </h1>
            <p className="text-slate-300">
              Customize your avatar to make it uniquely yours
            </p>
          </div>

          <AvatarEditor
            initialConfig={getCurrentAvatarConfig()}
            onSave={handleAvatarSave}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AvatarEditorPage;