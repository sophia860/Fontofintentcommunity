/**
 * Site-controller configuration.
 * The admin email identifies the account with full site-controller privileges.
 * Credentials are never stored in code — authentication is handled entirely by Supabase.
 */

export const ADMIN_EMAIL = 'sophiamaybea@gmail.com';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

/** Returns true when the currently signed-in user is the site controller. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsAdmin(data.user?.email === ADMIN_EMAIL);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    });

    return () => subscription.unsubscribe();
  }, []);

  return isAdmin;
}
