import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { stakeAPI } from '../services/api';
import { useAuth } from '../contexts/SimpleAuthContext';
import toast from 'react-hot-toast';

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
  const [isStaking, setIsStaking] = useState(false);
  const [stakeAmount, setStakeAmount] = useState<number>(100);
  const [selectedPrediction, setSelectedPrediction] = useState<boolean | null>(null);
  const [showStakeModal, setShowStakeModal] = useState(false);

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
    setShowStakeModal(true);
  };

  const confirmStake = async () => {
    if (!selectedPrediction !== null || !stakeAmount || stakeAmount <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    if (stakeAmount > (user?.provePoints || 0)) {
      toast.error('Insufficient Prove Points');
      return;
    }

    setIsStaking(true);
    try {
      await stakeAPI.createStake(market.id, stakeAmount, selectedPrediction!);
      toast.success(`Successfully staked ${stakeAmount} PP on ${selectedPrediction ? 'TRUE' : 'FALSE'}`);
      setShowStakeModal(false);
      setStakeAmount(100);
      setSelectedPrediction(null);
      if (onStakeSuccess) {
        onStakeSuccess();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create stake');
    } finally {
      setIsStaking(false);
    }
  };

  const totalStakes = market.stakes?.length || 0;
  const truePercentage = Math.round(market.probTrue * 1000) / 10;
  const falsePercentage = Math.round(market.probFalse * 1000) / 10;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                RESOLVED: {market.outcome ? '✅ TRUE' : '❌ FALSE'}
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Probability Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
                  <div className="text-green-400 font-bold text-lg">{truePercentage.toFixed(1)}%</div>
                  <div className="text-green-300 text-sm">TRUE</div>
                </div>
                <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-3 text-center">
                  <div className="text-red-400 font-bold text-lg">{falsePercentage.toFixed(1)}%</div>
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
            to={`/article/${market.article.id}`}
            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Read Article
          </Link>
          <Link
            to={`/market/${market.id}`}
            className="flex-1 bg-slate-600 hover:bg-slate-500 text-white text-center py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Market Details
          </Link>
        </div>
      </div>

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Stake on: {selectedPrediction ? 'TRUE' : 'FALSE'}
            </h3>
            
            <div className="mb-4">
              <p className="text-slate-300 text-sm mb-2">
                Current probability: {selectedPrediction ? truePercentage.toFixed(1) : falsePercentage.toFixed(1)}%
              </p>
              <p className="text-slate-400 text-xs">
                Your balance: {user?.provePoints || 0} PP
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Stake Amount (PP)
              </label>
              <input
                type="number"
                min="1"
                max={user?.provePoints || 0}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStakeModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmStake}
                disabled={isStaking || stakeAmount <= 0 || stakeAmount > (user?.provePoints || 0)}
                className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {isStaking ? 'Staking...' : 'Confirm Stake'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MarketCard;
