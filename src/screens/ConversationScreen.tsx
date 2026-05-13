import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { useMessages } from '../hooks/useMessages'
import { timeAgo } from '../lib/utils'
import type { Conversation } from '../types'

interface ConversationScreenProps {
  conversation: Conversation
  userId: string
  onBack?: () => void
}

export function ConversationScreen({ conversation, userId, onBack }: ConversationScreenProps) {
  const { messages, loading, sendMessage } = useMessages(conversation.id, userId)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const otherProfile = userId === conversation.requester_id
    ? conversation.helper
    : conversation.requester

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', background: 'var(--bone)',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 16px 14px',
        borderBottom: '1px solid rgba(var(--ink-rgb),0.08)',
        background: 'var(--paper)', flexShrink: 0,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--bone)', border: '1px solid rgba(var(--ink-rgb),0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--ink)', flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 14, color: 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {otherProfile?.name ?? '…'}
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: 1,
          }}>
            {conversation.request?.title}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '16px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        WebkitOverflowScrolling: 'touch',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(var(--ink-rgb),0.35)', fontSize: 13, paddingTop: 40 }}>
            Chargement…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'rgba(var(--ink-rgb),0.35)', fontSize: 13, paddingTop: 40 }}>
            Dis bonjour à {otherProfile?.name?.split(' ')[0]} 👋
          </div>
        ) : (
          messages.map(m => {
            const isMine = m.sender_id === userId
            return (
              <div key={m.id} style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '72%',
                  padding: '10px 14px',
                  borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'var(--ink)' : 'var(--paper)',
                  color: isMine ? '#F6F5AE' : 'var(--ink)',
                  border: isMine ? 'none' : '1px solid rgba(var(--ink-rgb),0.10)',
                  fontSize: 14, lineHeight: 1.45,
                  fontWeight: 300,
                }}>
                  <div>{m.content}</div>
                  <div style={{
                    fontSize: 10, marginTop: 4,
                    color: isMine ? 'rgba(246,245,174,0.5)' : 'rgba(var(--ink-rgb),0.35)',
                    textAlign: 'right',
                  }}>
                    {timeAgo(m.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 14px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        borderTop: '1px solid rgba(var(--ink-rgb),0.08)',
        background: 'var(--paper)',
        display: 'flex', alignItems: 'flex-end', gap: 10, flexShrink: 0,
      }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message…"
          rows={1}
          style={{
            flex: 1, resize: 'none',
            background: 'var(--bone)',
            border: '1.5px solid rgba(var(--ink-rgb),0.12)',
            borderRadius: 14, padding: '10px 14px',
            fontFamily: "'Geologica', sans-serif",
            fontWeight: 300, fontSize: 14,
            color: 'var(--ink)', outline: 'none',
            lineHeight: 1.4, maxHeight: 100, overflowY: 'auto',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: draft.trim() ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.10)',
            border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: draft.trim() ? '#F6F5AE' : 'rgba(var(--ink-rgb),0.3)',
            transition: 'all .15s',
          }}
        >
          <Send size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
