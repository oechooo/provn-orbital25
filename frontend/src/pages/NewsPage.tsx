import React, { useState, useEffect, useMemo } from 'react';
import { articleAPI } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import type { ArticleWithMarket } from '../../../shared/types';

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleWithMarket[]>([]);
  const [allArticles, setAllArticles] = useState<ArticleWithMarket[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'new',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  // Helper function to capitalize first letter of each word
  const capitalizeCategory = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Semantic search function
  const keywordSearch = (articles: ArticleWithMarket[], searchTerm: string): ArticleWithMarket[] => {
    if (!searchTerm.trim()) return articles;
    
    const searchWords = searchTerm.toLowerCase().split(' ').filter(word => word.length > 0);
    
    return articles.filter(article => {
      const searchableText = [
        article.title,
        article.description || '',
        article.category || '',
        article.sourceName || '',
        article.author || ''
      ].join(' ').toLowerCase();
      
      // Check if all search words are found in the article
      return searchWords.every(word => searchableText.includes(word));
    });
  };

  // Filter and sort articles locally
  const getFilteredArticles = (): ArticleWithMarket[] => {
    let filtered = [...allArticles];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(article => article.category === filters.category);
    }

    // Apply semantic search
    if (filters.search) {
      filtered = keywordSearch(filtered, filters.search);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (filters.sortBy) {
        case 'new':
          aValue = new Date(a.publishedAt).getTime();
          bValue = new Date(b.publishedAt).getTime();
          return bValue - aValue; // Newest first
        
        case 'trending':
          // Use probability volatility and recency as proxy for trending
          const aRecency = (Date.now() - new Date(a.publishedAt).getTime()) / (1000 * 60 * 60); // Hours ago
          const bRecency = (Date.now() - new Date(b.publishedAt).getTime()) / (1000 * 60 * 60);
          const aVolatility = Math.abs((a.market?.probTrue || 0.5) - 0.5);
          const bVolatility = Math.abs((b.market?.probTrue || 0.5) - 0.5);
          
          // Combine recency and volatility (more weight to recent + volatile markets)
          aValue = (aVolatility * 100) / Math.max(1, aRecency / 24); // Boost recent articles
          bValue = (bVolatility * 100) / Math.max(1, bRecency / 24);
          return bValue - aValue; // Higher trending score first
        
        case 'trusted':
          aValue = a.market?.probTrue || 0;
          bValue = b.market?.probTrue || 0;
          return bValue - aValue; // Highest probTrue first
        
        case 'contentious':
          aValue = Math.abs((a.market?.probTrue || 0.5) - 0.5);
          bValue = Math.abs((b.market?.probTrue || 0.5) - 0.5);
          return aValue - bValue; // Closest to 0.5 first
        
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'publishedAt':
        default:
          aValue = new Date(a.publishedAt).getTime();
          bValue = new Date(b.publishedAt).getTime();
          break;
      }
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []); // Only fetch once on mount

  // Update filtered articles when filters change
  const filteredArticles = useMemo(() => {
    if (allArticles.length === 0) return [];
    return getFilteredArticles();
  }, [filters, allArticles]);

  useEffect(() => {
    setArticles(filteredArticles);
  }, [filteredArticles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      // Fetch all articles without filters to enable client-side search
      const response = await articleAPI.getArticles();
      console.log('API response:', response);
      setAllArticles(response.articles);
      setArticles(response.articles);
      setError(null);
    } catch (err) {
      setError('Failed to fetch articles');
      console.error('Fetch articles error:', err);
      alert(JSON.stringify(err));
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

      <div className="relative z-10">
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
                      {capitalizeCategory(category)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400 transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="new" className="bg-slate-800">New</option>
                  <option value="trending" className="bg-slate-800">Trending</option>
                  <option value="trusted" className="bg-slate-800">Trusted</option>
                  <option value="contentious" className="bg-slate-800">Contentious</option>
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

          {/* Articles Feed - Reddit-like UI */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 w-full">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  formatDate={formatDate}
                />
              ))}
            </div>
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
