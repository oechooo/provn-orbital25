import { BrowserRouter } from 'react-router-dom';

function TestApp() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎯 App Structure Test</h1>
          <p className="text-xl opacity-80">Routing and Tailwind working</p>
          <div className="mt-8 p-6 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <p className="text-lg">Glassmorphism effect working</p>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default TestApp;
