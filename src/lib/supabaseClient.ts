// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwtdnfmwxddrmmmruaoc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dGRuZm13eGRkcm1tbXJ1YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE2NTksImV4cCI6MjA2MjkwNzY1OX0.NASReESXkS3-GVafOk3uIEMXU4ptV_PApnaflmRHZgs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);