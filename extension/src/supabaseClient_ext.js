import { createClient } from '@supabase/supabase-js';

// Read values injected by the Vite build process from .env files
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

// Check if the environment variables were loaded correctly
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing. ' +
    'Ensure they are defined in your .env file and the build process is configured correctly.'
  );
} else {
  try {
    // Initialize the Supabase client for the extension
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        // Use chrome.storage.local for session persistence within the extension.
        storage: {
          getItem: async (key) => {
            const result = await chrome.storage.local.get(key);
            return result?.[key] ?? null;
          },
          setItem: async (key, value) => {
            await chrome.storage.local.set({ [key]: value });
          },
          removeItem: async (key) => {
            await chrome.storage.local.remove(key);
          },
        },
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // Should be false for extensions
      },
    });
    console.log("Supabase client initialized for extension.");

  } catch (error) {
    console.error("Failed to initialize Supabase client for extension:", error);
    supabase = null; // Ensure supabase is null if initialization fails
  }
}

// Export the initialized client (or null if it failed)
export default supabase;
