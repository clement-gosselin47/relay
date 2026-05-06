import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    name: 'Lucas Martin',
    filiere: 'Dev Web',
    lastMessage: 'Merci beaucoup ! Je suis en salle B204',
    lastAt: '14:32',
    unread: 2,
    messages: [
      { id: 'm1', from: 'them', text: 'Salut ! Tu peux vraiment m\'aider avec le câble HDMI ?', at: '14:28' },
      { id: 'm2', from: 'me', text: 'Oui bien sûr, j\'en ai un avec moi', at: '14:30' },
      { id: 'm3', from: 'them', text: 'Merci beaucoup ! Je suis en salle B204', at: '14:32' },
    ],
  },
  {
    id: 'conv-2',
    name: 'Inès Dubois',
    filiere: 'Design UX',
    lastMessage: 'Top, à tout de suite !',
    lastAt: '11:15',
    unread: 0,
    messages: [
      { id: 'm4', from: 'me', text: 'Je peux jeter un œil à ton flow Figma', at: '11:10' },
      { id: 'm5', from: 'them', text: 'Super ! Cafétéria RDC tu es ok ?', at: '11:12' },
      { id: 'm6', from: 'me', text: 'Parfait', at: '11:14' },
      { id: 'm7', from: 'them', text: 'Top, à tout de suite !', at: '11:15' },
    ],
  },
  {
    id: 'conv-3',
    name: 'Tom Lefevre',
    filiere: 'Dev Logiciel',
    lastMessage: 'Le bug venait d\'une dépendance manquante 😅',
    lastAt: 'Hier',
    unread: 0,
    messages: [
      { id: 'm8', from: 'them', text: 'Hé, tu peux regarder mon useEffect bizarre ?', at: 'Hier' },
      { id: 'm9', from: 'me', text: 'Oui je regarde ça', at: 'Hier' },
      { id: 'm10', from: 'them', text: 'Le bug venait d\'une dépendance manquante 😅', at: 'Hier' },
    ],
  },
  {
    id: 'conv-4',
    name: 'Sara Aziz',
    filiere: 'Dev Logiciel',
    lastMessage: 'Je t\'envoie le PDF ce soir',
    lastAt: 'Lun.',
    unread: 0,
    messages: [
      { id: 'm11', from: 'me', text: 'Tu as les notes du cours d\'archi logicielle ?', at: 'Lun.' },
      { id: 'm12', from: 'them', text: 'Oui j\'ai tout !', at: 'Lun.' },
      { id: 'm13', from: 'me', text: 'Super merci !!', at: 'Lun.' },
      { id: 'm14', from: 'them', text: 'Je t\'envoie le PDF ce soir', at: 'Lun.' },
    ],
  },
]

// ── Types ─────────────────────────────────────────────────────
interface Message {
  id: string
  from: 'me' | 'them'
  text: string
  at: string
}

interface Conversation {
  id: string
  name: string
  filiere: string
  lastMessage: string
  lastAt: string
  unread: number
  messages: Message[]
}

// ── Mobile — liste → thread ───────────────────────────────────
export function MessagesScreen() {
  const [selected, setSelected] = useState<Conversation | null>(null)

  if (selected) {
    return (
      <ThreadView
        conv={selected}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div style={{
      background: '#F0EEE9', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: '#F6F5AE',
        padding: '56px 22px 24px',
        borderRadius: '0 0 32px 32px',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 34, letterSpacing: -1,
          lineHeight: 1, color: '#181713',
        }}>
          Messages<span style={{ opacity: 0.3 }}>.</span>
        </div>
        <div style={{ fontSize: 13, color: 'rgba(24,23,19,0.6)', marginTop: 8 }}>
          {MOCK_CONVERSATIONS.filter(c => c.unread > 0).length > 0
            ? `${MOCK_CONVERSATIONS.filter(c => c.unread > 0).length} non lu${MOCK_CONVERSATIONS.filter(c => c.unread > 0).length > 1 ? 's' : ''}`
            : 'Tout lu'}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0 110px' }}>
        {MOCK_CONVERSATIONS.map((conv, i) => (
          <button
            key={conv.id}
            onClick={() => setSelected(conv)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: i < MOCK_CONVERSATIONS.length - 1
                ? '1px solid rgba(24,23,19,0.06)' : 'none',
              textAlign: 'left',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar name={conv.name} size={48} />
              {conv.unread > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#181713', color: '#F6F5AE',
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 700, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #F0EEE9',
                }}>
                  {conv.unread}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'baseline', marginBottom: 3,
              }}>
                <span style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: conv.unread > 0 ? 700 : 600,
                  fontSize: 14.5, color: '#181713',
                }}>
                  {conv.name}
                </span>
                <span style={{ fontSize: 11.5, color: 'rgba(24,23,19,0.4)', flexShrink: 0, marginLeft: 8 }}>
                  {conv.lastAt}
                </span>
              </div>
              <div style={{
                fontSize: 13, color: conv.unread > 0 ? '#181713' : 'rgba(24,23,19,0.5)',
                fontWeight: conv.unread > 0 ? 500 : 300,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {conv.lastMessage}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Mobile thread view ────────────────────────────────────────
function ThreadView({ conv, onBack }: { conv: Conversation; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(conv.messages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {
      id: `m-${Date.now()}`,
      from: 'me',
      text,
      at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  return (
    <div style={{
      background: '#F0EEE9', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Thread header */}
      <div style={{
        background: '#F6F5AE',
        padding: '52px 18px 18px',
        borderRadius: '0 0 24px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#181713', color: '#F6F5AE',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <Avatar name={conv.name} size={36} />
        <div>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 16, color: '#181713',
          }}>
            {conv.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(24,23,19,0.55)' }}>{conv.filiere}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        WebkitOverflowScrolling: 'touch',
      }}>
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar input={input} onChange={setInput} onSend={send} />
    </div>
  )
}

// ── Desktop split view ────────────────────────────────────────
export function MessagesDesktop() {
  const [selected, setSelected] = useState<Conversation>(MOCK_CONVERSATIONS[0])

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden' }}>
      {/* Left — conversation list */}
      <div style={{
        width: 320, flexShrink: 0,
        borderRight: '1px solid rgba(24,23,19,0.08)',
        background: '#FAFAF7',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '28px 20px 16px',
          borderBottom: '1px solid rgba(24,23,19,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 22, letterSpacing: -0.5, color: '#181713',
          }}>
            Messages
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {MOCK_CONVERSATIONS.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px',
                background: selected.id === conv.id ? '#F6F5AE' : 'none',
                border: 'none',
                borderBottom: '1px solid rgba(24,23,19,0.06)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background .12s',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Avatar name={conv.name} size={42} />
                {conv.unread > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#181713', color: '#F6F5AE',
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 700, fontSize: 9,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #FAFAF7',
                  }}>
                    {conv.unread}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2,
                }}>
                  <span style={{
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: conv.unread > 0 ? 700 : 600,
                    fontSize: 13.5, color: '#181713',
                  }}>
                    {conv.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(24,23,19,0.4)', flexShrink: 0, marginLeft: 6 }}>
                    {conv.lastAt}
                  </span>
                </div>
                <div style={{
                  fontSize: 12.5, color: conv.unread > 0 ? '#181713' : 'rgba(24,23,19,0.5)',
                  fontWeight: conv.unread > 0 ? 500 : 300,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {conv.lastMessage}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right — thread */}
      <DesktopThread conv={selected} />
    </div>
  )
}

function DesktopThread({ conv }: { conv: Conversation }) {
  const [messages, setMessages] = useState<Message[]>(conv.messages)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages(conv.messages)
    setInput('')
  }, [conv.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(prev => [...prev, {
      id: `m-${Date.now()}`,
      from: 'me',
      text,
      at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }])
    setInput('')
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: '#F0EEE9', overflow: 'hidden',
    }}>
      {/* Avatar fixe en haut */}
      <div style={{
        flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, padding: '28px 0 16px',
      }}>
        <Avatar name={conv.name} size={64} />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 16, color: '#181713', letterSpacing: -0.3,
          }}>
            {conv.name}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(24,23,19,0.45)', marginTop: 2, fontWeight: 300 }}>
            {conv.filiere}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 28px 16px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8,
      }}>
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <InputBar input={input} onChange={setInput} onSend={send} desktop />
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────
function MessageBubble({ message: m }: { message: Message }) {
  const isMe = m.from === 'me'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isMe ? 'flex-end' : 'flex-start',
    }}>
      <div style={{
        maxWidth: '72%',
        background: isMe ? '#181713' : '#FAFAF7',
        color: isMe ? '#F6F5AE' : '#181713',
        border: isMe ? 'none' : '1px solid rgba(24,23,19,0.10)',
        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 14, lineHeight: 1.45, fontWeight: 300 }}>
          {m.text}
        </div>
        <div style={{
          fontSize: 10.5, marginTop: 4,
          color: isMe ? 'rgba(246,245,174,0.5)' : 'rgba(24,23,19,0.35)',
          textAlign: isMe ? 'right' : 'left',
        }}>
          {m.at}
        </div>
      </div>
    </div>
  )
}

function InputBar({
  input, onChange, onSend, desktop = false,
}: {
  input: string
  onChange: (v: string) => void
  onSend: () => void
  desktop?: boolean
}) {
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }

  return (
    <div style={{
      padding: desktop ? '16px 28px' : '12px 16px',
      paddingBottom: desktop ? '16px' : 'calc(12px + env(safe-area-inset-bottom, 0px))',
      borderTop: '1px solid rgba(24,23,19,0.08)',
      background: '#FAFAF7',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <input
        value={input}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Écris un message…"
        style={{
          flex: 1, border: '1.5px solid rgba(24,23,19,0.12)',
          borderRadius: 999, padding: '10px 16px',
          background: '#F0EEE9', outline: 'none',
          fontFamily: "'Geologica', sans-serif",
          fontWeight: 300, fontSize: 14, color: '#181713',
        }}
      />
      <button
        onClick={onSend}
        disabled={!input.trim()}
        style={{
          width: 40, height: 40, borderRadius: '50%',
          background: input.trim() ? '#181713' : 'rgba(24,23,19,0.12)',
          border: 'none', cursor: input.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background .15s',
        }}
      >
        <Send size={16} strokeWidth={2} color={input.trim() ? '#F6F5AE' : 'rgba(24,23,19,0.3)'} />
      </button>
    </div>
  )
}
