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

  if (isDesktop) {
    return (
      <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
        {/* Conversations list */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: '1px solid rgba(var(--ink-rgb),0.08)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <ListHeader count={conversations.length} />
          <ConversationList
            conversations={conversations}
            loading={loading}
            userId={userId}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Conversation view */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {selectedConv ? (
            <ConversationScreen
              conversation={selectedConv}
              userId={userId}
            />
          ) : (
            <EmptyConversation />
          )}
        </div>
      </div>
    )
  }

  // Mobile: stack list ↔ chat
  if (selectedConv) {
    return (
      <div style={{ height: '100%' }}>
        <ConversationScreen
          conversation={selectedConv}
          userId={userId}
          onBack={() => setSelectedId(null)}
        />
      </div>
    )
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--bone)', fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: '#F6F5AE',
        padding: '56px 22px 26px',
        borderRadius: '0 0 32px 32px',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 38,
          lineHeight: 0.95, letterSpacing: -1.2,
          color: '#181713',
        }}>
          Messages
          <span style={{ color: '#181713', opacity: 0.3 }}>.</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: 'rgba(24,23,19,0.65)' }}>
          Tes conversations avec tes aidants.
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 110px' }}>
        <ConversationList
          conversations={conversations}
          loading={loading}
          userId={userId}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  )
}

// ── Subcomponents ─────────────────────────────────────────────

function ListHeader({ count }: { count: number }) {
  return (
    <div style={{
      padding: '20px 20px 12px',
      borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
      flexShrink: 0,
    }}>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 18, color: 'var(--ink)',
        letterSpacing: -0.4,
      }}>
        Messages
      </div>
      <div style={{ fontSize: 12, color: 'rgba(var(--ink-rgb),0.45)', marginTop: 2 }}>
        {count} conversation{count !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

function ConversationList({ conversations, loading, userId, selectedId, onSelect }: {
  conversations: Conversation[]
  loading: boolean
  userId: string
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
            display: 'flex', gap: 12, alignItems: 'center',
            animation: 'pulse 1.4s infinite',
          }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(var(--ink-rgb),0.08)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, background: 'rgba(var(--ink-rgb),0.08)', borderRadius: 6, width: '50%', marginBottom: 8 }} />
              <div style={{ height: 11, background: 'rgba(var(--ink-rgb),0.06)', borderRadius: 6, width: '80%' }} />
            </div>
          </div>
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
        <MessageSquare size={40} strokeWidth={1.2} color="rgba(var(--ink-rgb),0.2)" />
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 18, letterSpacing: -0.4,
          color: 'var(--ink)', marginTop: 16, marginBottom: 8,
        }}>
          Aucun message
        </div>
        <div style={{ fontSize: 13, color: 'rgba(var(--ink-rgb),0.5)', lineHeight: 1.5, maxWidth: 240 }}>
          Aide un camarade et la conversation s'ouvrira ici automatiquement.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {conversations.map(conv => {
        const other = userId === conv.requester_id ? conv.helper : conv.requester
        const isSelected = conv.id === selectedId
        const hasUnread = conv.unread_count > 0

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              background: isSelected ? 'rgba(246,245,174,0.5)' : 'transparent',
              borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
              border: 'none',
              borderLeft: isSelected ? '3px solid #181713' : '3px solid transparent',
              cursor: 'pointer', textAlign: 'left',
              transition: 'background .15s',
              width: '100%',
            }}
          >
            {/* Avatar */}
            <div style={{ flexShrink: 0, position: 'relative' }}>
              <Avatar name={other?.name ?? '?'} size={44} />
              {hasUnread && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#181713',
                  border: '2px solid var(--bone)',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: hasUnread ? 700 : 600, fontSize: 13,
                  color: 'var(--ink)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, marginRight: 8,
                }}>
                  {other?.name?.split(' ')[0] ?? '…'} · {other?.filiere}
                </span>
                {conv.last_message && (
                  <span style={{ fontSize: 11, color: 'rgba(var(--ink-rgb),0.4)', flexShrink: 0 }}>
                    {timeAgo(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(var(--ink-rgb),0.5)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginBottom: 2,
              }}>
                {conv.request?.title}
              </div>
              {conv.last_message && (
                <div style={{
                  fontSize: 12,
                  color: hasUnread ? 'var(--ink)' : 'rgba(var(--ink-rgb),0.45)',
                  fontWeight: hasUnread ? 500 : 300,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {conv.last_message.sender_id === userId ? 'Toi : ' : ''}{conv.last_message.content}
                </div>
              )}
            </div>

            {/* Unread count */}
            {hasUnread && (
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
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
      })}
    </div>
  )
}

function EmptyConversation() {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: 'rgba(var(--ink-rgb),0.3)',
    }}>
      <MessageSquare size={48} strokeWidth={1} />
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 15, marginTop: 16,
        color: 'rgba(var(--ink-rgb),0.4)',
      }}>
        Sélectionne une conversation
      </div>
    </div>
  )
}
