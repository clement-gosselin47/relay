import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

export function useMessages(conversationId: string | null, userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const markRead = useCallback(async () => {
    if (!conversationId) return
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false)
  }, [conversationId, userId])

  useEffect(() => {
    if (!conversationId) { setMessages([]); return }
    setLoading(true)

    supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data)
        setLoading(false)
        markRead()
      })

    const channel = supabase
      .channel(`msgs:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message])
        if (payload.new.sender_id !== userId) markRead()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, userId, markRead])

  async function sendMessage(content: string) {
    if (!conversationId || !content.trim()) return
    const { data } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: userId, content: content.trim() })
      .select()
      .single()
    if (data) setMessages(prev => [...prev, data])
  }

  return { messages, loading, sendMessage }
}
