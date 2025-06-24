function SimpleTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a, #581c87, #0f172a)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '3rem' }}>🚀 React is Working!</h1>
      <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>White screen debugging</p>
    </div>
  );
}

export default SimpleTest;
