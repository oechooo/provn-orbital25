import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const SimpleHomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
            Welcome to
            <br />            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Provn.io
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Truth through prediction markets
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">System Status</h2>
            <ul className="text-left text-gray-300 space-y-2">
              <li>✅ React is working</li>
              <li>✅ React Router is working</li>
              <li>✅ Tailwind CSS is loaded</li>
              <li>✅ Components are rendering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function SimpleApp() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<SimpleHomePage />} />
            <Route path="*" element={
              <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
                <h1>Page Not Found</h1>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default SimpleApp;