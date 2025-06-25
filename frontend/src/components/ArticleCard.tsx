import React from 'react';
import { Link } from 'react-router-dom';
import type { ArticleWithMarket } from '../../../shared/types';

interface ArticleCardProps {
  article: ArticleWithMarket;
  confidence: number;
  formatDate: (dateString: string) => string;
  defaultImage?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, formatDate, defaultImage = '/default-news.png' }) => {
  const imageUrl = article.urlToImage || defaultImage;

  // Get dynamic probability from article.market.probTrue
  const prob =
    article.market && typeof article.market.probTrue === 'number' && !isNaN(article.market.probTrue)
      ? Math.round(article.market.probTrue * 100)
      : 44;

  return (
    <div
      className="w-full relative flex flex-col bg-slate-900/80 border border-slate-700 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-200 overflow-hidden group"
      style={{ maxWidth: '100%' }}
    >
      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
          <img
            src={imageUrl}
            alt={article.title}
            className="object-cover w-full h-full"
            onError={e => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + defaultImage) {
                target.src = defaultImage;
              }
            }}
          />
        </div>
        {/* Article Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">
                {article.category || 'News'}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{formatDate(article.publishedAt)}</span>
            </div>
            <Link
              to={`/article/${article.id}`}
              className="block text-lg md:text-xl font-bold text-slate-100 hover:text-pink-400 transition-colors leading-snug mb-1"
            >
              {article.title}
            </Link>
            <p className="text-slate-300 text-sm md:text-base mb-2 line-clamp-3">
              {article.description || 'No summary available'}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-slate-400">by {article.author || 'Unknown Source'}</span>
          </div>
        </div>
      </div>
      {/* Split Bar for True/False Probability - full width horizontal at bottom, always below main content */}
      <div className="w-full flex flex-col items-start px-6 pb-4">
        <span className="text-xs text-slate-400 mb-1">User Confidence</span>
        <div className="w-full max-w-2xl flex items-center">
          <div className="flex-1 h-8 flex rounded overflow-hidden border border-slate-700 relative">
            <div
              className={`h-full ${prob >= 80 ? 'bg-emerald-400/80' : prob >= 50 ? 'bg-amber-400/80' : 'bg-red-400/80'}`}
              style={{ width: `${prob}%` }}
            >
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-900 drop-shadow-sm">
                {prob}%
              </span>
            </div>
            <div className="h-full bg-slate-700/60 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;