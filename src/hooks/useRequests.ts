import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Request } from '../types'

export function useRequests() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('requests')
      .select('*, author:profiles(id,name,email,filiere)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    if (data) setRequests(data as Request[])
    setLoading(false)
  }, [])

  // Expire cards client-side whose expires_at has passed
  const pruneExpired = useCallback(() => {
    setRequests(prev =>
      prev.filter(r => !r.expires_at || new Date(r.expires_at) > new Date())
    )
  }, [])

  useEffect(() => {
    fetchRequests()

    // Prune expired every 30s
    const interval = setInterval(pruneExpired, 30_000)

    // Realtime subscription
    const channel = supabase
      .channel('requests-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' },
        async (payload) => {
          // Fetch full row with author
          const { data } = await supabase
            .from('requests')
            .select('*, author:profiles(id,name,email,filiere)')
            .eq('id', payload.new.id)
            .single()
          if (data) setRequests(prev => [data as Request, ...prev])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests' },
        (payload) => {
          const updated = payload.new as Request
          if (updated.status !== 'active') {
            // Remove from feed with fade animation flag
            setRequests(prev => prev.filter(r => r.id !== updated.id))
          }
        }
      )
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [fetchRequests, pruneExpired])

  return { requests, loading }
}
