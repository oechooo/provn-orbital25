import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ArticleCreationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    urlToImage: '',
    category: 'general'
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health' },
    { value: 'science', label: 'Science' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/articles/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create article';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use status text or default message
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success('Article created successfully!');
      
      // Navigate to the created article
      navigate(`/article/${data.article.id}`);
      
    } catch (error: any) {
      console.error('Error creating article:', error);
      toast.error(error.message || 'Failed to create article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create a Post</h1>
          <p className="text-slate-300">Share your news story and let the community predict its accuracy</p>
        </div>

        {/* Main Form Card */}
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-200 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a descriptive title..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                maxLength={200}
                required
              />
              <div className="text-xs text-slate-400 mt-1">
                {formData.title.length}/200 characters
              </div>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-slate-200 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write the article content here..."
                rows={8}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-vertical"
                maxLength={2000}
              />
              <div className="text-xs text-slate-400 mt-1">
                {formData.content.length}/2000 characters
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="urlToImage" className="block text-sm font-medium text-slate-200 mb-2">
                Image URL (optional)
              </label>
              <input
                type="url"
                id="urlToImage"
                name="urlToImage"
                value={formData.urlToImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-200 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value} className="bg-slate-800">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 text-slate-300 hover:text-white transition-colors duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.title.trim()}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Post'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Guidelines Card */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Posting Guidelines</h2>
          <div className="space-y-3 text-slate-300">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Create original news content or share factual information</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Ensure your content contains verifiable claims that can be fact-checked</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Use descriptive titles that accurately represent your content</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
              <p>Provide detailed, well-structured content to help community assessment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCreationPage;
