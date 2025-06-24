import React from 'react';

// Test if the problem is with the AuthContext
const TestAuthContext = () => {
  try {
    console.log('Testing AuthContext import...');
    // We'll import this conditionally
    return <div>AuthContext test</div>;
  } catch (error) {
    console.error('AuthContext error:', error);
    return <div>AuthContext failed</div>;
  }
};

// Test if the problem is with react-router-dom
const TestRouter = () => {
  try {
    console.log('Testing Router import...');
    const { BrowserRouter } = require('react-router-dom');
    return <BrowserRouter><div>Router test</div></BrowserRouter>;
  } catch (error) {
    console.error('Router error:', error);
    return <div>Router failed</div>;
  }
};

const TestImports = () => {
  console.log('TestImports component rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a202c', 
      color: 'white', 
      padding: '2rem' 
    }}>
      <h1>Import Test Page</h1>
      <div style={{ marginTop: '2rem' }}>
        <TestAuthContext />
        <TestRouter />
      </div>
    </div>
  );
};

export default TestImports;
