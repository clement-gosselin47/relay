import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEV_BYPASS, MOCK_CONVERSATIONS } from '../lib/dev-mock'
import type { Conversation, Message } from '../types'

export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<Conversation[]>(
    DEV_BYPASS ? MOCK_CONVERSATIONS : []
  )
  const [loading, setLoading] = useState(!DEV_BYPASS)

  const fetch = useCallback(async () => {
    if (DEV_BYPASS) return
    const { data } = await supabase
      .from('conversations')
      .select(`
        id, request_id, requester_id, helper_id, created_at,
        request:requests(title),
        requester:requester_id(id, name, filiere),
        helper:helper_id(id, name, filiere),
        messages(id, content, created_at, read, sender_id)
      `)
      .or(`requester_id.eq.${userId},helper_id.eq.${userId}`)

    if (data) {
      const convs: Conversation[] = data.map((c: any) => {
        const msgs: Message[] = [...(c.messages ?? [])].sort(
          (a, b) => b.created_at.localeCompare(a.created_at)
        )
        return {
          ...c,
          last_message: msgs[0] ?? null,
          unread_count: msgs.filter(m => !m.read && m.sender_id !== userId).length,
        }
      }).sort((a, b) => {
        const at = a.last_message?.created_at ?? a.created_at
        const bt = b.last_message?.created_at ?? b.created_at
        return bt.localeCompare(at)
      })
      setConversations(convs)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    if (DEV_BYPASS) return
    fetch()
    const channel = supabase
      .channel(`convs:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetch)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, fetch)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch, userId])

  return { conversations, loading, refresh: fetch }
}
