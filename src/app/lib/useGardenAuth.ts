/**
 * useGardenAuth — resolves Supabase auth session to a public.users Garden profile.
 * Handles returning users, new signups, and the magic link flow.
 *
 * Fixes applied:
 * - signInWithPassword now maps Supabase error codes to writer-friendly messages
 * - "Invalid login credentials" is caught and explains the magic-link-first model
 * - isAuthenticated and loading states are kept consistent during sign-in
 */
import { useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface GardenUser {
  id: string
  auth_id: string
  email: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  bio: string | null
  role: string
  tier: string
  profile_image_url: string | null
  is_anonymous: boolean
  has_completed_onboarding: boolean
  created_at: string
}

export interface GardenAuthState {
  session: Session | null
  authUser: User | null
  gardenUser: GardenUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

/**
 * Maps raw Supabase auth error messages to writer-friendly copy.
 * Supabase returns "Invalid login credentials" for both wrong password
 * AND for accounts that were created via magic link (no password set).
 */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials') || m.includes('invalid credentials')) {
    return 'Those details don\'t match our records. If you joined via an email link, use the "Email link" tab above — you may not have a password set yet.'
  }
  if (m.includes('email not confirmed')) {
    return 'Please confirm your email first. Check your inbox for a sign-in link from The Garden.'
  }
  if (m.includes('too many requests') || m.includes('rate limit')) {
    return 'Too many attempts — please wait a minute before trying again.'
  }
  if (m.includes('user not found')) {
    return 'No Garden account found for that email. Try requesting an email link instead.'
  }
  return message
}

export function useGardenAuth() {
  const [state, setState] = useState<GardenAuthState>({
    session: null,
    authUser: null,
    gardenUser: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  })

  const fetchGardenUser = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_my_profile')
      if (error) throw error
      if (data && data.length > 0) {
        setState(prev => ({ ...prev, gardenUser: data[0], error: null }))
      } else {
        setState(prev => ({ ...prev, gardenUser: null }))
      }
    } catch (err: any) {
      console.error('[useGardenAuth] profile fetch failed:', err)
    }
  }, [])

  useEffect(() => {
    // Restore session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        authUser: session?.user ?? null,
        isAuthenticated: !!session,
        loading: !!session,
      }))
      if (session) {
        fetchGardenUser().finally(() =>
          setState(prev => ({ ...prev, loading: false }))
        )
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          authUser: session?.user ?? null,
          isAuthenticated: !!session,
          gardenUser: session ? prev.gardenUser : null,
          loading: !!session,
        }))
        if (session) {
          await fetchGardenUser()
          setState(prev => ({ ...prev, loading: false }))
        }
        if (event === 'SIGNED_OUT') {
          setState({
            session: null,
            authUser: null,
            gardenUser: null,
            loading: false,
            error: null,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchGardenUser])

  const signInWithMagicLink = useCallback(async (email: string, returnTo = '/') => {
    const base = import.meta.env.BASE_URL ?? '/'
    const callbackPath = base.replace(/\/$/, '') + '/auth/callback'
    const callback = new URL(callbackPath, window.location.origin)
    callback.searchParams.set('returnTo', returnTo)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback.toString() },
    })
    return { error }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const friendly = friendlyAuthError(error.message)
      setState(prev => ({ ...prev, loading: false, error: friendly }))
      // Return an error object with the friendly message so AuthPage can show it
      return { error: { ...error, message: friendly } }
    }
    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    ...state,
    signInWithMagicLink,
    signInWithPassword,
    signOut,
    refreshProfile: fetchGardenUser,
  }
}
