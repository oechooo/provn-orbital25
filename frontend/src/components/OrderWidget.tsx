import React, { useState, useEffect } from 'react';
import { stakeAPI, userAPI, marketAPI } from '../services/api';

interface OrderWidgetProps {
  marketId: number;
  prediction: boolean; // true for TRUE bet, false for FALSE bet
  currentProbTrue: number;
  currentProbFalse: number;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrderWidget: React.FC<OrderWidgetProps> = ({
  marketId,
  prediction,
  currentProbTrue,
  currentProbFalse,
  onClose,
  onSuccess
}) => {
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number | null>(null);
  const [realUpside, setRealUpside] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate potential upside using backend API
  useEffect(() => {
    const calculateRealUpside = async () => {
      if (stakeAmount <= 0) {
        setRealUpside(0);
        return;
      }

      setIsCalculating(true);
      try {
        const result = await marketAPI.getStakingParameters(marketId, prediction, stakeAmount);
        setRealUpside(result.upside);
      } catch (err) {
        console.error('Failed to calculate upside:', err);
        setRealUpside(0);
      } finally {
        setIsCalculating(false);
      }
    };

    // Debounce the calculation
    const timeoutId = setTimeout(calculateRealUpside, 300);
    return () => clearTimeout(timeoutId);
  }, [marketId, prediction, stakeAmount]);

  const totalPayout = realUpside * stakeAmount; // Total amount you get back if you win

  // Fetch user's prove points
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userAPI.getCurrentUser();
        setUserPoints(userData.provePoints);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleStake = async () => {
    if (stakeAmount <= 0) {
      setError('Stake amount must be greater than 0');
      return;
    }

    if (userPoints !== null && stakeAmount > userPoints) {
      setError('Insufficient Prove Points');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await stakeAPI.createStake(marketId, stakeAmount, prediction);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place stake');
    } finally {
      setIsLoading(false);
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-100">
            Place {prediction ? 'TRUE' : 'FALSE'} Bet
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl"
          >
            ×
          </button>
        </div>

        {/* Current odds display */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
          <div className="text-sm text-slate-300 mb-1">Current Odds</div>
          <div className="flex justify-between text-sm">
            <span className={`${prediction ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
              TRUE: {Math.round(currentProbTrue * 100)}%
            </span>
            <span className={`${!prediction ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
              FALSE: {Math.round(currentProbFalse * 100)}%
            </span>
          </div>
        </div>

        {/* Stake amount input */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-300">
              Stake Amount (PP)
            </label>
            {userPoints !== null && (
              <span className="text-xs text-slate-400">
                Available: {userPoints.toFixed(2)} PP
              </span>
            )}
          </div>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-400"
            min="1"
            max={userPoints || undefined}
            step="1"
          />
          {/* Quick amount buttons */}
          <div className="flex gap-2 mt-2">
            {[10, 25, 50, 100].filter(amount => !userPoints || amount <= userPoints).map(amount => (
              <button
                key={amount}
                onClick={() => setStakeAmount(amount)}
                className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 rounded transition-colors"
              >
                {amount}
              </button>
            ))}
            {userPoints && userPoints > 100 && (
              <button
                onClick={() => setStakeAmount(userPoints)}
                className="px-2 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 rounded transition-colors"
              >
                All
              </button>
            )}
          </div>
        </div>

        {/* Upside calculation */}
        <div className="mb-6 p-3 bg-slate-700/30 rounded-lg">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Stake:</span>
            <span className="text-slate-100">{stakeAmount.toFixed(2)} PP</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Potential Upside:</span>
            <span className="text-emerald-400">
              {isCalculating ? (
                <span className="animate-pulse">Calculating...</span>
              ) : (
                `${realUpside.toFixed(2)}x`
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-200">Total if correct:</span>
            <span className="text-emerald-400">
              {isCalculating ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${totalPayout.toFixed(2)} PP`
              )}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleStake}
            disabled={isLoading || stakeAmount <= 0 || (userPoints !== null && stakeAmount > userPoints)}
            className={`flex-1 px-4 py-2 rounded-lg font-bold transition-colors ${
              prediction
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Placing...' : `Stake ${prediction ? 'TRUE' : 'FALSE'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderWidget;
