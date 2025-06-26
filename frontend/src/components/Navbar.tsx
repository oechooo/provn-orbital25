import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import Avatar from './Avatar';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from '../utils/avatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Get current avatar config from user or use default
  const getCurrentAvatarConfig = (): AvatarConfig => {
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
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400 transition-all duration-300">
                Provn.io
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/news" 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive('/news') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                News
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 hover:bg-white/20 transition-all duration-300"
              >
                <Avatar 
                  config={getCurrentAvatarConfig()} 
                  size={32} 
                  className="flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {user.username}
                  </span>
                  <span className="text-xs text-cyan-300">
                    {user.provePoints} pts
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 text-sm font-medium transition-all duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/10 backdrop-blur-lg border-t border-white/20">
            <Link 
              to="/" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/news" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                isActive('/news') 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            {user ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Avatar 
                  config={getCurrentAvatarConfig()} 
                  size={24} 
                  className="flex-shrink-0"
                />
                <span>{user.username} ({user.provePoints} pts)</span>
              </Link>
            ) : (
              <div className="space-y-1">
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
