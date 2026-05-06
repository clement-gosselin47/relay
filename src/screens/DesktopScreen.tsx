import { useState, useCallback } from 'react'
import { Home, User, Bell, MapPin, Zap, ArrowRight, Search } from 'lucide-react'
import { RelayLogo } from '../components/ui/RelayLogo'
import { Avatar } from '../components/ui/Avatar'
import { CategoryTile } from '../components/ui/CategoryTile'
import { Toggle } from '../components/ui/Toggle'
import { Toast } from '../components/ui/Toast'
import { useRequests } from '../hooks/useRequests'
import { supabase } from '../lib/supabase'
import { CATEGORY } from '../lib/tokens'
import { timeAgo, minutesLeft } from '../lib/utils'
import type { Profile, Request } from '../types'

type Screen = 'home' | 'create' | 'profile'
interface ToastState { msg: string; type: 'success' | 'info' | 'error' }

interface DesktopScreenProps {
  profile: Profile
  onUpdate: (u: Partial<Profile>) => void
  onSignOut: () => void
}

export function DesktopScreen({ profile, onUpdate, onSignOut }: DesktopScreenProps) {
  const [screen, setScreen]   = useState<Screen>('home')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast]     = useState<ToastState | null>(null)
  const [search, setSearch]   = useState('')
  const [filterCat, setFilterCat] = useState<string | null>(null)
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
    if (data === 'ok') showToast(`Super ! ${r.author?.name?.split(' ')[0] ?? 'L\'auteur'} va être prévenu·e.`)
    else if (data === 'already_taken') showToast('Quelqu\'un est déjà en route !', 'info')
    else if (data === 'expired') showToast('Cette demande a expiré.', 'info')
  }

  const filtered = requests.filter(r => {
    const now = new Date()
    if (r.expires_at && new Date(r.expires_at) < now) return false
    if (filterCat && r.category !== filterCat) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{
      display: 'flex', height: '100svh', background: '#F0EEE9',
      fontFamily: "'Geologica', sans-serif",
    }}>
      {/* ── SIDEBAR ──────────────────────────── */}
      <div style={{
        width: 260, flexShrink: 0,
        background: '#FAFAF7',
        borderRight: '1px solid rgba(24,23,19,0.08)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 20px 24px',
        position: 'sticky', top: 0, height: '100svh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#181713',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RelayLogo size={22} color="#F6F5AE" />
          </div>
          <span style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 20, letterSpacing: -0.5,
            color: '#181713',
          }}>
            Relay
          </span>
        </div>

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
          <RelayLogo size={20} color="#181713" />
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
            icon={<Bell size={18} strokeWidth={1.7} />}
            label="Notifications"
            active={false}
            onClick={() => {}}
          />
          <SideNavItem
            icon={<User size={18} strokeWidth={screen === 'profile' ? 2.2 : 1.7} />}
            label="Profil"
            active={screen === 'profile'}
            onClick={() => { setScreen('profile'); setShowCreate(false) }}
          />
        </nav>

        {/* Availability toggle */}
        <div style={{
          background: profile.available ? '#F6F5AE' : 'rgba(24,23,19,0.05)',
          border: `1.5px solid ${profile.available ? '#181713' : 'rgba(24,23,19,0.10)'}`,
          borderRadius: 16, padding: '14px 14px',
          marginTop: 20, marginBottom: 16,
          transition: 'all .25s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13,
            }}>
              {profile.available ? '🟢 Disponible' : '⚫ Hors-ligne'}
            </span>
            <Toggle on={profile.available} onChange={async v => {
              onUpdate({ available: v })
              await supabase.from('profiles').update({ available: v }).eq('id', profile.id)
            }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(24,23,19,0.55)' }}>
            {profile.available ? 'Tu apparais dans le radar' : 'Active pour recevoir des demandes'}
          </div>
        </div>

        {/* Mini profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 0',
          borderTop: '1px solid rgba(24,23,19,0.08)',
        }}>
          <Avatar name={profile.name} size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(24,23,19,0.5)', marginTop: 1 }}>
              {profile.filiere}
            </div>
          </div>
          <button
            onClick={onSignOut}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'rgba(24,23,19,0.4)',
              fontFamily: "'Geologica', sans-serif",
            }}
          >
            Quitter
          </button>
        </div>
      </div>

      {/* ── MAIN FEED ────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
        {/* Search + filters */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 14,
          }}>
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 10,
              background: '#FAFAF7',
              border: '1.5px solid rgba(24,23,19,0.12)',
              borderRadius: 14, padding: '12px 16px',
            }}>
              <Search size={16} strokeWidth={1.7} color="rgba(24,23,19,0.4)" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une demande…"
                style={{
                  border: 'none', background: 'none', outline: 'none',
                  fontFamily: "'Geologica', sans-serif",
                  fontWeight: 300, fontSize: 14, color: '#181713',
                  flex: 1,
                }}
              />
            </div>
            <div style={{
              background: '#F6F5AE', border: '1.5px solid #181713',
              borderRadius: 14, padding: '12px 16px',
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#181713', animation: 'pulse 1.4s infinite',
              }} />
              {filtered.length} demande{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <FilterChip label="Tout" active={filterCat === null} onClick={() => setFilterCat(null)} />
            {Object.entries(CATEGORY).map(([k, def]) => (
              <FilterChip
                key={k}
                label={`${def.emoji} ${def.label}`}
                active={filterCat === k}
                onClick={() => setFilterCat(filterCat === k ? null : k)}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(24,23,19,0.4)' }}>
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✋</div>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 24, letterSpacing: -0.5, marginBottom: 8,
            }}>
              {search || filterCat ? 'Aucun résultat' : 'Le campus est calme'}
            </div>
            <div style={{ fontSize: 14, color: 'rgba(24,23,19,0.5)' }}>
              {search || filterCat ? 'Essaie un autre filtre.' : 'Sois le premier à lancer une demande.'}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 16,
          }}>
            {filtered.map((r, i) => (
              <DesktopCard
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

      {/* ── RIGHT COLUMN ─────────────────────── */}
      <div style={{
        width: 300, flexShrink: 0,
        padding: '32px 20px',
        display: 'flex', flexDirection: 'column', gap: 16,
        overflowY: 'auto',
        borderLeft: '1px solid rgba(24,23,19,0.08)',
      }}>
        {/* Campus card */}
        <div style={{
          background: '#181713', borderRadius: 24,
          padding: '20px', color: '#F6F5AE',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -30, bottom: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: '#F6F5AE', opacity: 0.07,
          }} />
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 11,
            letterSpacing: 0.5, textTransform: 'uppercase',
            color: 'rgba(246,245,174,0.6)', marginBottom: 10,
          }}>
            Campus · Ynov Lyon
          </div>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 36, letterSpacing: -1,
            lineHeight: 1,
          }}>
            {filtered.length}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(246,245,174,0.7)', marginTop: 4 }}>
            demande{filtered.length !== 1 ? 's' : ''} active{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12,
            letterSpacing: 0.4, textTransform: 'uppercase',
            color: 'rgba(24,23,19,0.5)', marginBottom: 12,
          }}>
            Activité récente
          </div>
          {requests.slice(0, 4).map(r => (
            <div key={r.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 0',
              borderBottom: '1px solid rgba(24,23,19,0.06)',
            }}>
              <CategoryTile cat={r.category} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12.5, fontWeight: 500,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {r.title}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(24,23,19,0.5)', marginTop: 1 }}>
                  {timeAgo(r.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global stats */}
        <div style={{
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.10)',
          borderRadius: 20, padding: '16px',
        }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12,
            letterSpacing: 0.4, textTransform: 'uppercase',
            color: 'rgba(24,23,19,0.5)', marginBottom: 14,
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

// ── Desktop Card ──────────────────────────────────────────────
function DesktopCard({ r, variant, isHelping, onHelp }: {
  r: Request; variant: 'yellow' | 'white'; isHelping: boolean; onHelp: () => void
}) {
  const yellow = variant === 'yellow'
  const cat = CATEGORY[r.category] ?? CATEGORY.autre
  const mins = r.expires_at ? minutesLeft(r.expires_at) : null

  return (
    <div style={{
      background: yellow ? '#F6F5AE' : '#FAFAF7',
      border: yellow ? 'none' : '1px solid rgba(24,23,19,0.12)',
      borderRadius: 24, padding: '20px',
      animation: 'slide-up .3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CategoryTile cat={r.category} size={38} filled={!yellow} />
        <span style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 11.5,
          letterSpacing: 0.3, textTransform: 'uppercase',
        }}>
          {cat.label}
        </span>
        <span style={{ flex: 1 }} />
        {r.urgent && mins !== null && mins > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 11, padding: '4px 9px', borderRadius: 999,
            background: '#181713', color: '#F6F5AE',
          }}>
            <Zap size={11} strokeWidth={2} /> {mins} min
          </span>
        )}
      </div>

      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 18, lineHeight: 1.2,
        letterSpacing: -0.4, marginBottom: 12,
      }}>
        {r.title}
      </div>

      {r.author && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Avatar name={r.author.name} size={24} />
          <span style={{ fontSize: 12 }}>
            <strong>{r.author.name.split(' ')[0]}</strong>
            <span style={{ color: 'rgba(24,23,19,0.6)' }}> · {r.author.filiere}</span>
          </span>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingTop: 12,
        borderTop: `1px dashed ${yellow ? 'rgba(24,23,19,0.18)' : 'rgba(24,23,19,0.10)'}`,
      }}>
        <MapPin size={12} strokeWidth={1.7} />
        <span style={{ fontSize: 12 }}>{r.location}</span>
        <span style={{ flex: 1 }} />
        <button
          onClick={onHelp}
          disabled={isHelping}
          style={{
            padding: '8px 14px', borderRadius: 999,
            background: isHelping ? 'rgba(24,23,19,0.12)' : '#181713',
            color: isHelping ? 'rgba(24,23,19,0.35)' : (yellow ? '#F6F5AE' : '#F0EEE9'),
            border: 'none', cursor: isHelping ? 'default' : 'pointer',
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all .15s',
          }}
        >
          {isHelping ? 'En cours…' : "J'aide"} {!isHelping && <ArrowRight size={12} />}
        </button>
      </div>
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
        border: active ? '1px solid rgba(24,23,19,0.12)' : '1px solid transparent',
        cursor: 'pointer', transition: 'all .15s',
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 14, color: active ? '#181713' : 'rgba(24,23,19,0.55)',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(24,23,19,0.05)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon} {label}
    </button>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 13px', borderRadius: 999,
        background: active ? '#181713' : '#FAFAF7',
        border: `1.5px solid ${active ? '#181713' : 'rgba(24,23,19,0.12)'}`,
        color: active ? '#F6F5AE' : '#181713',
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 12,
        cursor: 'pointer', transition: 'all .15s',
      }}
    >
      {label}
    </button>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'rgba(24,23,19,0.6)' }}>{label}</span>
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

function CreateOverlay({ userId, profile, onClose, onSuccess }: {
  userId: string; profile: Profile; onClose: () => void; onSuccess: () => void
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(24,23,19,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: 480, maxHeight: '90vh',
        background: '#F0EEE9', borderRadius: 28,
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        <CreateScreen userId={userId} profile={profile} onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  )
}
