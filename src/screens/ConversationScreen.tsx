import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, ImagePlus, Paperclip, Smile } from 'lucide-react'
import { useMessages } from '../hooks/useMessages'
import { timeAgo } from '../lib/utils'
import { Avatar } from '../components/ui/Avatar'
import type { Conversation } from '../types'

interface ConversationScreenProps {
  conversation: Conversation
  userId: string
  onBack?: () => void
}

export function ConversationScreen({ conversation, userId, onBack }: ConversationScreenProps) {
  const { messages, loading, sendMessage } = useMessages(conversation.id, userId)
  const [draft, setDraft] = useState('')
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLTextAreaElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

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
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setDraft(e.target.value)
    // Auto-grow textarea
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  // Position fixe pour couvrir la BottomBar mobile, même style que CreateScreen
  const isDesktopMode = !onBack

  const containerStyle: React.CSSProperties = isDesktopMode
    ? { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bone)', fontFamily: "'Geologica', sans-serif" }
    : {
        position: 'fixed',
        top: 0, bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        zIndex: 200, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        background: 'var(--bone)',
        fontFamily: "'Geologica', sans-serif",
      }

  return (
    <div style={containerStyle}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        background: '#F6F5AE',
        paddingTop: isDesktopMode ? 16 : 'calc(env(safe-area-inset-top, 0px) + 14px)',
        paddingBottom: 16,
        paddingLeft: 16, paddingRight: 16,
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(24,23,19,0.10)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#181713', flexShrink: 0,
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>
        )}
        <Avatar name={otherProfile?.name ?? '?'} size={36} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 15, color: '#181713',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {otherProfile?.name?.split(' ')[0] ?? '…'}
            <span style={{ fontWeight: 500, opacity: 0.55, fontSize: 13 }}> · {otherProfile?.filiere}</span>
          </div>
          <div style={{
            fontSize: 11, color: 'rgba(24,23,19,0.55)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginTop: 1,
          }}>
            {conversation.request?.title}
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 14px 8px',
        display: 'flex', flexDirection: 'column', gap: 6,
        WebkitOverflowScrolling: 'touch',
      }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'rgba(var(--ink-rgb),0.3)', fontSize: 13, paddingTop: 48 }}>
            Chargement…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 64 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👋</div>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 15, color: 'var(--ink)', marginBottom: 6,
            }}>
              Dis bonjour à {otherProfile?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.45)' }}>
              La conversation vient de s'ouvrir.
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.sender_id === userId
            const prevSame = i > 0 && messages[i - 1].sender_id === m.sender_id
            const showTime = i === messages.length - 1 ||
              new Date(messages[i + 1].created_at).getTime() - new Date(m.created_at).getTime() > 5 * 60 * 1000

            return (
              <div key={m.id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start',
                marginTop: prevSame ? 2 : 10,
              }}>
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: isMine ? '18px 18px 8px 18px' : '18px 18px 18px 8px',
                  background: isMine ? '#181713' : 'var(--paper)',
                  color: isMine ? '#F6F5AE' : 'var(--ink)',
                  border: isMine ? 'none' : '1px solid rgba(var(--ink-rgb),0.09)',
                  fontSize: 14, lineHeight: 1.5, fontWeight: 300,
                }}>
                  {m.content}
                </div>
                {showTime && (
                  <div style={{
                    fontSize: 10, marginTop: 4,
                    color: 'rgba(var(--ink-rgb),0.3)',
                  }}>
                    {timeAgo(m.created_at)}
                  </div>
                )}
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ──────────────────────────────────── */}
      <div style={{
        background: 'var(--paper)',
        borderTop: '1px solid rgba(var(--ink-rgb),0.07)',
        paddingTop: 10, paddingLeft: 12, paddingRight: 12,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)',
        flexShrink: 0,
      }}>
        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>

          {/* Media buttons */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 4 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
            <MediaBtn icon={<ImagePlus size={18} strokeWidth={1.7} />} onClick={() => fileRef.current?.click()} label="Photo" />
            <MediaBtn icon={<Paperclip size={18} strokeWidth={1.7} />} onClick={() => fileRef.current?.click()} label="Fichier" />
            <MediaBtn icon={<Smile size={18} strokeWidth={1.7} />} onClick={() => {}} label="Emoji" />
          </div>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={draft}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Écrire un message…"
            rows={1}
            style={{
              flex: 1, resize: 'none', overflow: 'hidden',
              background: 'var(--bone)',
              border: '1.5px solid rgba(var(--ink-rgb),0.12)',
              borderRadius: 18, padding: '10px 14px',
              fontFamily: "'Geologica', sans-serif",
              fontWeight: 300, fontSize: 14,
              color: 'var(--ink)', outline: 'none',
              lineHeight: 1.45, minHeight: 40,
            }}
          />

          {/* Send */}
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: draft.trim() ? '#181713' : 'rgba(var(--ink-rgb),0.08)',
              border: 'none', cursor: draft.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: draft.trim() ? '#F6F5AE' : 'rgba(var(--ink-rgb),0.25)',
              transition: 'all .15s',
              marginBottom: 0,
            }}
          >
            <Send size={16} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  )
}

function MediaBtn({ icon, onClick, label }: { icon: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'transparent', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'rgba(var(--ink-rgb),0.45)',
        transition: 'color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(var(--ink-rgb),0.45)')}
    >
      {icon}
    </button>
  )
}
