import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1.5rem 2rem' }}>
        <button
          style={{ marginRight: '1rem', padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
        <button
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </header>
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700 }}>Welcome to Cracked</h1>
      </main>
    </div>
  );
};

export default Home;
