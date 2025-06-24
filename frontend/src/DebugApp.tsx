import React from 'react';

const DebugApp: React.FC = () => {
  console.log('DebugApp component is rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a202c', 
      color: 'white', 
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Debug Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ 
        backgroundColor: '#2d3748', 
        padding: '1rem', 
        borderRadius: '0.5rem',
        marginTop: '1rem'
      }}>
        <h2>System Check:</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ Basic styling is working</li>
          <li>✅ Component is mounted</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugApp;
