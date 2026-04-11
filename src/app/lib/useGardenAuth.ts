/**
 * useGardenAuth — resolves Supabase auth session to a public.users Garden profile.
 * Handles returning users, new signups, and the magic link flow.
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
    // Restore session on page load (handles returning users automatically)
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

    // Listen for auth changes: login, logout, magic link callback, token refresh
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
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}${returnTo}` },
    })
    return { error }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setState(prev => ({ ...prev, loading: false, error: error.message }))
    return { error }
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
