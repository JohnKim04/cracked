import React, { useEffect } from 'react';
import { useAuth } from './Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>You are logged in as <strong>{user.email}</strong></p>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </div>
  );
};

export default Dashboard;
