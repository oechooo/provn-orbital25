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

export default App;
