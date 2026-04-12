import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl?.trim() && supabaseAnonKey?.trim()
);

// Fail loudly at boot if env vars are missing — no silent placeholder fallback.
// If this fires on Render, the fix is: set the vars in Environment → save →
// then trigger a fresh Manual Deploy (Vite bakes import.meta.env at build time).
if (!isSupabaseConfigured) {
  console.error(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Ensure both env vars are saved in your Render/GitHub environment and ' +
    'that a new deploy was triggered AFTER saving them. ' +
    'Auth will not work until this is resolved.'
  );
}

export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: localStorage,
    },
  }
);
