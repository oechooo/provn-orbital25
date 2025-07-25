const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Utility function to handle API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const fullUrl = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(fullUrl, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
};

// Article API functions
export const articleAPI = {
  // Get all articles with optional filtering
  getArticles: (params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return apiRequest(`/articles${queryString ? `?${queryString}` : ''}`);
  },

  // Get single article by ID
  getArticleById: (id: number) => {
    return apiRequest(`/articles/${id}`);
  },

  // Get article with market data
  getArticleWithMarket: (id: number) => {
    return apiRequest(`/articles/${id}/market`);
  },

  // Get article categories
  getCategories: () => {
    return apiRequest('/articles/categories');
  },

  // Create new article (admin only)
  createArticle: (articleData: {
    title: string;
    content: string;
    summary?: string;
    author?: string;
    url: string;
    imageUrl?: string;
    category?: string;
    publishedAt?: string;
  }) => {
    return apiRequest('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  // Refresh articles (trigger news fetch)
  refreshArticles: () => {
    return apiRequest('/articles/refresh', {
      method: 'POST',
    });
  },
};

// Market API functions
export const marketAPI = {
  // Get all markets
  getMarkets: () => {
    return apiRequest('/markets');
  },

  // Get market by ID
  getMarketById: (id: number) => {
    return apiRequest(`/markets/${id}`);
  },

  // Create new market
  createMarket: (articleId: number) => {
    return apiRequest('/markets', {
      method: 'POST',
      body: JSON.stringify({ articleId }),
    });
  },

  // Resolve market
  resolveMarket: (id: number, outcome: boolean) => {
    return apiRequest(`/markets/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ outcome }),
    });
  },

  // Get staking parameters (upside calculation)
  getStakingParameters: (marketId: number, prediction: boolean, stakeAmount: number) => {
    return apiRequest(`/markets/${marketId}/staking-parameters?prediction=${prediction}&stakeAmount=${stakeAmount}`);
  },

  // Admin functions
  setMarketOutcome: (id: number, outcome: boolean | null) => {
    return apiRequest(`/markets/${id}/set-outcome`, {
      method: 'PUT',
      body: JSON.stringify({ outcome }),
    });
  },

  adminResolveMarket: (id: number) => {
    return apiRequest(`/markets/${id}/admin-resolve`, {
      method: 'PUT',
    });
  },
};

// Stake API functions
export const stakeAPI = {
  // Get user stakes
  getUserStakes: () => {
    return apiRequest('/stakes/user');
  },
  // Create new stake
  createStake: (marketId: number, stakeAmount: number, prediction: boolean) => {
    return apiRequest('/stakes', {
      method: 'POST',
      body: JSON.stringify({ marketId, stakeAmount, prediction }),
    });
  },

  // Get stake by ID
  getStakeById: (id: number) => {
    return apiRequest(`/stakes/${id}`);
  },
};

// User API functions
export const userAPI = {
  // Get current user profile
  getCurrentUser: () => {
    return apiRequest('/users/me');
  },

  // Get user profile
  getProfile: () => {
    return apiRequest('/users/profile');
  },

  // Update user profile
  updateProfile: (userData: {
    username?: string;
    email?: string;
  }) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Update user avatar
  updateAvatar: (userId: number, avatarData: {
    avatarSkinColor: string;
    avatarHairColor: string;
    avatarHair: string;
    avatarEyes: string;
    avatarMouth: string;
    avatarAccessories: string;
  }) => {
    return apiRequest(`/users/${userId}/avatar`, {
      method: 'PUT',
      body: JSON.stringify(avatarData),
    });
  },

  // Get user statistics
  getStats: () => {
    return apiRequest('/users/stats');
  },
};

// Auth API functions
export const authAPI = {
  // Login
  login: (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register
  register: (username: string, email: string, password: string) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  // Logout
  logout: () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Comment API functions
export const commentAPI = {
  // Get comments for an article
  getCommentsByArticleId: (articleId: number) => {
    return apiRequest(`/comments/article/${articleId}`);
  },

  // Create a new comment
  createComment: (articleId: number, content: string, parentId?: number) => {
    return apiRequest('/comments', {
      method: 'POST',
      body: JSON.stringify({ 
        articleId, 
        content, 
        ...(parentId && { parentId })
      }),
    });
  },

  // Vote on a comment
  voteOnComment: (commentId: number, voteType: 'like' | 'dislike') => {
    return apiRequest(`/comments/${commentId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  // Update a comment
  updateComment: (commentId: number, content: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  // Delete a comment
  deleteComment: (commentId: number) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  },
};
