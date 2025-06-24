function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">          <h1 className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient-text mb-6">
            Provn.io
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed">
            Using prediction markets to verify news media truth
          </p>
          
          {/* Glassmorphism Card */}
          <div className="glass-card p-8 mb-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              🚀 Modern Interface Ready!
            </h2>            <p className="text-slate-300 mb-6">
              Your Provn.io webapp has been transformed into a modern tech startup interface with beautiful animations and glassmorphism effects.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl mb-2">✨</div>
                <p className="text-sm text-slate-300">Modern Design</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl mb-2">🎭</div>
                <p className="text-sm text-slate-300">Smooth Animations</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-2xl mb-2">🔮</div>
                <p className="text-sm text-slate-300">Glassmorphism</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-400 hover:to-pink-400 hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-purple-500/25">
              Explore News
            </button>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-400 hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
              View Markets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleHomePage;
