import React, { useState } from 'react';
import supabase from '../../lib/supabaseClient';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google'
    });

    if (signInError) {
      throw signInError;
    }

    } catch (catchError: any) {
      console.error('Error initiating Google OAuth login:', catchError);
      setError(catchError.error_description || catchError.message || 'Failed to start Google Login');
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ textAlign: 'center', paddingTop: '50px' }}> {/* Basic styling */}
      <h2>Login / Sign Up</h2>
      <p style={{ marginBottom: '20px' }}>Please sign in using your Google account.</p>
      <button
        onClick={handleGoogleLogin}
        className="login-button google-login-button" // Add specific class for styling if needed
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }} // Basic styling
      >
        {loading ? 'Redirecting...' : 'Sign in with Google'}
      </button>
      {error && <div className="login-error" style={{ color: 'red', marginTop: '15px' }}>{error}</div>}
      {/* Success message removed as redirect handles flow */}
    </div>
  );
};

export default Login;
