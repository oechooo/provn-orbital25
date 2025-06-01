import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SimpleTest from './pages/SimpleTest';

function App() {
  return (
    <div>
      <h1>App is loading...</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimpleTest />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
                <span className="text-xl font-bold text-primary">Provn.io</span>
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
              © {new Date().getFullYear()} Provn.io. All rights reserved.
            </div>
          </div>
        </footer>
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
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
