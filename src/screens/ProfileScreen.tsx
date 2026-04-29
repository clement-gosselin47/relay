import { useState } from 'react'
import { Settings, Check, Plus, X } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { CategoryTile } from '../components/ui/CategoryTile'
import { Toggle } from '../components/ui/Toggle'
import { useProfile } from '../hooks/useProfile'
import { registerPush } from '../lib/push'
import { timeAgo } from '../lib/utils'
import type { Profile } from '../types'

interface ProfileScreenProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
  onSignOut: () => void
}

export function ProfileScreen({ profile, onUpdate, onSignOut }: ProfileScreenProps) {
  const { history, stats, toggleAvailable, updateCampusRadius, updateSkills } = useProfile(profile.id)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [addingSkill, setAddingSkill] = useState(false)
  const [newSkill, setNewSkill]       = useState('')

  async function handleToggleAvailable(v: boolean) {
    onUpdate({ available: v })
    await toggleAvailable(profile, v)
  }

  async function handleRadius(r: string) {
    onUpdate({ campus_radius: r })
    await updateCampusRadius(profile, r)
  }

  async function handleAddSkill() {
    if (!newSkill.trim()) return
    const skills = [...profile.skills, newSkill.trim()]
    onUpdate({ skills })
    await updateSkills(profile, skills)
    setNewSkill(''); setAddingSkill(false)
  }

  async function handleRemoveSkill(s: string) {
    const skills = profile.skills.filter(x => x !== s)
    onUpdate({ skills })
    await updateSkills(profile, skills)
  }

  async function handleEnablePush() {
    const ok = await registerPush(profile.id)
    setPushEnabled(ok)
  }

  const RADII = [
    { key: 'building', label: 'Bât. voisins' },
    { key: 'campus',   label: 'Tout le campus' },
    { key: 'promo',    label: 'Ma promo' },
  ]

  return (
    <div style={{
      background: '#F0EEE9', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif", color: '#181713',
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 22, letterSpacing: -0.4,
        }}>
          Profil
        </div>
        <button
          onClick={onSignOut}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Se déconnecter"
        >
          <Settings size={17} strokeWidth={1.7} />
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '6px 20px 110px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Identity card */}
        <div style={{
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
          borderRadius: 24, padding: '20px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
          marginBottom: 14,
        }}>
          <Avatar name={profile.name} size={64} ring />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 18, letterSpacing: -0.2,
            }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 12.5, color: 'rgba(24,23,19,0.6)', marginTop: 2 }}>
              {profile.email}
            </div>
            {profile.filiere && (
              <div style={{
                marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#F6F5AE', padding: '3px 10px', borderRadius: 999,
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 11, letterSpacing: 0.3,
              }}>
                ✏️ {profile.filiere}
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div style={{
          background: profile.available ? '#F6F5AE' : '#FAFAF7',
          border: `1.5px solid ${profile.available ? '#181713' : 'rgba(24,23,19,0.12)'}`,
          borderRadius: 28, padding: 20,
          marginBottom: 14, position: 'relative', overflow: 'hidden',
          transition: 'all .25s',
        }}>
          {profile.available && (
            <div style={{
              position: 'absolute', right: -50, top: -50,
              width: 180, height: 180, borderRadius: '50%',
              background: '#EDEC7A', opacity: 0.55,
              animation: 'breathe 3.2s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 14,
            }}>
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 11,
                  letterSpacing: 0.4, textTransform: 'uppercase',
                  color: 'rgba(24,23,19,0.6)', marginBottom: 6,
                }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: profile.available ? '#3a8a4a' : 'rgba(24,23,19,0.3)',
                    boxShadow: profile.available ? '0 0 0 4px rgba(58,138,74,0.18)' : 'none',
                  }} />
                  Mode disponibilité
                </div>
                <div style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 700, fontSize: 26, letterSpacing: -0.6, lineHeight: 1.05,
                }}>
                  {profile.available ? 'Sur le campus' : 'Hors-ligne'}
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(24,23,19,0.65)', marginTop: 4, maxWidth: 200 }}>
                  {profile.available
                    ? 'Tu apparais dans le radar des aidants.'
                    : 'Active pour recevoir les demandes flash.'}
                </div>
              </div>
              <Toggle on={profile.available} onChange={handleToggleAvailable} size="lg" />
            </div>

            {profile.available && (
              <div style={{
                display: 'flex', gap: 8, flexWrap: 'wrap',
                paddingTop: 14, borderTop: '1px dashed rgba(24,23,19,0.18)',
              }}>
                {RADII.map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleRadius(r.key)}
                    style={{
                      padding: '6px 12px', borderRadius: 999,
                      background: profile.campus_radius === r.key ? '#181713' : 'rgba(24,23,19,0.07)',
                      color: profile.campus_radius === r.key ? '#F6F5AE' : 'rgba(24,23,19,0.65)',
                      border: 'none', cursor: 'pointer',
                      fontFamily: "'Geologica', sans-serif",
                      fontSize: 12, fontWeight: 500,
                      transition: 'all .15s',
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
          <StatCard n={String(stats.helpsGiven)} label="Aides apportées" />
          <StatCard n={String(stats.requestsMade)} label="Demandes lancées" />
          <StatCard n="—" label="Réponse moy." />
        </div>

        {/* Push notifications */}
        {!pushEnabled && 'Notification' in window && Notification.permission !== 'granted' && (
          <button
            onClick={handleEnablePush}
            style={{
              width: '100%', padding: '13px 16px',
              background: '#FAFAF7', border: '1.5px dashed rgba(24,23,19,0.2)',
              borderRadius: 18, cursor: 'pointer', marginBottom: 22,
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13, color: '#181713',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            🔔 Activer les notifications push
          </button>
        )}

        {/* Skills */}
        <SectionTitle>Compétences</SectionTitle>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
          {profile.skills.map(s => (
            <span key={s} style={{
              padding: '8px 12px', borderRadius: 999,
              background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
              fontSize: 13, fontWeight: 500, color: '#181713',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {s}
              <button
                onClick={() => handleRemoveSkill(s)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 0, display: 'flex', color: 'rgba(24,23,19,0.4)',
                }}
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </span>
          ))}
          {addingSkill ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                autoFocus
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); if (e.key === 'Escape') setAddingSkill(false) }}
                placeholder="Ex : Figma"
                style={{
                  padding: '7px 12px', borderRadius: 999,
                  border: '1.5px solid #181713',
                  fontFamily: "'Geologica', sans-serif",
                  fontSize: 13, background: '#FAFAF7',
                  outline: 'none', width: 110,
                }}
              />
              <button onClick={handleAddSkill} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Check size={18} strokeWidth={2.2} color="#181713" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingSkill(true)}
              style={{
                padding: '8px 13px', borderRadius: 999,
                background: 'transparent', border: '1px dashed rgba(24,23,19,0.3)',
                fontSize: 13, fontWeight: 500, color: 'rgba(24,23,19,0.6)',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              <Plus size={13} strokeWidth={2.2} /> Ajouter
            </button>
          )}
        </div>

        {/* History */}
        <SectionTitle extra={`${stats.helpsGiven} aides`}>Historique</SectionTitle>
        {history.length === 0 ? (
          <div style={{ fontSize: 13, color: 'rgba(24,23,19,0.45)', textAlign: 'center', padding: '20px 0' }}>
            Aucune aide pour l'instant
          </div>
        ) : (
          <div style={{
            background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            {history.map((h, i) => (
              <div key={h.id} style={{
                padding: '14px',
                display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < history.length - 1 ? '1px solid rgba(24,23,19,0.06)' : 'none',
              }}>
                <CategoryTile cat={h.request.category} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, fontSize: 13.5, letterSpacing: -0.1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {h.request.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'rgba(24,23,19,0.55)', marginTop: 2 }}>
                    {timeAgo(h.created_at)}
                  </div>
                </div>
                <Check size={18} strokeWidth={2.2} color="rgba(24,23,19,0.3)" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
      borderRadius: 16, padding: '12px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 22, letterSpacing: -0.6,
      }}>
        {n}
      </div>
      <div style={{ fontSize: 10.5, color: 'rgba(24,23,19,0.6)', marginTop: 2, lineHeight: 1.2 }}>
        {label}
      </div>
    </div>
  )
}

function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      fontFamily: "'Montserrat Alternates', sans-serif",
      fontWeight: 600, fontSize: 12,
      letterSpacing: 0.4, textTransform: 'uppercase' as const,
      color: 'rgba(24,23,19,0.6)', marginBottom: 10,
    }}>
      {children}
      {extra && (
        <span style={{ marginLeft: 'auto', fontFamily: "'Geologica', sans-serif", fontWeight: 400, fontSize: 11, color: 'rgba(24,23,19,0.4)', textTransform: 'none' }}>
          {extra}
        </span>
      )}
    </div>
  )
}
