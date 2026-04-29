import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
}

async function fetchOrCreateProfile(user: User): Promise<Profile | null> {
  // Try to fetch existing profile
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (data) return data as Profile

  // Profile missing — auto-create from user metadata
  const name = (user.user_metadata?.name as string)
    || user.email?.split('@')[0]
    || 'Utilisateur'
  const filiere = (user.user_metadata?.filiere as string) || ''

  const { data: created } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name,
      email: user.email ?? '',
      filiere,
      skills: [],
      available: false,
      campus_radius: 'campus',
    })
    .select('*')
    .single()

  return (created as Profile) ?? null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, profile: null, loading: true })

  useEffect(() => {
    // Timeout safety — never stuck on splash more than 6s
    const timeout = setTimeout(() => {
      setState(s => s.loading ? { ...s, loading: false } : s)
    }, 6000)

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      clearTimeout(timeout)
      if (error || !session?.user) {
        setState({ user: null, profile: null, loading: false })
        return
      }
      const profile = await fetchOrCreateProfile(session.user)
      setState({ user: session.user, profile, loading: false })
    }).catch(() => {
      clearTimeout(timeout)
      setState({ user: null, profile: null, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user)
        setState({ user: session.user, profile, loading: false })
      } else {
        setState({ user: null, profile: null, loading: false })
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
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
