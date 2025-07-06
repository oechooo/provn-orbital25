import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();      if (response.ok) {
        toast.success(data.message || 'Password reset email sent successfully!');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
      } else {
        toast.error(data.message || 'An error occurred');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                <p>{message}</p>
                {resetToken && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800 font-medium">
                      Demo Mode: Use this reset token
                    </p>
                    <code className="text-xs break-all bg-yellow-100 px-2 py-1 rounded mt-1 block">
                      {resetToken}
                    </code>
                    <Link 
                      to={`/reset-password?token=${resetToken}`}
                      className="text-sm text-blue-600 hover:text-blue-500 mt-2 inline-block"
                    >
                      Go to reset password page →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
