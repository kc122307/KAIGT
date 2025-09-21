import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables - Vercel requires VITE_ prefix for client-side access
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Environment variables check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
  });
  throw new Error(
    'Missing Supabase environment variables. In Vercel, please set: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (with VITE_ prefix for client access)'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
