import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import SourcesPage from './pages/SourcesPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticleDetailPage />} />
            <Route path="/sources" element={<SourcesPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </main>
        <footer className="bg-pastel-gray shadow-soft mt-12 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <span className="text-xl font-bold text-primary">TruthMarket</span>
                <p className="text-sm text-gray-500 mt-1">
                  Using prediction markets to verify news media truth.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  About Us
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  How It Works
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Terms
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Privacy
                </a>
              </div>
            </div>
            <div className="mt-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} TruthMarket. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
