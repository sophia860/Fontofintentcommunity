import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl?.trim() && supabaseAnonKey?.trim()
);

if (!isSupabaseConfigured) {
  console.error(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Ensure both env vars are saved in your Render/GitHub environment and ' +
    'that a new deploy was triggered AFTER saving them. ' +
    'Auth will not work until this is resolved.'
  );
}

// Use placeholder values when unconfigured so the module does not throw at
// import time. The ConfigurationWarning banner in App.tsx surfaces the issue.
export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
  }
);
