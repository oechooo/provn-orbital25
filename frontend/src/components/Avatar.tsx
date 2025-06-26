// src/components/Avatar.tsx
import React from 'react';
import { generateAvatarUrl, type AvatarConfig } from '../utils/avatar';

interface AvatarProps {
  config?: AvatarConfig;
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({ 
  config, 
  size = 64, 
  className = '',
  onClick 
}) => {
  const avatarUrl = generateAvatarUrl(config);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Avatar image failed to load:', avatarUrl);
    // Fallback to a default avatar URL
    const fallbackUrl = generateAvatarUrl(undefined);
    (e.target as HTMLImageElement).src = fallbackUrl;
  };

  return (
    <div 
      className={`rounded-full overflow-hidden border-2 border-white/20 ${onClick ? 'cursor-pointer hover:border-white/40 transition-all' : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <img 
        src={avatarUrl}
        alt="Avatar"
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  );
};

export default Avatar;
