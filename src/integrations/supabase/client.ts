import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// DEBUG: Log all available environment variables
console.log('DEBUG: All environment variables:', import.meta.env);

// Get environment variables - try multiple possible names
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.SUPABASE_URL || 
                    import.meta.env.VITE_SUPABASE_PROJECT_URL ||
                    ''; // fallback
                    
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                                import.meta.env.SUPABASE_ANON_KEY ||
                                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
                                ''; // fallback

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

export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
