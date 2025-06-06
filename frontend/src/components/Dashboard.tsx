import React, { useEffect, useState } from 'react';
import { useAuth } from './Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserMockInterviews } from '../services/mockInterviewService';
import { Settings } from 'lucide-react';
import { DataTable } from './DataTable';
import { columns } from './Columns';
import { Button } from './ui/button';
import { MockInterview } from '../types';
import { useTheme } from './theme-provider';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // change logo based on selected theme
  const getLogoSrc = () => {
    if (theme === 'system') {
      // check if system preference is dark
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDarkMode) {
        return "/assets/images/cracked_logo_light.png";
      } else {
        return "/assets/images/cracked_logo_dark.png";
      }
    }

    if (theme === 'dark') {
      return "/assets/images/cracked_logo_light.png";
    } else {
      return "/assets/images/cracked_logo_dark.png";
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }
    setDataLoading(true);
    setError(null);
    getUserMockInterviews(user.id)
      .then(data => setMockInterviews(data))
      .catch(err => setError(err.message))
      .finally(() => setDataLoading(false));
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading auth...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b">
        <div className="w-full max-w-[2000px] mx-auto flex h-16 items-center px-10 sm:px-12">
          <div className="flex items-center">
            <img
              src={getLogoSrc()}
              alt="Cracked Logo"
              className="h-12 w-auto mr-1"
            />
            <h1 className="text-xl font-bold tracking-tight">cracked</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full max-w-[2000px] mx-auto py-6 px-10 sm:px-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Your Interview History</h2>
        </div>

        {/* Loading and Error States */}
        {dataLoading && <div className="text-center py-8">Loading your interviews...</div>}
        {error && <div className="text-center py-8 text-destructive">{error}</div>}

        {/* Data Table */}
        {!dataLoading && !error && (
          <div className="rounded-md border bg-card">
            {mockInterviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No interviews found.</p>
                <p className="mt-2">Start your first interview to get feedback on your coding skills.</p>
              </div>
            ) : (
              <DataTable columns={columns} data={mockInterviews} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="w-full max-w-[2000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 text-sm text-muted-foreground">
          <p> 2025 Cracked. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Help
            </a>
            <a href="#" className="hover:underline">
              About Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
