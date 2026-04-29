import { useState, useCallback } from 'react'
import { Bell, MapPin, Zap, ArrowRight } from 'lucide-react'
import { useRequests } from '../hooks/useRequests'
import { Avatar } from '../components/ui/Avatar'
import { CategoryTile } from '../components/ui/CategoryTile'
import { Toast } from '../components/ui/Toast'
import { CATEGORY } from '../lib/tokens'
import { timeAgo, minutesLeft } from '../lib/utils'
import { supabase } from '../lib/supabase'
import type { Request } from '../types'

interface HomeScreenProps {
  userId: string
  userName: string
  onShowNotif?: () => void
}

interface ToastState { msg: string; type: 'success' | 'info' | 'error' }

export function HomeScreen({ userId, userName, onShowNotif }: HomeScreenProps) {
  const { requests, loading } = useRequests()
  const [toast, setToast] = useState<ToastState | null>(null)
  const [helping, setHelping] = useState<Set<string>>(new Set())

  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
  }, [])

  async function handleHelp(r: Request) {
    if (helping.has(r.id)) return
    setHelping(prev => new Set(prev).add(r.id))

    const { data, error } = await supabase.rpc('accept_help', {
      p_request_id: r.id,
      p_helper_id: userId,
    })

    setHelping(prev => { const s = new Set(prev); s.delete(r.id); return s })

    if (error) { showToast('Une erreur est survenue.', 'error'); return }

    if (data === 'ok') {
      showToast(`Super ! ${r.author?.name?.split(' ')[0] ?? 'L\'auteur'} va être prévenu·e.`)
    } else if (data === 'already_taken') {
      showToast('Quelqu\'un est déjà en route !', 'info')
    } else if (data === 'expired') {
      showToast('Cette demande a expiré.', 'info')
    }
  }

  const activeRequests = requests.filter(
    r => !r.expires_at || new Date(r.expires_at) > new Date()
  )

  return (
    <div style={{
      background: '#F0EEE9', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Yellow header */}
      <div style={{
        background: '#F6F5AE',
        padding: '56px 22px 26px',
        borderRadius: '0 0 32px 32px',
        position: 'relative', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Live badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#181713', color: '#F6F5AE',
            padding: '5px 12px', borderRadius: 999,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 11,
            letterSpacing: 0.4, textTransform: 'uppercase',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#F6F5AE',
              animation: 'pulse 1.4s infinite',
            }} />
            Live · Ynov Lyon
          </div>

          {/* Bell */}
          <button
            onClick={onShowNotif}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#181713', color: '#F6F5AE',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell size={17} strokeWidth={1.8} color="#F6F5AE" />
            <span style={{
              position: 'absolute', top: 9, right: 10,
              width: 7, height: 7, borderRadius: '50%',
              background: '#F6F5AE',
              border: '1.5px solid #181713',
            }} />
          </button>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 38,
          lineHeight: 0.95, letterSpacing: -1.2,
          marginTop: 18, color: '#181713',
        }}>
          {activeRequests.length === 0
            ? 'Rien pour\nl\'instant'
            : `${activeRequests.length} main${activeRequests.length > 1 ? 's' : ''}\ntendue${activeRequests.length > 1 ? 's' : ''}`
          }
          <span style={{ color: '#181713', opacity: 0.3 }}>.</span>
        </div>
        <div style={{
          marginTop: 10, fontSize: 13, color: 'rgba(24,23,19,0.65)', maxWidth: 280,
        }}>
          {activeRequests.length === 0
            ? 'Le campus est calme. Sois le premier à lancer une demande.'
            : 'Tes camarades ont besoin d\'un coup de pouce, là, maintenant.'
          }
        </div>
      </div>

      {/* Feed */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px 110px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {loading ? (
          <SkeletonFeed />
        ) : activeRequests.length === 0 ? (
          <EmptyFeed name={userName} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeRequests.map((r, i) => (
              <RequestCard
                key={r.id}
                r={r}
                variant={i % 2 === 0 ? 'yellow' : 'white'}
                isHelping={helping.has(r.id)}
                onHelp={() => handleHelp(r)}
              />
            ))}
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

// ── Request Card ──────────────────────────────────────────────

function RequestCard({
  r, variant, isHelping, onHelp,
}: {
  r: Request
  variant: 'yellow' | 'white'
  isHelping: boolean
  onHelp: () => void
}) {
  const yellow = variant === 'yellow'
  const cat = CATEGORY[r.category] ?? CATEGORY.autre
  const mins = r.expires_at ? minutesLeft(r.expires_at) : null

  return (
    <div style={{
      background: yellow ? '#F6F5AE' : '#FAFAF7',
      border: yellow ? 'none' : '1px solid rgba(24,23,19,0.12)',
      borderRadius: 24, padding: '18px 18px 16px',
      animation: 'slide-up .3s ease',
    }}>
      {/* Category + urgency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <CategoryTile cat={r.category} size={36} filled={!yellow} />
        <span style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 12,
          letterSpacing: 0.3, textTransform: 'uppercase',
          color: '#181713',
        }}>
          {cat.label}
        </span>
        <span style={{ flex: 1 }} />
        {r.urgent && mins !== null && mins > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 11,
            padding: '4px 9px', borderRadius: 999,
            background: '#181713', color: '#F6F5AE',
            letterSpacing: 0.3,
          }}>
            <Zap size={11} strokeWidth={2} /> {mins} min
          </span>
        )}
      </div>

      {/* Title */}
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 20,
        lineHeight: 1.15, letterSpacing: -0.4,
        marginBottom: 12, color: '#181713',
      }}>
        {r.title}
      </div>

      {/* Author */}
      {r.author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Avatar name={r.author.name} size={26} />
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#181713' }}>
              {r.author.name.split(' ')[0]}
            </span>
            <span style={{ color: 'rgba(24,23,19,0.6)' }}> · {r.author.filiere}</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        paddingTop: 12,
        borderTop: `1px dashed ${yellow ? 'rgba(24,23,19,0.18)' : 'rgba(24,23,19,0.10)'}`,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#181713' }}>
          <MapPin size={13} strokeWidth={1.7} /> {r.location}
        </span>
        <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(24,23,19,0.3)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'rgba(24,23,19,0.6)' }}>
          {timeAgo(r.created_at)}
        </span>
        <button
          onClick={onHelp}
          disabled={isHelping}
          style={{
            marginLeft: 'auto',
            padding: '9px 14px', borderRadius: 999,
            background: isHelping ? 'rgba(24,23,19,0.15)' : '#181713',
            color: isHelping ? 'rgba(24,23,19,0.4)' : (yellow ? '#F6F5AE' : '#F0EEE9'),
            border: 'none', cursor: isHelping ? 'default' : 'pointer',
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12.5,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all .15s',
          }}
        >
          {isHelping ? 'En cours…' : "J'aide"} {!isHelping && <ArrowRight size={13} />}
        </button>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────
function EmptyFeed({ name }: { name: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>✋</div>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 22, letterSpacing: -0.5,
        marginBottom: 10, color: '#181713',
      }}>
        Le campus est calme, {name.split(' ')[0]}
      </div>
      <div style={{ fontSize: 14, color: 'rgba(24,23,19,0.55)', lineHeight: 1.5, maxWidth: 260 }}>
        Personne n'a encore posté de demande. Lance la tienne !
      </div>
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────
function SkeletonFeed() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          background: i % 2 === 0 ? 'rgba(246,245,174,0.5)' : '#FAFAF7',
          borderRadius: 24, padding: '18px',
          border: i % 2 === 0 ? 'none' : '1px solid rgba(24,23,19,0.08)',
          animation: 'pulse 1.4s infinite',
        }}>
          <div style={{ height: 14, background: 'rgba(24,23,19,0.08)', borderRadius: 7, width: '40%', marginBottom: 12 }} />
          <div style={{ height: 20, background: 'rgba(24,23,19,0.10)', borderRadius: 7, width: '85%', marginBottom: 8 }} />
          <div style={{ height: 14, background: 'rgba(24,23,19,0.06)', borderRadius: 7, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}
