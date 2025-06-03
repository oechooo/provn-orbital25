import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your Provn.io dashboard</p>
        </div>

        {user ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome back, {user.username}!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl mb-2">👤</div>
                <h3 className="font-semibold text-gray-900">Profile</h3>
                <p className="text-gray-600">Manage your account</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900">Analytics</h3>
                <p className="text-gray-600">View your activity</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">Customize your experience</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Please log in to access your dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to get started with Provn.io
            </p>
            <div className="space-x-4">
              <a
                href="/login"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition duration-200"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
