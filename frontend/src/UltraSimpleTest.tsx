import React from 'react';

// Ultra-simple test with no dependencies
const UltraSimpleTest: React.FC = () => {
  console.log('UltraSimpleTest rendering');
  
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#00ff00' }}>
        🟢 ULTRA SIMPLE TEST
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
        If you can see this green text, the basic rendering is working!
      </p>
      
      <div style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #00ff00'
      }}>
        <h2 style={{ color: '#00ff00', marginBottom: '1rem' }}>Navigation Links (No Router)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => alert('News clicked!')}
            style={{
              backgroundColor: '#0066cc',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📰 News
          </button>
          <button 
            onClick={() => alert('Dashboard clicked!')}
            style={{
              backgroundColor: '#cc6600',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => alert('Login clicked!')}
            style={{
              backgroundColor: '#006600',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔐 Login
          </button>
          <button 
            onClick={() => alert('Register clicked!')}
            style={{
              backgroundColor: '#660066',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📝 Register
          </button>
        </div>
      </div>
      
      <div style={{
        marginTop: '2rem',
        backgroundColor: '#2a2a2a',
        padding: '15px',
        borderRadius: '8px'
      }}>
        <h3 style={{ color: '#ffff00' }}>System Status:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ color: '#00ff00' }}>✅ React is rendering</li>
          <li style={{ color: '#00ff00' }}>✅ JavaScript is working</li>
          <li style={{ color: '#00ff00' }}>✅ Styling is applied</li>
          <li style={{ color: '#00ff00' }}>✅ Event handlers work</li>
        </ul>
      </div>
      
      <p style={{ marginTop: '2rem', color: '#888' }}>
        Current time: {new Date().toLocaleString()}
      </p>
    </div>
  );
};

export default UltraSimpleTest;
