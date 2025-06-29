import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

interface Article {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  sourceName: string;
  author: string | null;
  publishedAt: string;
  category: string | null;
}

interface Market {
  id: number;
  articleId: number;
  outcome: boolean | null;
  sharesTrue: number;
  sharesFalse: number;
  probTrue: number;
  probFalse: number;
  createdAt: string;
  article: Article;
  stakes: any[];
}

interface ForumReply {
  id: number;
  content: string;
  author: string;
  authorId: number;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
}

interface ForumPost {
  id: number;
  content: string;
  author: string;
  authorId: number;
  stakeAmount: number;
  createdAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  replies: ForumReply[];
}

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [prediction, setPrediction] = useState<boolean>(true);
  const [placing, setPlacing] = useState(false);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [newReply, setNewReply] = useState('');

  // Placeholder forum data
  useEffect(() => {
    const placeholderPosts: ForumPost[] = [
      {
        id: 1,
        content: "test post",
        author: "placeholder1",
        authorId: 1,
        stakeAmount: 25.00,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        likes: 12,
        dislikes: 3,
        userVote: null,
        replies: [
          {
            id: 1,
            content: "test reply",
            author: "placeholder2",
            authorId: 2,
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            likes: 5,
            dislikes: 0,
            userVote: null
          },
          {
            id: 2,
            content: "test reply",
            author: "placeholder3",
            authorId: 3,
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
            likes: 3,
            dislikes: 1,
            userVote: null
          }
        ]
      },
      {
        id: 2,
        content: "test post",
        author: "placeholder4",
        authorId: 4,
        stakeAmount: 15.00,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        likes: 8,
        dislikes: 7,
        userVote: null,
        replies: [
          {
            id: 3,
            content: "test reply",
            author: "placeholder5",
            authorId: 5,
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
            likes: 6,
            dislikes: 1,
            userVote: null
          }
        ]
      },
      {
        id: 3,
        content: "test post",
        author: "placeholder6",
        authorId: 6,
        stakeAmount: 9.00,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        likes: 4,
        dislikes: 2,
        userVote: null,
        replies: []
      }
    ];
    setForumPosts(placeholderPosts);
  }, []);

  useEffect(() => {
    if (id) {
      fetchMarketData(parseInt(id));
    }
  }, [id]);

  const fetchMarketData = async (marketId: number) => {
    try {
      setLoading(true);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`http://localhost:3000/api/markets/${marketId}`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.market) {
        setMarket(data.market);
      } else {
        throw new Error('No market data in response');
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Request timed out. Please try again.');
        } else {
          toast.error(`Failed to load article: ${error.message}`);
        }
      } else {
        toast.error('Failed to load article details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceStake = async () => {
    if (!user || !market) {
      toast.error('Please log in to place a stake');
      return;
    }

    if (stakeAmount <= 0) {
      toast.error('Stake amount must be greater than 0');
      return;
    }

    if (stakeAmount > user.provePoints) {
      toast.error('Insufficient ProvePoints');
      return;
    }

    setPlacing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          marketId: market.id,
          stakeAmount,
          prediction
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to place stake' }));
        throw new Error(errorData.message || 'Failed to place stake');
      }
      
      toast.success(`Stake placed successfully! You predicted: ${prediction ? 'TRUE' : 'FALSE'}`);
      
      // Refresh market data
      await fetchMarketData(market.id);
      
      // Reset form
      setStakeAmount(10);
    } catch (error: any) {
      toast.error(error.message || 'Failed to place stake');
    } finally {
      setPlacing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now.getTime() - published.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const handleVote = (postId: number, voteType: 'like' | 'dislike', isReply: boolean = false, replyId?: number) => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    setForumPosts(prev => prev.map(post => {
      if (post.id === postId && !isReply) {
        const currentVote = post.userVote;
        const newVote = currentVote === voteType ? null : voteType;
        
        let newLikes = post.likes;
        let newDislikes = post.dislikes;
        
        // Remove previous vote
        if (currentVote === 'like') newLikes--;
        if (currentVote === 'dislike') newDislikes--;
        
        // Add new vote
        if (newVote === 'like') newLikes++;
        if (newVote === 'dislike') newDislikes++;
        
        return { ...post, likes: newLikes, dislikes: newDislikes, userVote: newVote };
      }
      
      if (isReply && replyId) {
        return {
          ...post,
          replies: post.replies.map(reply => {
            if (reply.id === replyId) {
              const currentVote = reply.userVote;
              const newVote = currentVote === voteType ? null : voteType;
              
              let newLikes = reply.likes;
              let newDislikes = reply.dislikes;
              
              // Remove previous vote
              if (currentVote === 'like') newLikes--;
              if (currentVote === 'dislike') newDislikes--;
              
              // Add new vote
              if (newVote === 'like') newLikes++;
              if (newVote === 'dislike') newDislikes++;
              
              return { ...reply, likes: newLikes, dislikes: newDislikes, userVote: newVote };
            }
            return reply;
          })
        };
      }
      
      return post;
    }));
  };

  const handleSubmitPost = () => {
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }
    
    if (!newPost.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const userStake = market?.stakes.find(stake => stake.userId === user.id);
    const stakeAmount = userStake ? userStake.amount : 0;

    const newForumPost: ForumPost = {
      id: Date.now(),
      content: newPost.trim(),
      author: user.username,
      authorId: user.id,
      stakeAmount: stakeAmount,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      userVote: null,
      replies: []
    };

    setForumPosts(prev => [newForumPost, ...prev]);
    setNewPost('');
    toast.success('Post added successfully!');
  };

  const handleSubmitReply = (postId: number) => {
    if (!user) {
      toast.error('Please sign in to reply');
      return;
    }
    
    if (!newReply.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    const newForumReply: ForumReply = {
      id: Date.now(),
      content: newReply.trim(),
      author: user.username,
      authorId: user.id,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      userVote: null
    };

    setForumPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, replies: [...post.replies, newForumReply] }
        : post
    ));
    
    setNewReply('');
    setReplyingTo(null);
    toast.success('Reply added successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card p-8 animate-pulse">
            <div className="h-8 bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-700 rounded mb-4"></div>
            <div className="h-64 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-slate-300 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/dashboard" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { article } = market;
  const totalStakes = market.stakes.length;
  const totalVolume = market.stakes.reduce((sum, stake) => sum + stake.stakeAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8">
              
              {/* Article Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {article.category || 'News'}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {getTimeSince(article.publishedAt)}
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {article.title}
                </h1>
                
                <div className="flex items-center gap-4 text-slate-300 text-sm mb-6">
                  <span className="font-medium">{article.sourceName}</span>
                  {article.author && (
                    <>
                      <span>•</span>
                      <span>By {article.author}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>

              {/* Article Image */}
              {article.urlToImage && (
                <div className="mb-6">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Article Description */}
              {article.description && (
                <div className="mb-6">
                  <p className="text-xl text-white leading-relaxed font-medium">
                    {article.description}
                  </p>
                </div>
              )}

              {/* Article Content */}
              {article.content && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3">Article Preview</h3>
                  <div className="bg-slate-800/50 rounded-lg p-6 border-l-4 border-purple-500">
                    <p className="text-white leading-relaxed whitespace-pre-line text-lg">
                      {article.content.replace(/\s*\[\+\d+\s+chars?\]$/, '')}
                    </p>
                    {article.content.includes('[+') && (
                      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                        <p className="text-blue-300 text-sm">
                          📖 This is a preview. Click "Read Full Article" below to see the complete story.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Read Full Article */}
              <div className="border-t border-slate-700 pt-6">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Read Full Article at {article.sourceName}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Market Information Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-6">
              
              {/* Market Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Prediction Market</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    market.outcome === null ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                  }`}>
                    {market.outcome === null ? 'Active' : 'Resolved'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  What do you think about this story's truthfulness?
                </p>
              </div>

              {/* Current Odds */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Current Odds</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-green-600/20 border border-green-600/30 rounded-lg p-3">
                    <span className="text-green-400 font-medium">TRUE</span>
                    <span className="text-white font-bold">{(market.probTrue * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-600/20 border border-red-600/30 rounded-lg p-3">
                    <span className="text-red-400 font-medium">FALSE</span>
                    <span className="text-white font-bold">{(market.probFalse * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Market Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Stakes:</span>
                    <span className="text-white">{totalStakes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volume:</span>
                    <span className="text-white">{totalVolume.toFixed(2)} PP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-white">{getTimeSince(market.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Place Stake */}
              {user && market.outcome === null ? (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">Place Your Stake</h4>
                  
                  {/* Prediction Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm text-slate-300">Your Prediction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPrediction(true)}
                        className={`p-3 rounded-lg border transition-all ${
                          prediction
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'border-slate-600 text-slate-300 hover:border-green-500'
                        }`}
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => setPrediction(false)}
                        className={`p-3 rounded-lg border transition-all ${
                          !prediction
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'border-slate-600 text-slate-300 hover:border-red-500'
                        }`}
                      >
                        FALSE
                      </button>
                    </div>
                  </div>

                  {/* Stake Amount */}
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      Stake Amount (Available: {user.provePoints.toFixed(2)} PP)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={user.provePoints}
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Place Stake Button */}
                  <button
                    onClick={handlePlaceStake}
                    disabled={placing || stakeAmount <= 0 || stakeAmount > user.provePoints}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                  >
                    {placing ? 'Placing...' : `Stake ${stakeAmount.toFixed(2)} PP on ${prediction ? 'TRUE' : 'FALSE'}`}
                  </button>
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">Sign in to place stakes</p>
                  <Link 
                    to="/login" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <p>This market has been resolved</p>
                  {market.outcome !== null && (
                    <p className="mt-2 font-semibold">
                      Result: <span className={market.outcome ? 'text-green-400' : 'text-red-400'}>
                        {market.outcome ? 'TRUE' : 'FALSE'}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Forum Section */}
        <div className="mt-8">
          <div className="glass-card p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Discussion Forum</h3>
            
            {/* New Post Form */}
            {user && (
              <div className="mb-8 bg-slate-800/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Share your thoughts</h4>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What do you think about this article? Share your analysis..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="text-sm text-slate-400">
                    {user.provePoints > 0 && market?.stakes.find(stake => stake.userId === user.id) && (
                      <span>Your stake: {market.stakes.find(stake => stake.userId === user.id)?.amount.toFixed(2)} PP</span>
                    )}
                  </div>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!newPost.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="mb-8 bg-slate-800/50 rounded-lg p-4 text-center">
                <p className="text-slate-400 mb-3">Sign in to join the discussion</p>
                <Link 
                  to="/login" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Forum Posts */}
            <div className="space-y-6">
              {forumPosts.map((post) => (
                <div key={post.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{post.author[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <h5 className="text-white font-medium">{post.author}</h5>
                        <div className="text-xs text-slate-400">
                          <span>{getTimeSince(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {post.stakeAmount > 0 && (
                      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg px-3 py-1">
                        <div className="text-xs text-purple-300 font-medium">Staked</div>
                        <div className="text-sm text-purple-100 font-bold">{post.stakeAmount.toFixed(2)} PP</div>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <p className="text-slate-200 mb-4 leading-relaxed">{post.content}</p>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleVote(post.id, 'like')}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          post.userVote === 'like' 
                            ? 'text-green-400' 
                            : 'text-slate-400 hover:text-green-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                        </svg>
                        <span>{post.likes}</span>
                      </button>
                      <button
                        onClick={() => handleVote(post.id, 'dislike')}
                        className={`flex items-center space-x-1 text-sm transition-colors ${
                          post.userVote === 'dislike' 
                            ? 'text-red-400' 
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
                        </svg>
                        <span>{post.dislikes}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        className="text-sm text-slate-400 hover:text-purple-400 transition-colors"
                      >
                        Reply ({post.replies.length})
                      </button>
                    </div>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === post.id && user && (
                    <div className="mt-4 pl-8 border-l-2 border-purple-500">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-sm text-slate-400 hover:text-slate-300 px-3 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitReply(post.id)}
                          disabled={!newReply.trim()}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded transition-colors disabled:cursor-not-allowed"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {post.replies.length > 0 && (
                    <div className="mt-4 pl-8 border-l-2 border-slate-600 space-y-3">
                      {post.replies.map((reply) => (
                        <div key={reply.id} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{reply.author[0].toUpperCase()}</span>
                            </div>
                            <div>
                              <span className="text-white text-sm font-medium">{reply.author}</span>
                              <span className="text-xs text-slate-400 ml-2">{getTimeSince(reply.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-slate-200 text-sm mb-2">{reply.content}</p>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleVote(post.id, 'like', true, reply.id)}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                reply.userVote === 'like' 
                                  ? 'text-green-400' 
                                  : 'text-slate-400 hover:text-green-400'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                              </svg>
                              <span>{reply.likes}</span>
                            </button>
                            <button
                              onClick={() => handleVote(post.id, 'dislike', true, reply.id)}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                reply.userVote === 'dislike' 
                                  ? 'text-red-400' 
                                  : 'text-slate-400 hover:text-red-400'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
                              </svg>
                              <span>{reply.dislikes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {forumPosts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">No discussions yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
