import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

  async function fetchProfile(userId: string): Promise<Profile | null> {
    // Retry up to 3 times — trigger may not have fired yet
    for (let i = 0; i < 3; i++) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) return data as Profile
      await new Promise(r => setTimeout(r, 600))
    }
    return null
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, loading: false })
      } else {
        setState({ user: null, profile: null, loading: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({ user: session.user, profile, loading: false })
      } else {
        setState({ user: null, profile: null, loading: false })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, name: string, filiere: string) {
    return supabase.auth.signInWithOtp({
      email,
      options: {
        data: { name, filiere },
        emailRedirectTo: window.location.origin,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setState({ user: null, profile: null, loading: false })
  }

  function updateProfile(updates: Partial<Profile>) {
    setState(s => ({ ...s, profile: s.profile ? { ...s.profile, ...updates } : s.profile }))
  }

  return { ...state, signIn, signOut, updateProfile }
}
