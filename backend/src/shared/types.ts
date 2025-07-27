// Centralized shared types for the entire application
// Import this file from both frontend and backend

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Core Entity Types (matching Prisma schema)
// ============================================================================

export interface Article {
  id: number;
  sourceName: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  category: string | null;
  publishedAt: string;
  createdAt: string;
  content?: string | null;
}

export interface Market {
  id: number;
  articleId: number;
  closed: boolean;
  resolveCount: number;
  outcome: boolean | null;
  createdAt: string;
  lastResolve: string;
  nextResolve: string;
  sharesTrue: number;
  sharesFalse: number;
  probTrue: number;
  probFalse: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  provePoints: number;
  resetToken?: string | null;
  resetTokenExpiry?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Stake {
  id: number;
  userId: number;
  marketId: number;
  resolved: boolean;
  prediction: boolean;
  stakeAmount: number;
  upside: number;
  createdAt: string;
}

// ============================================================================
// Composite Types
// ============================================================================

export interface ArticleWithMarket extends Article {
  market: Market | null;
}

export interface StakeWithMarket extends Stake {
  market: Market & { article: Article };
}

export interface StakeWithUser extends Stake {
  user: Pick<User, 'id' | 'username'>;
}

export interface MarketWithRelations extends Market {
  stakes: StakeWithUser[];
  article: Article;
}

export interface UserProfile extends Omit<User, 'email'> {}

export interface UserWithoutPassword extends Omit<User, 'resetToken' | 'resetTokenExpiry'> {}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface AuthResponse extends ApiResponse {
  data: {
    user: UserWithoutPassword;
    token: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password?: string;
}

// ============================================================================
// Filter/Query Types
// ============================================================================

export interface ArticleFilters {
  category?: string;
  search?: string;
  sortBy?: 'publishedAt' | 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

