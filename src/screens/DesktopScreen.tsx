import { useState, useCallback } from 'react'
import { Home, User, MessageSquare, Search, Settings } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { ProfileScreen } from './ProfileScreen'
import { MessagesScreen } from './MessagesScreen'
import { Avatar } from '../components/ui/Avatar'
import { RequestCard } from '../components/ui/RequestCard'
import { Toggle } from '../components/ui/Toggle'
import { Toast } from '../components/ui/Toast'
import { useRequests } from '../hooks/useRequests'
import { supabase } from '../lib/supabase'
import { timeAgo } from '../lib/utils'
import type { Profile, Request } from '../types'

type Screen = 'home' | 'messages' | 'profile' | 'settings'
interface ToastState { msg: string; type: 'success' | 'info' | 'error' }

interface DesktopScreenProps {
  profile: Profile
  onUpdate: (u: Partial<Profile>) => void
  onSignOut: () => void
}

export function DesktopScreen({ profile, onUpdate, onSignOut }: DesktopScreenProps) {
  const { theme } = useTheme()
  const [screen, setScreen]   = useState<Screen>('home')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast]     = useState<ToastState | null>(null)
  const [search, setSearch]   = useState('')
  const [helping, setHelping] = useState<Set<string>>(new Set())
  const { requests, loading } = useRequests()

  const showToast = useCallback((msg: string, type: ToastState['type'] = 'success') => {
    setToast({ msg, type })
  }, [])

  async function handleHelp(r: Request) {
    if (helping.has(r.id)) return
    setHelping(prev => new Set(prev).add(r.id))
    const { data, error } = await supabase.rpc('accept_help', {
      p_request_id: r.id,
      p_helper_id: profile.id,
    })
    setHelping(prev => { const s = new Set(prev); s.delete(r.id); return s })
    if (error) { showToast('Erreur.', 'error'); return }
    if (data === 'ok') {
      await supabase.from('conversations').upsert(
        { request_id: r.id, requester_id: r.author_id, helper_id: profile.id },
        { onConflict: 'request_id,helper_id', ignoreDuplicates: true }
      )
      showToast(`Super ! ${r.author?.name?.split(' ')[0] ?? 'L\'auteur'} va être prévenu·e.`)
      setScreen('messages')
    } else if (data === 'already_taken') showToast('Quelqu\'un est déjà en route !', 'info')
    else if (data === 'expired') showToast('Cette demande a expiré.', 'info')
  }

  const filtered = requests.filter(r => {
    const now = new Date()
    if (r.expires_at && new Date(r.expires_at) < now) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{
      display: 'flex', height: '100svh', background: 'var(--bone)',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* ── SIDEBAR ──────────────────────────── */}
      <div style={{
        width: 260, flexShrink: 0,
        background: 'var(--paper)',
        borderRight: `1px solid rgba(var(--ink-rgb),0.08)`,
        display: 'flex', flexDirection: 'column',
        padding: '32px 20px 24px',
        position: 'sticky', top: 0, height: '100svh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <button
          onClick={() => { setScreen('home'); setShowCreate(false) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: 32, display: 'flex', alignItems: 'center',
          }}
        >
          <img
            src={theme === 'dark' ? '/logo-t-color.png' : '/logo-t-black.png'}
            alt="Relay"
            style={{ height: 48, width: 'auto' }}
          />
        </button>

        {/* Flash request FAB */}
        <button
          onClick={() => setShowCreate(true)}
          style={{
            width: '100%', padding: '14px 16px',
            background: '#F6F5AE',
            border: '1.5px solid #181713',
            borderRadius: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 14, color: '#181713',
            marginBottom: 28, transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EDEC7A' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F6F5AE' }}
        >
          <img src="/logo-t-black.png" alt="" style={{ height: 20, width: 'auto' }} />
          Demande flash
        </button>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <SideNavItem
            icon={<Home size={18} strokeWidth={screen === 'home' ? 2.2 : 1.7} />}
            label="Accueil"
            active={screen === 'home' && !showCreate}
            onClick={() => { setScreen('home'); setShowCreate(false) }}
          />
          <SideNavItem
            icon={<MessageSquare size={18} strokeWidth={screen === 'messages' ? 2.2 : 1.7} />}
            label="Messages"
            active={screen === 'messages'}
            onClick={() => { setScreen('messages'); setShowCreate(false) }}
          />
          <SideNavItem
            icon={<User size={18} strokeWidth={screen === 'profile' ? 2.2 : 1.7} />}
            label="Profil"
            active={screen === 'profile'}
            onClick={() => { setScreen('profile'); setShowCreate(false) }}
          />
          <SideNavItem
            icon={<Settings size={18} strokeWidth={screen === 'settings' ? 2.2 : 1.7} />}
            label="Paramètres"
            active={screen === 'settings'}
            onClick={() => { setScreen('settings'); setShowCreate(false) }}
          />
        </nav>

        {/* Availability toggle */}
        <div style={{
          background: profile.available ? '#F6F5AE' : `rgba(var(--ink-rgb),0.05)`,
          border: `1.5px solid ${profile.available ? '#181713' : `rgba(var(--ink-rgb),0.10)`}`,
          borderRadius: 16, padding: '14px 14px',
          marginTop: 20, marginBottom: 16,
          color: profile.available ? '#181713' : 'var(--ink)',
          transition: 'all .25s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13,
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: profile.available ? '#3a8a4a' : 'rgba(var(--ink-rgb),0.35)',
                  boxShadow: profile.available ? '0 0 0 3px rgba(58,138,74,0.18)' : 'none',
                  flexShrink: 0,
                }} />
                {profile.available ? 'Disponible' : 'Hors-ligne'}
              </span>
            </span>
            <Toggle darkTrack on={profile.available} onChange={async v => {
              onUpdate({ available: v })
              await supabase.from('profiles').update({ available: v }).eq('id', profile.id)
            }} />
          </div>
          <div style={{ fontSize: 11.5, color: profile.available ? 'rgba(24,23,19,0.72)' : `rgba(var(--ink-rgb),0.55)` }}>
            {profile.available ? 'Visible sur le campus' : 'Hors du radar'}
          </div>
        </div>

        {/* Mini profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          paddingTop: 12,
          borderTop: `1px solid rgba(var(--ink-rgb),0.08)`,
        }}>
          <button
            onClick={() => { setScreen('profile'); setShowCreate(false) }}
            style={{
              flex: 1, minWidth: 0,
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 12,
              background: 'transparent', border: '1px solid transparent',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <Avatar name={profile.name} size={44} url={profile.avatar_url} />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 13,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {profile.name}
              </div>
              <div style={{ fontSize: 11, color: `rgba(var(--ink-rgb),0.5)`, marginTop: 1 }}>
                {profile.filiere}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────────── */}
      {screen === 'profile' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ProfileScreen
            profile={profile}
            onUpdate={onUpdate}
            onSignOut={onSignOut}
            isDesktop
          />
        </div>
      ) : screen === 'messages' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MessagesScreen userId={profile.id} isDesktop />
        </div>
      ) : screen === 'settings' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SettingsScreen
            profile={profile}
            onUpdate={onUpdate}
            onSignOut={onSignOut}
            isDesktop
          />
        </div>
      ) : (
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
        {/* Search + filters */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 14,
          }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--paper)',
              border: `1.5px solid rgba(var(--ink-rgb),0.12)`,
              borderRadius: 14, padding: '12px 16px',
            }}>
              <Search size={16} strokeWidth={1.7} color={`rgba(var(--ink-rgb),0.4)`} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une demande…"
                style={{
                  border: 'none', background: 'none', outline: 'none',
                  fontFamily: "'Geologica', sans-serif",
                  fontWeight: 300, fontSize: 14, color: 'var(--ink)',
                  flex: 1,
                }}
              />
            </div>
            <div style={{
              background: '#F6F5AE', border: '1.5px solid #181713',
              borderRadius: 14, padding: '12px 16px',
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 12, color: '#181713',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#181713', animation: 'pulse 1.4s infinite',
              }} />
              {filtered.length} demande{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: `rgba(var(--ink-rgb),0.4)` }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✋</div>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 24, letterSpacing: -0.5, marginBottom: 8,
            }}>
              {search ? 'Aucun résultat' : 'Le campus est calme'}
            </div>
            <div style={{ fontSize: 14, color: `rgba(var(--ink-rgb),0.5)` }}>
              {search ? 'Essaie un autre terme.' : 'Sois le premier à lancer une demande.'}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {filtered.map((r, i) => (
              <RequestCard
                key={r.id}
                r={r}
                variant={i % 2 === 0 ? 'yellow' : 'white'}
                isHelping={helping.has(r.id)}
                onHelp={() => handleHelp(r)}
                isDesktop
              />
            ))}
          </div>
        )}
      </div>
      )}

      {/* ── RIGHT COLUMN ─────────────────────── */}
      <div style={{
        width: 300, flexShrink: 0,
        padding: '32px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        overflowY: 'auto',
        borderLeft: `1px solid rgba(var(--ink-rgb),0.08)`,
      }}>
        {/* Campus card */}
        {(() => {
          const isDark = theme === 'dark'
          const cardBg   = isDark ? '#F6F5AE' : '#181713'
          const cardText = isDark ? '#181713' : '#F6F5AE'
          const cardSub  = isDark ? 'rgba(24,23,19,0.55)' : 'rgba(246,245,174,0.6)'
          const orb      = isDark ? '#181713' : '#F6F5AE'
          return (
            <div style={{
              background: cardBg, borderRadius: 24,
              padding: '20px', color: cardText,
              position: 'relative', overflow: 'hidden',
              transition: 'background .25s, color .25s',
            }}>
              <div style={{
                position: 'absolute', right: -30, bottom: -30,
                width: 120, height: 120, borderRadius: '50%',
                background: orb, opacity: 0.07,
              }} />
              <div style={{
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 11,
                letterSpacing: 0.5, textTransform: 'uppercase',
                color: cardSub, marginBottom: 10,
              }}>
                Campus · Ynov Lyon
              </div>
              <div style={{
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 700, fontSize: 36, letterSpacing: -1,
                lineHeight: 1, color: cardText,
              }}>
                {filtered.length}
              </div>
              <div style={{ fontSize: 13, color: cardSub, marginTop: 4 }}>
                demande{filtered.length !== 1 ? 's' : ''} active{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          )
        })()}

        {/* Recent activity */}
        <div>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12,
            letterSpacing: 0.4, textTransform: 'uppercase',
            color: `rgba(var(--ink-rgb),0.5)`, marginBottom: 12,
          }}>
            Activité récente
          </div>
          {requests.slice(0, 4).map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: `1px solid rgba(var(--ink-rgb),0.06)`,
            }}>
              <Avatar name={r.author?.name ?? '?'} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: `rgba(var(--ink-rgb),0.5)`, marginTop: 1 }}>
                  {timeAgo(r.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global stats */}
        <div style={{
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.10)`,
          borderRadius: 20, padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12,
            letterSpacing: 0.4, textTransform: 'uppercase',
            color: `rgba(var(--ink-rgb),0.5)`, marginBottom: 14,
          }}>
            Aujourd'hui
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <StatRow label="Demandes live" value={String(filtered.length)} />
            <StatRow label="Urgentes" value={String(filtered.filter(r => r.urgent).length)} />
          </div>
        </div>
      </div>

      {/* Create overlay */}
      {showCreate && (
        <CreateOverlay
          userId={profile.id}
          profile={profile}
          onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); showToast('Demande publiée !') }}
        />
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />}
    </div>
  )
}


// ── Sidebar helpers ───────────────────────────────────────────
function SideNavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 12,
        background: active ? '#F6F5AE' : 'transparent',
        border: active ? `1px solid rgba(var(--ink-rgb),0.12)` : '1px solid transparent',
        cursor: 'pointer', transition: 'all .15s',
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 14, color: active ? '#181713' : `rgba(var(--ink-rgb),0.55)`,
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = `rgba(var(--ink-rgb),0.05)` }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon} {label}
    </button>
  )
}


function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: `rgba(var(--ink-rgb),0.6)` }}>{label}</span>
      <span style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 15,
      }}>
        {value}
      </span>
    </div>
  )
}

// ── Inline Create overlay for desktop ────────────────────────
import { CreateScreen } from './CreateScreen'
import { SettingsScreen } from './SettingsScreen'

function CreateOverlay({ userId, profile, onClose, onSuccess }: {
  userId: string; profile: Profile; onClose: () => void; onSuccess: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: `rgba(var(--ink-rgb),0.5)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 480, maxHeight: '90vh',
        background: 'var(--bone)', borderRadius: 28,
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        <CreateScreen userId={userId} profile={profile} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  )
}
