import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TestPage: React.FC = () => {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/markets');
      const data = await response.json();
      console.log('Markets data:', data);
      setMarkets(data.markets || []);
    } catch (err) {
      console.error('Error fetching markets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl text-white mb-4">Loading markets...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl text-white mb-4">Error: {error}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl text-white mb-6">Test Markets ({markets.length} total)</h1>
        
        <div className="grid gap-4">
          {markets.slice(0, 10).map((market) => (
            <div key={market.id} className="bg-white/10 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-bold">Market ID: {market.id}</h3>
                <Link 
                  to={`/article/${market.id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                >
                  View Article
                </Link>
              </div>
              <p className="text-slate-300 text-sm mb-2">
                Article: {market.article?.title || 'No title'}
              </p>
              <p className="text-slate-400 text-xs">
                Source: {market.article?.sourceName || 'Unknown'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
