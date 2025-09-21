import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// DEBUG: Log all available environment variables
console.log('DEBUG: All environment variables:', import.meta.env);

// Get environment variables - try multiple possible names
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.SUPABASE_URL || 
                    import.meta.env.VITE_SUPABASE_PROJECT_URL ||
                    'https://gfqgjnytfgnpfiquqixt.supabase.co'; // fallback
                    
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                                import.meta.env.SUPABASE_ANON_KEY ||
                                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmcWdqbnl0ZmducGZpcXVxaXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDc0ODgsImV4cCI6MjA2MTc4MzQ4OH0.QHEWlB4k_uka9AZoOHXOCW_tlRahaJcMNY5BAS9yjmI'; // fallback

console.log('DEBUG: Resolved values:', {
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: SUPABASE_PUBLISHABLE_KEY ? 'SET (length: ' + SUPABASE_PUBLISHABLE_KEY.length + ')' : 'NOT SET'
});

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Environment variables detailed check:', {
    'import.meta.env.VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'import.meta.env.SUPABASE_URL': import.meta.env.SUPABASE_URL,
    'import.meta.env.VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'import.meta.env.SUPABASE_ANON_KEY': import.meta.env.SUPABASE_ANON_KEY,
    'Object.keys(import.meta.env)': Object.keys(import.meta.env)
  });
  throw new Error(
    'Missing Supabase environment variables. Available keys: ' + Object.keys(import.meta.env).join(', ')
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
