import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
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
              <Link 
                to="/dashboard" 
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive('/dashboard') 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Markets
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                    <span className="text-sm font-medium text-white">
                      {user.username}
                    </span>
                    <span className="text-xs text-cyan-300 ml-2">
                      {user.provePoints} pts
                    </span>
                  </div>
                  <Link 
                    to="/profile" 
                    className="text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/10 text-sm font-medium transition-all duration-300"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    Logout
                  </button>
                </div>
              </div>
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
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 inline-flex items-center justify-center p-2 rounded-xl text-white hover:bg-white/20 focus:outline-none transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>      {isMenuOpen && (
        <div className="sm:hidden bg-white/10 backdrop-blur-lg border-t border-white/20">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className={`block mx-4 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/news" 
              className={`block mx-4 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                isActive('/news') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              News
            </Link>
            <Link 
              to="/dashboard" 
              className={`block mx-4 px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 ${
                isActive('/dashboard') 
                  ? 'bg-white/20 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Markets
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-white/20">
            {user ? (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <div className="text-base font-bold text-white">{user.username}</div>
                    <div className="text-sm text-cyan-300">{user.provePoints} points</div>
                  </div>
                </div>
                <Link 
                  to="/profile" 
                  className="block mx-4 px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left mx-4 px-4 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link 
                  to="/login" 
                  className="block mx-4 px-4 py-3 rounded-xl text-base font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block mx-4 px-4 py-3 rounded-xl text-base font-bold bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
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