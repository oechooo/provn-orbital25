import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { userAPI, marketAPI, stakeAPI } from '../services/api';
import toast from 'react-hot-toast';

interface UserStats {
  totalBets: number;
  winRate: number;
  reputation: number;
}

interface Market {
  id: number;
  article: {
    id: number;
    title: string;
    confidence_score: number;
  };
  truePrice: number;
  falsePrice: number;
  volume: number;
  endDate: string;
}

export default function DashboardPage() {
  const { user } = useAuth();  const [stats, setStats] = useState<UserStats>({
    totalBets: 0,
    winRate: 0,
    reputation: 0,
  });
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betSide, setBetSide] = useState<'true' | 'false'>('true');
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);  const fetchDashboardData = async () => {
    try {
      const [statsResponse, marketsResponse] = await Promise.all([
        userAPI.getStats(),
        marketAPI.getMarkets(),
      ]);
      
      setStats(statsResponse.data || statsResponse);
      setMarkets(marketsResponse.data || marketsResponse.markets || marketsResponse);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const placeBet = async () => {
    if (!selectedMarket || !betAmount) {
      toast.error('Please select a market and enter a bet amount');
      return;
    }    setIsPlacingBet(true);
    try {
      await stakeAPI.createStake(selectedMarket.article.id, parseFloat(betAmount), betSide === 'true');
      
      toast.success('Bet placed successfully!');
      setBetAmount('');
      setSelectedMarket(null);
      await fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-slate-300 mt-4 text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="glass-card p-6 mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <p className="text-slate-300">
            Here's your trading dashboard. Monitor your performance and place new bets.
          </p>
        </div>        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Total Staked</p>
                <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Accuracy</p>
                <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
              </div>
            </div>          </div>

          <div className="glass-card p-6 hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-400">Reputation</p>
                <p className="text-2xl font-bold text-white">{stats.reputation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Markets */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Markets</h2>
          <div className="space-y-4">
            {markets.map((market) => (
              <div
                key={market.id}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedMarket?.id === market.id
                    ? 'border-purple-400 bg-purple-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
                onClick={() => setSelectedMarket(market)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {market.article.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    market.article.confidence_score >= 0.7
                      ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300'
                      : market.article.confidence_score >= 0.4
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300'
                      : 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300'
                  }`}>
                    {Math.round(market.article.confidence_score * 100)}% confidence
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">True Price</p>
                    <p className="text-green-400 font-semibold">${market.truePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">False Price</p>
                    <p className="text-red-400 font-semibold">${market.falsePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Volume</p>
                    <p className="text-white font-semibold">${market.volume.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Place Bet Section */}
        {selectedMarket && (
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Place Bet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Selected Article</h3>
                <p className="text-slate-300">{selectedMarket.article.title}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Bet Side
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setBetSide('true')}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        betSide === 'true'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      True (${selectedMarket.truePrice.toFixed(2)})
                    </button>
                    <button
                      onClick={() => setBetSide('false')}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        betSide === 'false'
                          ? 'bg-red-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      False (${selectedMarket.falsePrice.toFixed(2)})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Bet Amount ($)
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                  />
                </div>

                <button
                  onClick={placeBet}
                  disabled={isPlacingBet || !betAmount}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-purple-500/25 hover:scale-105 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlacingBet ? 'Placing Bet...' : `Place ${betSide.toUpperCase()} Bet`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}