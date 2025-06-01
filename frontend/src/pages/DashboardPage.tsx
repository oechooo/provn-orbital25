import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Market {
  id: number;
  resolved: boolean;
  outcome: boolean | null;
  article: {
    id: number;
    title: string;
    description: string;
    url: string;
    publishedAt: string;
  };
  stakes: Array<{
    id: number;
    prediction: boolean;
    stakeAmount: number;
    user: {
      id: number;
      username: string;
    };
  }>;
}

interface UserStats {
  totalStakes: number;
  totalAmountStaked: number;
  winningStakes: number;
  winRate: number;
}

const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(10);
  const [prediction, setPrediction] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch markets
      const marketsResponse = await fetch('http://localhost:3000/api/markets');
      const marketsData = await marketsResponse.json();
      setMarkets(marketsData.markets || []);

      // Fetch user stats if logged in
      if (token && user) {
        const statsResponse = await fetch(`http://localhost:3000/api/stakes/user/${user.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setUserStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async () => {
    if (!selectedMarket || !token) return;

    try {
      const response = await fetch('http://localhost:3000/api/stakes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marketId: selectedMarket.id,
          prediction,
          stakeAmount
        })
      });

      if (response.ok) {
        alert('Bet placed successfully!');
        setSelectedMarket(null);
        fetchDashboardData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error placing bet: ${error.message}`);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Error placing bet');
    }
  };

  const calculateMarketStats = (market: Market) => {
    const trueStakes = market.stakes.filter(s => s.prediction === true);
    const falseStakes = market.stakes.filter(s => s.prediction === false);
    const totalAmount = market.stakes.reduce((sum, s) => sum + s.stakeAmount, 0);
    const trueAmount = trueStakes.reduce((sum, s) => sum + s.stakeAmount, 0);
    const falseAmount = falseStakes.reduce((sum, s) => sum + s.stakeAmount, 0);

    return {
      totalParticipants: market.stakes.length,
      totalAmount,
      truePercentage: totalAmount > 0 ? Math.round((trueAmount / totalAmount) * 100) : 50,
      falsePercentage: totalAmount > 0 ? Math.round((falseAmount / totalAmount) * 100) : 50,
      trueCount: trueStakes.length,
      falseCount: falseStakes.length
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prediction Markets Dashboard</h1>
          <p className="mt-2 text-gray-600">Bet on news outcomes and earn ProvePoints</p>
        </div>

        {/* User Stats */}
        {user && userStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user.provePoints}</div>
                <div className="text-gray-600">ProvePoints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.totalStakes}</div>
                <div className="text-gray-600">Total Bets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userStats.totalAmountStaked}</div>
                <div className="text-gray-600">Total Staked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userStats.winRate}%</div>
                <div className="text-gray-600">Win Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Markets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {markets.map((market) => {
            const stats = calculateMarketStats(market);
            return (
              <div key={market.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {market.article.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      market.resolved 
                        ? market.outcome 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {market.resolved 
                        ? market.outcome ? 'TRUE' : 'FALSE'
                        : 'ACTIVE'
                      }
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {market.article.description}
                  </p>

                  {/* Market Stats */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">TRUE: {stats.truePercentage}%</span>
                      <span className="text-gray-600">FALSE: {stats.falsePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-l-full" 
                        style={{ width: `${stats.truePercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{stats.trueCount} bets</span>
                      <span>{stats.falseCount} bets</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {stats.totalParticipants} participants • {stats.totalAmount} PP total
                    </div>
                    {!market.resolved && user && (
                      <button
                        onClick={() => setSelectedMarket(market)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Place Bet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No markets message */}
        {markets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No active markets found</div>
            <p className="text-gray-500 mt-2">New prediction markets will appear here</p>
          </div>
        )}

        {/* Betting Modal */}
        {selectedMarket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Place Your Bet</h3>
              <h4 className="text-md font-medium text-gray-700 mb-4 line-clamp-2">
                {selectedMarket.article.title}
              </h4>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Prediction
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setPrediction(true)}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      prediction === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    TRUE
                  </button>
                  <button
                    onClick={() => setPrediction(false)}
                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                      prediction === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    FALSE
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stake Amount (ProvePoints)
                </label>
                <input
                  type="number"
                  min="1"
                  max={user?.provePoints || 0}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {user?.provePoints || 0} ProvePoints
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedMarket(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={placeBet}
                  disabled={stakeAmount <= 0 || stakeAmount > (user?.provePoints || 0)}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Place Bet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
