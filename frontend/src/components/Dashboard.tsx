import React, { useEffect, useState } from 'react';
import { useAuth } from './Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import supabase from '../lib/supabaseClient';
import { getUserMockInterviews } from '../services/mockInterviewService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mockInterviews, setMockInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError(null);
    getUserMockInterviews(user.id)
      .then(data => setMockInterviews(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to your Dashboard!</h1>
      <p>You are logged in as <strong>{user.email}</strong></p>
      <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      <hr style={{ margin: '2rem 0' }} />
      <h2>Your Mock Interviews</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && mockInterviews.length === 0 && <p>No mock interviews found.</p>}
      <ul>
        {mockInterviews.map((interview, idx) => (
          <li key={interview.id || idx}>
            {interview.problem || 'Untitled'} - {interview.created_at}
          </li>
        ))}
      </ul>
    </div>
  );
};


export default Dashboard;
