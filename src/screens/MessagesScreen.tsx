import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { useConversations } from '../hooks/useConversations'
import { ConversationScreen } from './ConversationScreen'
import { Avatar } from '../components/ui/Avatar'
import { timeAgo } from '../lib/utils'
import type { Conversation } from '../types'

interface MessagesScreenProps {
  userId: string
  isDesktop?: boolean
}

export function MessagesScreen({ userId, isDesktop }: MessagesScreenProps) {
  const { conversations, loading } = useConversations(userId)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedConv = conversations.find(c => c.id === selectedId) ?? null

  // ── Desktop : 2 panneaux ────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: '1px solid rgba(var(--ink-rgb),0.08)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          <div style={{
            padding: '20px 20px 14px',
            borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
          }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 17, color: 'var(--ink)', letterSpacing: -0.4,
            }}>
              Messages
            </div>
            <div style={{ fontSize: 12, color: 'rgba(var(--ink-rgb),0.4)', marginTop: 2 }}>
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            loading={loading}
            userId={userId}
            selectedId={selectedId}
            onSelect={setSelectedId}
            isDesktop
          />
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {selectedConv
            ? <ConversationScreen conversation={selectedConv} userId={userId} />
            : <EmptyPanel />
          }
        </div>
      </div>
    )
  }

  // ── Mobile : même structure exacte que HomeScreen ─────────────
  return (
    <div style={{
      background: 'var(--bone)', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Header yellow — identique à HomeScreen */}
      <div style={{
        background: '#F6F5AE',
        padding: '56px 22px 26px',
        borderRadius: '0 0 32px 32px',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 38,
          lineHeight: 0.95, letterSpacing: -1.2, color: '#181713',
        }}>
          Messages<span style={{ color: '#181713', opacity: 0.3 }}>.</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(24,23,19,0.65)' }}>
          {conversations.length > 0
            ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''} en cours.`
            : 'Tes conversations avec tes aidants.'}
        </div>
      </div>

      {/* Liste — même padding que le feed HomeScreen */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px 110px',
        WebkitOverflowScrolling: 'touch',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <ConversationList
          conversations={conversations}
          loading={loading}
          userId={userId}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      {/* Conversation — overlay identique à CreateScreen */}
      {selectedConv && (
        <ConversationScreen
          conversation={selectedConv}
          userId={userId}
          onBack={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

// ── Conversation list ─────────────────────────────────────────

function ConversationList({ conversations, loading, userId, selectedId, onSelect, isDesktop }: {
  conversations: Conversation[]
  loading: boolean
  userId: string
  selectedId: string | null
  onSelect: (id: string) => void
  isDesktop?: boolean
}) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 0 : 12, padding: isDesktop ? 0 : '0' }}>
        {[0, 1, 2].map(i => (
          <SkeletonCard key={i} isDesktop={isDesktop} />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '60px 24px', textAlign: 'center',
      }}>
        <MessageSquare size={40} strokeWidth={1.2} color="rgba(var(--ink-rgb),0.18)" />
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 18, letterSpacing: -0.4,
          color: 'var(--ink)', marginTop: 16, marginBottom: 8,
        }}>
          Aucun message
        </div>
        <div style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.45)', lineHeight: 1.5, maxWidth: 240 }}>
          Aide un camarade et la conversation s'ouvrira ici automatiquement.
        </div>
      </div>
    )
  }

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {conversations.map(conv => (
          <DesktopConvRow
            key={conv.id}
            conv={conv}
            userId={userId}
            isSelected={conv.id === selectedId}
            onSelect={() => onSelect(conv.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {conversations.map(conv => (
        <MobileConvCard
          key={conv.id}
          conv={conv}
          userId={userId}
          onSelect={() => onSelect(conv.id)}
        />
      ))}
    </>
  )
}

// ── Mobile card ───────────────────────────────────────────────

function MobileConvCard({ conv, userId, onSelect }: {
  conv: Conversation; userId: string; onSelect: () => void
}) {
  const other = userId === conv.requester_id ? conv.helper : conv.requester
  const hasUnread = conv.unread_count > 0

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left',
        background: hasUnread ? 'var(--paper)' : 'var(--paper)',
        border: hasUnread
          ? '1.5px solid #181713'
          : '1px solid rgba(var(--ink-rgb),0.10)',
        borderRadius: 20,
        padding: '14px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
    >
      {/* Avatar + dot */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={other?.name ?? '?'} size={46} />
        {hasUnread && (
          <div style={{
            position: 'absolute', top: 1, right: 1,
            width: 11, height: 11, borderRadius: '50%',
            background: '#181713', border: '2px solid var(--paper)',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
          <span style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 13.5, color: 'var(--ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, marginRight: 8,
          }}>
            {other?.name?.split(' ')[0] ?? '…'}
            <span style={{ fontWeight: 500, opacity: 0.5, fontSize: 12 }}> · {other?.filiere}</span>
          </span>
          {conv.last_message && (
            <span style={{ fontSize: 11, color: 'rgba(var(--ink-rgb),0.38)', flexShrink: 0 }}>
              {timeAgo(conv.last_message.created_at)}
            </span>
          )}
        </div>

        <div style={{
          fontSize: 11.5, color: 'rgba(var(--ink-rgb),0.45)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: 4,
        }}>
          {conv.request?.title}
        </div>

        {conv.last_message && (
          <div style={{
            fontSize: 12.5,
            color: hasUnread ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.42)',
            fontWeight: hasUnread ? 500 : 300,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {conv.last_message.sender_id === userId ? 'Toi : ' : ''}
            {conv.last_message.content}
          </div>
        )}
      </div>

      {hasUnread && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#181713', color: '#F6F5AE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 10, flexShrink: 0,
        }}>
          {conv.unread_count > 9 ? '9+' : conv.unread_count}
        </div>
      )}
    </button>
  )
}

// ── Desktop row ───────────────────────────────────────────────

function DesktopConvRow({ conv, userId, isSelected, onSelect }: {
  conv: Conversation; userId: string; isSelected: boolean; onSelect: () => void
}) {
  const other = userId === conv.requester_id ? conv.helper : conv.requester
  const hasUnread = conv.unread_count > 0

  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%', textAlign: 'left', border: 'none',
        borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
        borderLeft: `3px solid ${isSelected ? '#181713' : 'transparent'}`,
        background: isSelected ? 'rgba(246,245,174,0.45)' : 'transparent',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', transition: 'background .15s',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar name={other?.name ?? '?'} size={40} />
        {hasUnread && (
          <div style={{
            position: 'absolute', top: 0, right: 0,
            width: 9, height: 9, borderRadius: '50%',
            background: '#181713', border: '2px solid var(--paper)',
          }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: hasUnread ? 700 : 600, fontSize: 12.5, color: 'var(--ink)',
          }}>
            {other?.name?.split(' ')[0] ?? '…'}
          </span>
          {conv.last_message && (
            <span style={{ fontSize: 10.5, color: 'rgba(var(--ink-rgb),0.38)' }}>
              {timeAgo(conv.last_message.created_at)}
            </span>
          )}
        </div>
        <div style={{
          fontSize: 11, color: 'rgba(var(--ink-rgb),0.4)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
        }}>
          {conv.request?.title}
        </div>
        {conv.last_message && (
          <div style={{
            fontSize: 12, fontWeight: hasUnread ? 500 : 300,
            color: hasUnread ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.4)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {conv.last_message.sender_id === userId ? 'Toi : ' : ''}
            {conv.last_message.content}
          </div>
        )}
      </div>
    </button>
  )
}

// ── Skeleton ──────────────────────────────────────────────────

function SkeletonCard({ isDesktop }: { isDesktop?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: isDesktop ? '12px 16px' : '14px 16px',
      borderBottom: isDesktop ? '1px solid rgba(var(--ink-rgb),0.06)' : 'none',
      borderRadius: isDesktop ? 0 : 20,
      background: isDesktop ? 'transparent' : 'var(--paper)',
      animation: 'pulse 1.4s infinite',
    }}>
      <div style={{ width: isDesktop ? 40 : 46, height: isDesktop ? 40 : 46, borderRadius: '50%', background: 'rgba(var(--ink-rgb),0.07)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 12, background: 'rgba(var(--ink-rgb),0.07)', borderRadius: 6, width: '45%', marginBottom: 8 }} />
        <div style={{ height: 11, background: 'rgba(var(--ink-rgb),0.05)', borderRadius: 6, width: '75%' }} />
      </div>
    </div>
  )
}

// ── Desktop empty state ───────────────────────────────────────

function EmptyPanel() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'rgba(var(--ink-rgb),0.25)',
    }}>
      <MessageSquare size={44} strokeWidth={1} />
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 14, marginTop: 14,
        color: 'rgba(var(--ink-rgb),0.35)',
      }}>
        Sélectionne une conversation
      </div>
    </div>
  )
}
