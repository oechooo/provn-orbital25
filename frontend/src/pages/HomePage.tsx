import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-10 via-blue-10 to-indigo-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Truth Through
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}Prediction
              </span>
            </h1>
            <p className="text-xl text-gray-900 mb-8 max-w-3xl mx-auto">
              Harness the wisdom of crowds to verify news accuracy. Bet on news outcomes, 
              earn ProvePoints, and help create a more trustworthy information ecosystem.
            </p>
            
            {user ? (
              <div className="space-x-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
                >
                  View Markets
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-300"
                >
                  My Profile
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-300"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Help Verify the News?
          </h2>          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Help create a more trustworthy information ecosystem through prediction markets
          </p>
          {!user && (
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition duration-300"
            >
              Start Predicting Today
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;