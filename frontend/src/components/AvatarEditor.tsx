// src/components/AvatarEditor.tsx
import React, { useState } from 'react';
import { AvatarConfig, AVATAR_OPTIONS } from '../utils/avatar';
import Avatar from './Avatar';

interface AvatarEditorProps {
  initialConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AvatarEditor: React.FC<AvatarEditorProps> = ({
  initialConfig,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);

  const handleConfigChange = (field: keyof AvatarConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Customize Your Avatar
          </h2>

          {/* Avatar Preview */}
          <div className="flex justify-center mb-8">
            <Avatar config={config} size={120} />
          </div>

          {/* Skin Color */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Skin Color</label>
            <div className="grid grid-cols-5 gap-2">
              {AVATAR_OPTIONS.skinColor.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('skinColor', option.value)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    config.skinColor === option.value
                      ? 'border-white shadow-lg scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Hair Color</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.hairColor.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('hairColor', option.value)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    config.hairColor === option.value
                      ? 'border-white shadow-lg scale-110'
                      : 'border-white/30 hover:border-white/60'
                  }`}
                  style={{ backgroundColor: option.color }}
                  title={option.label}
                />
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Hair Style</label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.hair.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('hair', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    config.hair === option.value
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/30 text-white/70 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Eyes</label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.eyes.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('eyes', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    config.eyes === option.value
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/30 text-white/70 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mouth */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Mouth</label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.mouth.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('mouth', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    config.mouth === option.value
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/30 text-white/70 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories */}
          <div className="mb-8">
            <label className="block text-white font-medium mb-3">Accessories</label>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_OPTIONS.accessories.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleConfigChange('accessories', option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    config.accessories === option.value
                      ? 'bg-white/20 border-white text-white'
                      : 'bg-white/5 border-white/30 text-white/70 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;
