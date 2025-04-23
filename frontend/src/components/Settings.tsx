import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "./theme-provider"
import supabase from '../lib/supabaseClient';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="w-full max-w-[2000px] mx-auto flex h-16 items-center px-10 sm:px-12">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold tracking-tight hover:opacity-80"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="w-full max-w-[2000px] mx-auto py-12 px-10 sm:px-12">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <h2 className="text-lg font-semibold">Theme</h2>
              <p className="text-sm text-muted-foreground">Customize the appearance of the app</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <h2 className="text-lg font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>
              Log Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;