import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/SimpleAuthContext';
import SimpleHomePage from './SimpleHomePage';

function WorkingApp() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          {/* Simple Navbar */}
          <nav className="glass-card mx-4 mt-4 sm:mx-6 lg:mx-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                    Provn.io
                  </span>
                </div>
                <div className="hidden md:flex space-x-8">
                  <a href="/" className="text-slate-300 hover:text-white transition-colors duration-200">Home</a>
                  <a href="/news" className="text-slate-300 hover:text-white transition-colors duration-200">News</a>
                  <a href="/dashboard" className="text-slate-300 hover:text-white transition-colors duration-200">Dashboard</a>
                </div>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200">
                    Login
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-200">
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </nav>

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<SimpleHomePage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="glass-card mx-4 mb-4 sm:mx-6 lg:mx-8 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">                <div className="mb-4 md:mb-0">
                  <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Provn.io</span>
                  <p className="text-sm text-slate-300 mt-1">
                    Using prediction markets to verify news media truth.
                  </p>
                </div>
                <div className="text-sm text-slate-400">
                  © 2025 Provn.io. Modern interface ready.
                </div>
              </div>
            </div>
          </footer>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default WorkingApp;
