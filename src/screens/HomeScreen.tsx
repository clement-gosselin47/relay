import { useState, useCallback } from 'react'
import { Toast } from '../components/ui/Toast'
import { RequestCard } from '../components/ui/RequestCard'
import { supabase } from '../lib/supabase'
import type { Request } from '../types'

interface HomeScreenProps {
  userId: string
  userName: string
  requests: Request[]
  loading: boolean
  onNavigateToMessages?: () => void
}

interface ToastState { msg: string; type: 'success' | 'info' | 'error' }

export function HomeScreen({ userId, userName, requests, loading, onNavigateToMessages }: HomeScreenProps) {
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
      await supabase.from('conversations').upsert(
        { request_id: r.id, requester_id: r.author_id, helper_id: userId },
        { onConflict: 'request_id,helper_id', ignoreDuplicates: true }
      )
      showToast(`Super ! ${r.author?.name?.split(' ')[0] ?? 'L\'auteur'} va être prévenu·e.`)
      onNavigateToMessages?.()
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
      background: 'var(--bone)', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* Yellow header */}
      <div style={{
        background: '#F6F5AE',
        padding: '26px 20px 12px',
        borderRadius: '0 0 24px 24px',
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

        </div>

        {/* Title */}
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 28,
          lineHeight: 0.95, letterSpacing: -0.8,
          marginTop: 8, color: '#181713',
        }}>
          {activeRequests.length === 0
            ? 'Rien pour\nl\'instant'
            : `${activeRequests.length} main${activeRequests.length > 1 ? 's' : ''}\ntendue${activeRequests.length > 1 ? 's' : ''}`
          }
          <span style={{ color: '#181713', opacity: 0.3 }}>.</span>
        </div>
        <div style={{
          marginTop: 4, fontSize: 12, color: 'rgba(24,23,19,0.65)', maxWidth: 280,
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
        padding: '14px 14px 100px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {loading ? (
          <SkeletonFeed />
        ) : activeRequests.length === 0 ? (
          <EmptyFeed name={userName} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        marginBottom: 10, color: 'var(--ink)',
      }}>
        Le campus est calme, {name.split(' ')[0]}
      </div>
      <div style={{ fontSize: 14, color: `rgba(var(--ink-rgb),0.55)`, lineHeight: 1.5, maxWidth: 260 }}>
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
          background: i % 2 === 0 ? 'rgba(246,245,174,0.5)' : 'var(--paper)',
          borderRadius: 24, padding: '18px',
          border: i % 2 === 0 ? 'none' : `1px solid rgba(var(--ink-rgb),0.08)`,
          animation: 'pulse 1.4s infinite',
        }}>
          <div style={{ height: 14, background: `rgba(var(--ink-rgb),0.08)`, borderRadius: 7, width: '40%', marginBottom: 12 }} />
          <div style={{ height: 20, background: `rgba(var(--ink-rgb),0.10)`, borderRadius: 7, width: '85%', marginBottom: 8 }} />
          <div style={{ height: 14, background: `rgba(var(--ink-rgb),0.06)`, borderRadius: 7, width: '60%' }} />
        </div>
      ))}
    </div>
  )
}
