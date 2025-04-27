import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing environment variables');
} else {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
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
                detectSessionInUrl: false,
            },
        });
        console.log("Supabase client initialized for extension.");
    } catch (error) {
        console.error("Failed to initialize Supabase client for extension:", error);
        supabase = null;
    }
}

export default supabase;

