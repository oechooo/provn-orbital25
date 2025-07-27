import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';
import OrderWidget from './OrderWidget';

interface Market {
  id: number;
  articleId: number;
  resolved: boolean;
  outcome: boolean | null;
  probTrue: number;
  probFalse: number;
  sharesTrue: number;
  sharesFalse: number;
  article: {
    id: number;
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    sourceName: string;
    author: string;
    publishedAt: string;
    category: string;
  };
  stakes: any[];
}

interface MarketCardProps {
  market: Market;
  onStakeSuccess?: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ market, onStakeSuccess }) => {
  const { user } = useAuth();
  const [showOrderWidget, setShowOrderWidget] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean>(true);

  // Helper function to capitalize first letter of each word
  const capitalizeCategory = (category: string): string => {
    return category
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleStake = async (prediction: boolean) => {
    if (!user) {
      toast.error('Please log in to stake on markets');
      return;
    }

    if (market.resolved) {
      toast.error('This market has already been resolved');
      return;
    }

    setSelectedPrediction(prediction);
    setShowOrderWidget(true);
  };

  const totalStakes = market.stakes?.length || 0;
  const truePercentage = Math.round(market.probTrue * 1000) / 10;
  const falsePercentage = Math.round(market.probFalse * 1000) / 10;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Singapore', // GMT+8
      timeZoneName: 'short'
    });
  };

  return (
    <>
      <div className="glass-card p-6 hover:scale-[1.02] transition-all duration-300">
        {/* Article Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-300 font-medium">
              {market.article.sourceName}
            </span>
            <span className="text-sm text-slate-400">
              {formatDate(market.article.publishedAt)}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {market.article.title}
          </h3>
          
          {market.article.description && (
            <p className="text-slate-300 text-sm mb-3 line-clamp-2">
              {market.article.description}
            </p>
          )}

          {market.article.category && (
            <span className="inline-block px-2 py-1 bg-purple-600/30 text-purple-300 text-xs rounded-full">
              {capitalizeCategory(market.article.category)}
            </span>
          )}
        </div>

        {/* Market Status */}
        <div className="mb-4">
          {market.resolved ? (
            <div className="flex items-center justify-center p-3 bg-slate-700/50 rounded-lg">
              <span className="text-lg font-bold">
                RESOLVED: {market.outcome ? 'TRUE' : 'FALSE'}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Probability Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold text-lg">{truePercentage.toFixed(2)}%</div>
                  <div className="text-green-300 text-sm">TRUE</div>
                </div>
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold text-lg">{falsePercentage.toFixed(2)}%</div>
                  <div className="text-red-300 text-sm">FALSE</div>
                </div>
              </div>

              {/* Stake Buttons */}
              {user && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStake(true)}
                    className="bg-green-600 hover:bg-green-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Stake TRUE
                  </button>
                  <button
                    onClick={() => handleStake(false)}
                    className="bg-red-600 hover:bg-red-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Stake FALSE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Market Stats */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-3">
          <span>{totalStakes} stakes</span>
          <span>Market #{market.id}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/article/${market.id}`}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Read Article
          </Link>
        </div>
      </div>

      {/* Order Widget */}
      {showOrderWidget && (
        <OrderWidget
          marketId={market.id}
          prediction={selectedPrediction}
          currentProbTrue={market.probTrue}
          currentProbFalse={market.probFalse}
          onClose={() => setShowOrderWidget(false)}
          onSuccess={() => {
            setShowOrderWidget(false);
            if (onStakeSuccess) {
              onStakeSuccess();
            }
          }}
        />
      )}
    </>
  );
};

export default MarketCard;
