import React from 'react';
import { useParams } from 'react-router-dom';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Article Detail</h1>
          <p className="text-slate-300">
            Article ID: {id}
          </p>
          <p className="text-slate-400 mt-4">
            This page is under construction. The article detail functionality will be implemented soon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
