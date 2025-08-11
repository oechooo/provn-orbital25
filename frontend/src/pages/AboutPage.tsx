import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            About{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Provn.io
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Harnessing collective intelligence to fight misinformation through prediction markets
          </p>
        </div>

        {/* Video Demo Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">See How It Works</h2>
            <p className="text-lg text-slate-300">Watch our platform demonstration</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-6">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src="https://www.youtube.com/embed/vFl8LxjZz70"
                  title="ProveN - Prediction Markets for News Verification"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="mt-4 text-center">
                <p className="text-slate-300 text-sm">
                  Learn about Provn.io's features and how to navigate our website!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4">The Problem We're Solving</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  In today's digital landscape, <strong className="text-white">misinformation spreads faster than wildfire</strong>, 
                  while traditional fact-checking struggles to keep pace. News outlets, social media platforms, and readers 
                  all face the same challenge: How do we quickly and accurately determine what's true?
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span><strong>Overwhelming Volume:</strong> Thousands of articles published daily</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span><strong>Speed vs. Accuracy:</strong> Traditional fact-checking is thorough but slow</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">•</span>
                    <span><strong>Trust Crisis:</strong> Readers struggle to know which sources to trust</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-purple-400 mb-4">Our Solution: Crowdsourced Truth</h3>
                <p className="text-slate-300 mb-4 leading-relaxed">
                  ProveN harnesses <strong className="text-white">crowd wisdom</strong> through prediction markets, 
                  creating a scalable, real-time verification system that grows more accurate as more people participate.
                </p>
                <ul className="text-slate-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Collective Intelligence:</strong> Diverse users contribute knowledge</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Real-time Processing:</strong> Instant feedback on article credibility</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span><strong>Skin in the Game:</strong> Users stake points, incentivizing accuracy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Core Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
            <p className="text-lg text-slate-300">Everything you need to participate in news verification</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time News</h3>
              <p className="text-slate-300">Integration with NewsAPI.org for fetching real-world news articles across diverse categories</p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Prediction Markets</h3>
              <p className="text-slate-300">Automated market creation with LMSR for dynamic probability updates based on user stakes</p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">ProvePoints Economy</h3>
              <p className="text-slate-300">Virtual currency system with stake-based wagering and automatic payout calculations</p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Avatar System</h3>
              <p className="text-slate-300">Comprehensive customization with DiceBear integration and PP-gated premium features</p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Advanced Search</h3>
              <p className="text-slate-300">Filter articles by keyword search and sort for new, trending, trusted, or contentious content</p>
            </div>

            <div className="glass-card p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Authentication</h3>
              <p className="text-slate-300">JWT-based authentication with proper password hashing and protection against common attacks</p>
            </div>
          </div>
        </div>

        {/* Why Prediction Markets Work Section */}
        <div className="mb-20">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Why Prediction Markets Work</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-slate-300 text-lg mb-6 leading-relaxed text-center">
                Research consistently shows that prediction markets are among the most accurate forecasting mechanisms available. 
                By <strong className="text-white">crowdsourcing accuracy</strong>, we create powerful incentives for users to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-400 mb-3">Research Thoroughly</h3>
                  <p className="text-slate-300">Users have skin in the game, encouraging deep analysis before staking their points</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">Update Predictions</h3>
                  <p className="text-slate-300">Users can create new positions as new evidence emerges, so that markets automatically adjust accordingly</p>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-400 mb-3">Share Expertise</h3>
                  <p className="text-slate-300">Users contribute specialized knowledge in their areas of expertise</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built With Modern Technology</h2>
            <p className="text-lg text-slate-300">Cutting-edge tools for a seamless user experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-cyan-400 mb-4">Frontend</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• React 19 with TypeScript for type-safe development</li>
                <li>• Tailwind CSS for modern, responsive styling</li>
                <li>• Vite for fast development and hot module replacement</li>
                <li>• React Router for seamless navigation</li>
              </ul>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Backend</h3>
              <ul className="text-slate-300 space-y-2">
                <li>• Node.js with Express.js for RESTful API</li>
                <li>• SQLite with Prisma ORM for data management</li>
                <li>• JWT authentication for secure user sessions</li>
                <li>• NewsAPI.org integration for real-time news</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="glass-card p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Join the Fight Against Misinformation</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Be part of a community that values truth and accuracy. Start making predictions and help verify news for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative inline-flex items-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl hover:from-cyan-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25"
              >
                <span className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300"></span>
                <span className="relative flex items-center">
                  Get Started
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/news"
                className="inline-flex items-center px-8 py-4 text-lg font-bold text-gray-300 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 hover:text-white transform hover:scale-105 transition-all duration-300"
              >
                Explore News
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
