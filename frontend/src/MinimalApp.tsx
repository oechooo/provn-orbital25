import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Minimal HomePage component
const MinimalHomePage = () => {
  console.log('MinimalHomePage rendering');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">          <h1 className="text-6xl font-black text-white mb-8">
            Provn.io
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Truth through prediction markets
          </p>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-white mb-4">Navigation</h2>
            <div className="space-y-2">
              <a href="/news" className="block text-cyan-400 hover:text-cyan-300">News</a>
              <a href="/dashboard" className="block text-cyan-400 hover:text-cyan-300">Dashboard</a>
              <a href="/login" className="block text-cyan-400 hover:text-cyan-300">Login</a>
              <a href="/register" className="block text-cyan-400 hover:text-cyan-300">Register</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal placeholder pages
const MinimalNewsPage = () => (
  <div className="min-h-screen bg-slate-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">News Page</h1>
    <p>This is the news page with prediction markets.</p>
    <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
  </div>
);

const MinimalDashboardPage = () => (
  <div className="min-h-screen bg-slate-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
    <p>This is your dashboard with market data.</p>
    <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
  </div>
);

const MinimalLoginPage = () => (
  <div className="min-h-screen bg-slate-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">Login</h1>
    <p>Login form would go here.</p>
    <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
  </div>
);

const MinimalRegisterPage = () => (
  <div className="min-h-screen bg-slate-900 text-white p-8">
    <h1 className="text-4xl font-bold mb-4">Register</h1>
    <p>Registration form would go here.</p>
    <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
  </div>
);

function MinimalApp() {
  console.log('MinimalApp rendering');
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MinimalHomePage />} />
        <Route path="/news" element={<MinimalNewsPage />} />
        <Route path="/dashboard" element={<MinimalDashboardPage />} />
        <Route path="/login" element={<MinimalLoginPage />} />
        <Route path="/register" element={<MinimalRegisterPage />} />
        <Route path="*" element={
          <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <a href="/" className="text-cyan-400 hover:text-cyan-300">← Back to Home</a>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default MinimalApp;
