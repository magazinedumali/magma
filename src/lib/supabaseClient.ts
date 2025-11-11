// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback to hardcoded values for backward compatibility
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zwtdnfmwxddrmmmruaoc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dGRuZm13eGRkcm1tbXJ1YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE2NTksImV4cCI6MjA2MjkwNzY1OX0.NASReESXkS3-GVafOk3uIEMXU4ptV_PApnaflmRHZgs';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);