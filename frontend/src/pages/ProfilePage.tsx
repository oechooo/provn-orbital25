import React, { useState } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  if (!user) return null;
  const handleSave = async () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-outline-primary"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.provePoints.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Prove Points</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Correct Predictions</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Total Stakes</div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="form-control"
                    />
                  ) : (
                    <div className="py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                      {user.username}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-control"
                    />
                  ) : (
                    <div className="py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                      {user.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="text-center text-gray-500 py-8">
              <p>No recent activity to display.</p>
              <p className="text-sm mt-2">Start making predictions to see your activity here!</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
