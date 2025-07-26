import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import { commentAPI } from '../services/api';
import Avatar from '../components/Avatar';
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

interface CommentUser {
  id: number;
  username: string;
  avatarSkinColor: string;
  avatarHairColor: string;
  avatarHair: string;
  avatarEyes: string;
  avatarMouth: string;
  avatarAccessories: string;
}

interface ForumReply {
  id: number;
  content: string;
  userId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  user: CommentUser;
  replies?: ForumReply[];
  _count?: {
    replies: number;
  };
}

interface ForumPost {
  id: number;
  content: string;
  articleId: number;
  userId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  user: CommentUser;
  replies: ForumReply[];
  _count?: {
    replies: number;
  };
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
  const [error, setError] = useState<string | null>(null);

  // Load comments from API
  useEffect(() => {
    if (id) {
      fetchComments(parseInt(id));
    }
  }, [id]);

  const fetchComments = async (articleId: number) => {
    try {
      const response = await commentAPI.getCommentsByArticleId(articleId);
      setForumPosts(response.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  useEffect(() => {
    console.log('ArticleDetailPage mounted with ID:', id);
    if (id) {
      fetchArticleData(parseInt(id));
    }
  }, [id]);

  const fetchArticleData = async (articleId: number) => {
    try {
      console.log('Fetching article data for ID:', articleId);
      setLoading(true);
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}`, {
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
      
      console.log('Article data received:', data); // Debug log
      
      if (data && data.article) {
        console.log('Article found:', data.article.title);
        // Check if article has a market
        if (data.article.market) {
          console.log('Market found:', data.article.market.id);
          // Ensure stakes is always an array
          if (!data.article.market.stakes) {
            data.article.market.stakes = [];
          }
          console.log('Stakes array:', data.article.market.stakes); // Debug log
          
          // Create a market object with the article nested inside it
          const marketWithArticle = {
            ...data.article.market,
            article: data.article
          };
          setMarket(marketWithArticle);
        } else {
          console.log('No market found for this article');
          // Article exists but no market yet - create a temporary market structure
          const tempMarket = {
            id: 0,
            articleId: data.article.id,
            outcome: null,
            sharesTrue: 0,
            sharesFalse: 0,
            probTrue: 0.5,
            probFalse: 0.5,
            createdAt: new Date().toISOString(),
            article: data.article,
            stakes: []
          };
          setMarket(tempMarket);
        }
      } else {
        console.error('No article data in response:', data);
        throw new Error('No article data in response');
      }
    } catch (error) {
      console.error('Error fetching article data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to load article: ${errorMessage}`);
      
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
      
      // Refresh article data
      await fetchArticleData(parseInt(id!));
      
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
      minute: '2-digit',
      timeZone: 'Asia/Singapore', // GMT+8
      timeZoneName: 'short'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const published = new Date(dateString);
    
    // Convert both dates to GMT+8 for consistent calculation
    const nowGMT8 = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    const publishedGMT8 = new Date(published.toLocaleString('en-US', { timeZone: 'Asia/Singapore' }));
    
    const diffMs = nowGMT8.getTime() - publishedGMT8.getTime();
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

  const handleVote = async (commentId: number, voteType: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Please sign in to vote');
      return;
    }

    try {
      const result = await commentAPI.voteOnComment(commentId, voteType);
      
      // Update local state recursively
      const updateCommentVote = (comments: ForumPost[]): ForumPost[] => {
        return comments.map(post => {
          if (post.id === commentId) {
            return { 
              ...post, 
              likes: result.likes,
              dislikes: result.dislikes,
              userVote: result.userVote
            };
          }
          
          if (post.replies && post.replies.length > 0) {
            const updateRepliesVote = (replies: ForumReply[]): ForumReply[] => {
              return replies.map(reply => {
                if (reply.id === commentId) {
                  return { 
                    ...reply, 
                    likes: result.likes,
                    dislikes: result.dislikes,
                    userVote: result.userVote
                  };
                }
                
                if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: updateRepliesVote(reply.replies)
                  };
                }
                
                return reply;
              });
            };
            
            return {
              ...post,
              replies: updateRepliesVote(post.replies)
            };
          }
          
          return post;
        });
      };
      
      setForumPosts(updateCommentVote);
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast.error('Failed to vote on comment');
    }
  };

  const handleSubmitReply = async (parentId: number, content: string) => {
    if (!user || !id) {
      toast.error('Please sign in to reply');
      return;
    }

    try {
      const response = await commentAPI.createComment(parseInt(id), content, parentId);
      
      // Add user data to the new reply for immediate display
      const newForumReply: ForumReply = {
        ...response.comment,
        user: {
          id: user.id,
          username: user.username,
          avatarSkinColor: user.avatarSkinColor || 'fdbcb4',
          avatarHairColor: user.avatarHairColor || '724133',
          avatarHair: user.avatarHair || 'short01',
          avatarEyes: user.avatarEyes || 'variant01',
          avatarMouth: user.avatarMouth || 'variant01',
          avatarAccessories: user.avatarAccessories || 'none',
        },
        replies: [],
        userVote: null
      };

      // Update local state recursively
      const addReplyToComments = (comments: ForumPost[]): ForumPost[] => {
        return comments.map(post => {
          if (post.id === parentId) {
            return { 
              ...post, 
              replies: [...post.replies, newForumReply] 
            };
          }
          
          if (post.replies && post.replies.length > 0) {
            const addReplyToReplies = (replies: ForumReply[]): ForumReply[] => {
              return replies.map(reply => {
                if (reply.id === parentId) {
                  return {
                    ...reply,
                    replies: reply.replies ? [...reply.replies, newForumReply] : [newForumReply]
                  };
                }
                
                if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: addReplyToReplies(reply.replies)
                  };
                }
                
                return reply;
              });
            };
            
            return {
              ...post,
              replies: addReplyToReplies(post.replies)
            };
          }
          
          return post;
        });
      };
      
      setForumPosts(addReplyToComments);
    } catch (error) {
      console.error('Error posting reply:', error);
      throw error; // Re-throw so the Comment component can handle it
    }
  };

  const handleSubmitPost = async () => {
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }
    
    if (!newPost.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!id) {
      toast.error('Article ID not found');
      return;
    }

    try {
      const response = await commentAPI.createComment(parseInt(id), newPost.trim());
      
      // Add user data to the new comment for immediate display
      const newComment: ForumPost = {
        ...response.comment,
        user: {
          id: user.id,
          username: user.username,
          avatarSkinColor: user.avatarSkinColor || 'fdbcb4',
          avatarHairColor: user.avatarHairColor || '724133',
          avatarHair: user.avatarHair || 'short01',
          avatarEyes: user.avatarEyes || 'variant01',
          avatarMouth: user.avatarMouth || 'variant01',
          avatarAccessories: user.avatarAccessories || 'none',
        },
        replies: [],
        userVote: null
      };

      setForumPosts(prev => [newComment, ...prev]);
      setNewPost('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    }
  };

  // Helper function to get user's biggest stake info for the current market
  const getUserStakeInfo = (userId: number): { amount: number; prediction: boolean | null } => {
    if (!market || !market.stakes || !Array.isArray(market.stakes)) return { amount: 0, prediction: null };
    try {
      // Find all stakes by this user on this market
      const userStakes = market.stakes.filter(stake => stake && stake.userId === userId);
      
      if (userStakes.length === 0) return { amount: 0, prediction: null };
      
      // Find the biggest stake
      const biggestStake = userStakes.reduce((max, stake) => {
        const stakeAmount = stake?.amount || stake?.stakeAmount || 0;
        return stakeAmount > (max?.amount || max?.stakeAmount || 0) ? stake : max;
      }, userStakes[0]);
      
      return {
        amount: biggestStake?.amount || biggestStake?.stakeAmount || 0,
        prediction: biggestStake?.prediction
      };
    } catch (error) {
      console.error('Error getting user stake info:', error);
      return { amount: 0, prediction: null };
    }
  };

  // Helper function to convert user data to avatar config
  const getUserAvatarConfig = (user: CommentUser) => {
    return {
      skinColor: user.avatarSkinColor || 'efcc9f',
      hairColor: user.avatarHairColor || '71472d',
      hair: user.avatarHair || 'shortHair',
      eyes: user.avatarEyes || 'normal',
      mouth: user.avatarMouth || 'teethSmile',
      accessories: user.avatarAccessories || 'none'
    };
  };

  // Recursive Comment Component
  const Comment: React.FC<{
    comment: ForumPost | ForumReply;
    depth?: number;
    onVote: (commentId: number, voteType: 'like' | 'dislike') => void;
    onReply: (commentId: number, content: string) => void;
  }> = ({ comment, depth = 0, onVote, onReply }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const maxDepth = 5; // Limit nesting depth to prevent infinite nesting
    const isNested = depth > 0;
    const canReply = depth < maxDepth;

    const handleSubmitReply = async () => {
      if (!replyContent.trim()) return;
      
      try {
        await onReply(comment.id, replyContent.trim());
        setReplyContent('');
        setIsReplying(false);
        toast.success('Reply posted successfully!');
      } catch (error) {
        console.error('Error posting reply:', error);
        toast.error('Failed to post reply');
      }
    };

    const marginLeft = isNested ? 'ml-6' : '';
    const avatarSize = isNested ? 32 : 40;
    const avatarRing = isNested ? 'ring-cyan-400/30' : 'ring-purple-400/30';

    return (
      <div className={`${marginLeft} ${isNested ? 'mt-3' : ''} relative`}>
        {/* Vertical line for nesting */}
        {isNested && (
          <div className="absolute left-2 top-0 h-full border-l-2 border-white/20 z-0"></div>
        )}
        
        <div className={`${isNested ? 'pl-4' : ''} relative z-10`}>
          {/* Comment Header */}
          <div className="flex items-start space-x-3 mb-3">
            <Avatar 
              config={getUserAvatarConfig(comment.user)}
              size={avatarSize}
              className={`ring-2 ${avatarRing} flex-shrink-0`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h5 className="text-white font-semibold text-base">{comment.user.username}</h5>
                {(() => {
                  const stakeInfo = getUserStakeInfo(comment.userId);
                  return stakeInfo.amount > 0 && (
                    <div className={`bg-gradient-to-r ${isNested ? 'from-cyan-600/30 to-blue-600/30 border-cyan-400/50' : 'from-purple-600/30 to-pink-600/30 border-purple-400/50'} border rounded-full px-2 py-0.5 flex items-center space-x-1`}>
                      <div className={`w-1.5 h-1.5 ${isNested ? 'bg-cyan-400' : 'bg-purple-400'} rounded-full`}></div>
                      <span className={`text-xs ${isNested ? 'text-cyan-200' : 'text-purple-200'} font-medium`}>
                        Staked {stakeInfo.amount.toFixed(2)} PP on {stakeInfo.prediction ? 'TRUE' : 'FALSE'}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{getTimeSince(comment.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Comment Content */}
          <div className={`${isNested ? 'ml-9' : 'ml-12'} mb-3`}>
            <p className="text-slate-100 leading-relaxed text-base">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className={`${isNested ? 'ml-9' : 'ml-12'} flex items-center justify-between`}>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVote(comment.id, 'like')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                  comment.userVote === 'like' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10 border border-transparent hover:border-green-500/20'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
                </svg>
                <span className="font-medium text-sm">{comment.likes}</span>
              </button>
              <button
                onClick={() => onVote(comment.id, 'dislike')}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                  comment.userVote === 'dislike' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z"/>
                </svg>
                <span className="font-medium text-sm">{comment.dislikes}</span>
              </button>
              {canReply && user && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span className="font-medium text-sm">Reply</span>
                  {comment.replies && comment.replies.length > 0 && (
                    <span className="bg-slate-600 text-slate-200 text-xs px-1.5 py-0.5 rounded-full">{comment.replies.length}</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {isReplying && user && (
            <div className={`mt-4 ${isNested ? 'ml-9' : 'ml-12'} bg-slate-900/30 rounded-xl p-3 border border-slate-600/20`}>
              <div className="flex items-center space-x-2 mb-2">
                <Avatar 
                  config={getUserAvatarConfig({
                    id: user.id,
                    username: user.username,
                    avatarSkinColor: user.avatarSkinColor || '',
                    avatarHairColor: user.avatarHairColor || '',
                    avatarHair: user.avatarHair || '',
                    avatarEyes: user.avatarEyes || '',
                    avatarMouth: user.avatarMouth || '',
                    avatarAccessories: user.avatarAccessories || ''
                  })}
                  size={28}
                  className="ring-2 ring-cyan-400/30"
                />
                <span className="text-slate-300 text-xs">Replying to <span className="text-white font-medium">{comment.user.username}</span></span>
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts on this comment..."
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200 text-sm"
                rows={2}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed text-sm"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <Comment
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                onVote={onVote}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    );
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
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
                <p className="text-red-300 text-sm">Debug info: {error}</p>
                <p className="text-red-300 text-sm">Article ID: {id}</p>
                <p className="text-red-300 text-sm">Market state: {market ? 'Has market' : 'No market'}</p>
              </div>
            )}
            <Link to="/news" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
              Back to News
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { article } = market;
  
  // Safely get stakes data
  let stakesArray: any[] = [];
  let totalStakes = 0;
  let totalVolume = 0;
  
  try {
    stakesArray = Array.isArray(market.stakes) ? market.stakes : [];
    totalStakes = stakesArray.length;
    totalVolume = stakesArray.reduce((sum, stake) => {
      if (!stake || typeof stake.stakeAmount !== 'number') return sum;
      return sum + stake.stakeAmount;
    }, 0);
  } catch (error) {
    console.error('Error processing stakes data:', error);
    stakesArray = [];
    totalStakes = 0;
    totalVolume = 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            to="/news" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to News
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Article Content */}
          <div className="lg:col-span-2" data-tour="article-content">
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
          <div className="lg:col-span-1" data-tour="prediction-interface">
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
        <div className="mt-12">
          <div className="glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white">Discussion</h3>
              <div className="text-sm text-slate-400">
                {forumPosts.length} {forumPosts.length === 1 ? 'comment' : 'comments'}
              </div>
            </div>
            
            {/* New Post Form */}
            {user && (
              <div className="mb-8 bg-slate-900/20 backdrop-blur-sm rounded-xl p-6 border border-slate-600/20">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar 
                    config={getUserAvatarConfig({
                      id: user.id,
                      username: user.username,
                      avatarSkinColor: user.avatarSkinColor || '',
                      avatarHairColor: user.avatarHairColor || '',
                      avatarHair: user.avatarHair || '',
                      avatarEyes: user.avatarEyes || '',
                      avatarMouth: user.avatarMouth || '',
                      avatarAccessories: user.avatarAccessories || ''
                    })}
                    size={40}
                    className="ring-2 ring-purple-400/30"
                  />
                  <div>
                    <h4 className="text-white font-medium">{user.username}</h4>
                    <p className="text-xs text-slate-400">Share your thoughts on this article</p>
                  </div>
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="What's your take on this story? Share your analysis, insights, or questions..."
                  className="w-full px-4 py-4 bg-slate-800/30 border border-slate-600/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all duration-200"
                  rows={4}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const userStakeInfo = getUserStakeInfo(user.id);
                      return user.provePoints > 0 && userStakeInfo.amount > 0 && (
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-slate-300">
                            Your stake: <span className="text-purple-300 font-medium">{userStakeInfo.amount.toFixed(2)} PP on {userStakeInfo.prediction ? 'TRUE' : 'FALSE'}</span>
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!newPost.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            )}

            {!user && (
              <div className="mb-8 bg-slate-900/20 backdrop-blur-sm rounded-xl p-6 text-center border border-slate-600/20">
                <div className="flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <p className="text-slate-300 mb-4 text-lg">Join the conversation</p>
                <p className="text-slate-400 mb-6">Sign in to share your thoughts and engage with the community</p>
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Sign In to Comment
                </Link>
              </div>
            )}

            {/* Forum Posts */}
            <div className="space-y-6">
              {forumPosts.map((post) => (
                <Comment
                  key={post.id}
                  comment={post}
                  depth={0}
                  onVote={handleVote}
                  onReply={handleSubmitReply}
                />
              ))}

              {forumPosts.length === 0 && (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Start the conversation</h4>
                  <p className="text-slate-400 max-w-md mx-auto">
                    No discussions yet. Be the first to share your thoughts and spark meaningful dialogue about this article.
                  </p>
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
