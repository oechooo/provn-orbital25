import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TestArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching data for article:', id);
        
        const response = await fetch(`${API_BASE_URL}/markets/by-article/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Received data:', result);
        
        setData(result);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-2xl mb-4">Loading Article {id}...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-red-400 text-2xl mb-4">Error loading article {id}</h1>
          <p className="text-white">{error}</p>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!data || !data.market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-yellow-400 text-2xl mb-4">No data found for article {id}</h1>
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { market } = data;
  const { article } = market;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        
        <h1 className="text-white text-3xl font-bold mb-4">
          Test Article Page - Article {id}
        </h1>
        
        <div className="bg-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-cyan-400 text-xl mb-2">Article Info:</h2>
          <p className="text-white mb-2"><strong>Title:</strong> {article?.title || 'No title'}</p>
          <p className="text-white mb-2"><strong>Source:</strong> {article?.sourceName || 'No source'}</p>
          <p className="text-white mb-2"><strong>Author:</strong> {article?.author || 'No author'}</p>
        </div>
        
        <div className="bg-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-green-400 text-xl mb-2">Market Info:</h2>
          <p className="text-white mb-2"><strong>Market ID:</strong> {market.id}</p>
          <p className="text-white mb-2"><strong>Prob True:</strong> {market.probTrue}</p>
          <p className="text-white mb-2"><strong>Prob False:</strong> {market.probFalse}</p>
          <p className="text-white mb-2"><strong>Stakes:</strong> {market.stakes?.length || 0}</p>
        </div>
        
        <div className="bg-white/10 rounded-lg p-6">
          <h2 className="text-purple-400 text-xl mb-2">Raw Data:</h2>
          <pre className="text-white text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestArticlePage;
