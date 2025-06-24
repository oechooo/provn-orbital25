import React, { useState, useEffect } from 'react';
import { articleAPI } from '../services/api';
import { useAuth } from '../contexts/SimpleAuthContext';
import ArticleCard from '../components/ArticleCard';

interface Article {
  id: number;
  title: string;
  summary: string | null;
  author: string | null;
  url: string;
  imageUrl: string | null;
  category: string | null;
  publishedAt: string;
  market?: {
    id: number;
    totalStake: number;
    yesStake: number;
    noStake: number;
    isResolved: boolean;
    outcome: boolean | null;
  };
}

const NewsPage: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'publishedAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [filters]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await articleAPI.getArticles(filters);
      setArticles(response.articles);
      setError(null);
    } catch (err) {
      setError('Failed to fetch articles');
      console.error('Fetch articles error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await articleAPI.getCategories();
      setCategories(response.categories);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const handleRefresh = async () => {
    if (!user) {
      alert('Please log in to refresh articles');
      return;
    }
    
    try {
      await articleAPI.refreshArticles();
      alert('Article refresh initiated. New articles will appear shortly.');
      setTimeout(() => fetchArticles(), 3000);
    } catch (err) {
      alert('Failed to refresh articles');
      console.error('Refresh error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateMarketConfidence = (market: Article['market']) => {
    if (!market || market.totalStake === 0) return 50;
    return Math.round((market.yesStake / market.totalStake) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-400 mx-auto"></div>
          <p className="mt-6 text-slate-300 text-lg">Loading news articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="glass-card mx-4 mt-4 sm:mx-6 lg:mx-8">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-text">
                  News & Markets
                </h1>
                <p className="mt-2 text-slate-300 text-lg">Latest news with prediction markets</p>
              </div>
              {user && (
                <button
                  onClick={handleRefresh}
                  className="mt-6 sm:mt-0 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-purple-400 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 shadow-lg hover:shadow-cyan-500/25"
                >
                  Refresh Articles
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search articles..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="" className="bg-slate-800">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-slate-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Sort By
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                  }}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="publishedAt-desc" className="bg-slate-800">Newest First</option>
                  <option value="publishedAt-asc" className="bg-slate-800">Oldest First</option>
                  <option value="title-asc" className="bg-slate-800">Title A-Z</option>
                  <option value="title-desc" className="bg-slate-800">Title Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-card border border-red-500/30 p-4 mb-6">
              <p className="text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Articles Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const confidence = calculateMarketConfidence(article.market);
              
              return (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  source={article.author || 'Unknown Source'}
                  excerpt={article.summary || 'No summary available'}
                  confidence={confidence}
                  date={formatDate(article.publishedAt)}
                  imageUrl={article.imageUrl || undefined}
                />
              );
            })}
          </div>

          {articles.length === 0 && !loading && (
            <div className="glass-card text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-slate-300 text-xl font-semibold mb-2">No articles found</p>
              <p className="text-slate-400">Try adjusting your search filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
