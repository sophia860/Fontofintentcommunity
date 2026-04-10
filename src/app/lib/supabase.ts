import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://snulcgtnlurperqqkaps.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNudWxjZ3RubHVycGVycXFrYXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NjU4NTgsImV4cCI6MjA4NjE0MTg1OH0.eeR66DGAzaD0rvSnyXOmLQJCLCOXA_dzvYr1JX6kEfk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
