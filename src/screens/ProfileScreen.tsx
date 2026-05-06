import { useState } from 'react'
import { Check, Plus, X, Pencil, LogOut } from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { CategoryTile } from '../components/ui/CategoryTile'
import { Toggle } from '../components/ui/Toggle'
import { useProfile } from '../hooks/useProfile'
import { timeAgo } from '../lib/utils'
import type { Profile } from '../types'

interface ProfileScreenProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
  onSignOut: () => void
  isDesktop?: boolean
}

export function ProfileScreen({ profile, onUpdate, onSignOut, isDesktop = false }: ProfileScreenProps) {
  const { history, stats, toggleAvailable, updateCampusRadius, updateSkills, updateProfileInfo } = useProfile(profile.id)

  const [editing, setEditing]     = useState(false)
  const [editName, setEditName]   = useState(profile.name)
  const [editFiliere, setEditFiliere] = useState(profile.filiere)
  const [saving, setSaving]       = useState(false)

  const [addingSkill, setAddingSkill] = useState(false)
  const [newSkill, setNewSkill]       = useState('')

  const px = isDesktop ? '28px' : '20px'

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
    setNewSkill('')
    setAddingSkill(false)
  }

  async function handleRemoveSkill(s: string) {
    const skills = profile.skills.filter(x => x !== s)
    onUpdate({ skills })
    await updateSkills(profile, skills)
  }

  function handleStartEdit() {
    setEditName(profile.name)
    setEditFiliere(profile.filiere)
    setEditing(true)
  }

  function handleCancelEdit() {
    setEditing(false)
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return
    setSaving(true)
    await updateProfileInfo(profile, editName.trim(), editFiliere.trim())
    onUpdate({ name: editName.trim(), filiere: editFiliere.trim() })
    setSaving(false)
    setEditing(false)
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
      {/* Header bar */}
      <div style={{
        padding: isDesktop ? `32px ${px} 14px` : `56px ${px} 14px`,
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
            height: 40, borderRadius: 999,
            background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', padding: '0 14px',
            fontFamily: "'Geologica', sans-serif",
            fontSize: 12, color: 'rgba(24,23,19,0.6)',
          }}
        >
          <LogOut size={14} strokeWidth={1.7} />
          Déconnexion
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: isDesktop ? `6px ${px} 40px` : `6px ${px} 110px`,
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* ── Hero ── */}
        <div style={{
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
          borderRadius: 28, padding: '32px 20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center', marginBottom: 12,
          position: 'relative',
        }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Avatar name={profile.name} size={96} ring />
          </div>

          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 28, letterSpacing: -0.6, lineHeight: 1.1,
            marginBottom: 6,
          }}>
            {profile.name}
          </div>

          <div style={{ fontSize: 13, color: 'rgba(24,23,19,0.5)', marginBottom: 10 }}>
            {profile.email}
          </div>

          {profile.filiere && (
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#F6F5AE', padding: '5px 14px', borderRadius: 999,
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
              marginBottom: 20,
            }}>
              {profile.filiere}
            </div>
          )}

          <button
            onClick={handleStartEdit}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 18px', borderRadius: 999,
              background: 'transparent', border: '1.5px solid rgba(24,23,19,0.18)',
              cursor: 'pointer', fontFamily: "'Geologica', sans-serif",
              fontSize: 13, fontWeight: 500, color: 'rgba(24,23,19,0.7)',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#181713'; e.currentTarget.style.color = '#181713' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(24,23,19,0.18)'; e.currentTarget.style.color = 'rgba(24,23,19,0.7)' }}
          >
            <Pencil size={13} strokeWidth={2} />
            Modifier le profil
          </button>
        </div>

        {/* ── Inline edit form ── */}
        {editing && (
          <div style={{
            background: '#FAFAF7', border: '1.5px solid #181713',
            borderRadius: 24, padding: '22px 20px',
            marginBottom: 12,
          }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13, letterSpacing: 0.2,
              marginBottom: 16, color: '#181713',
            }}>
              Modifier les informations
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{
                  display: 'block', fontSize: 11,
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, letterSpacing: 0.4,
                  textTransform: 'uppercase', color: 'rgba(24,23,19,0.5)',
                  marginBottom: 6,
                }}>
                  Nom
                </label>
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit() }}
                  style={{
                    width: '100%', padding: '11px 14px',
                    borderRadius: 12, border: '1.5px solid rgba(24,23,19,0.2)',
                    fontFamily: "'Geologica', sans-serif",
                    fontSize: 14, color: '#181713', background: '#F0EEE9',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#181713' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,23,19,0.2)' }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 11,
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, letterSpacing: 0.4,
                  textTransform: 'uppercase', color: 'rgba(24,23,19,0.5)',
                  marginBottom: 6,
                }}>
                  Filière
                </label>
                <input
                  value={editFiliere}
                  onChange={e => setEditFiliere(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit() }}
                  placeholder="Ex : Dev Web"
                  style={{
                    width: '100%', padding: '11px 14px',
                    borderRadius: 12, border: '1.5px solid rgba(24,23,19,0.2)',
                    fontFamily: "'Geologica', sans-serif",
                    fontSize: 14, color: '#181713', background: '#F0EEE9',
                    outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color .15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#181713' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(24,23,19,0.2)' }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: 11,
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, letterSpacing: 0.4,
                  textTransform: 'uppercase', color: 'rgba(24,23,19,0.5)',
                  marginBottom: 6,
                }}>
                  Email
                </label>
                <div style={{
                  padding: '11px 14px', borderRadius: 12,
                  border: '1.5px solid rgba(24,23,19,0.08)',
                  background: 'rgba(24,23,19,0.04)',
                  fontSize: 14, color: 'rgba(24,23,19,0.4)',
                  fontFamily: "'Geologica', sans-serif",
                }}>
                  {profile.email}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 12,
                  background: saving || !editName.trim() ? 'rgba(24,23,19,0.12)' : '#181713',
                  color: saving || !editName.trim() ? 'rgba(24,23,19,0.35)' : '#F6F5AE',
                  border: 'none', cursor: saving || !editName.trim() ? 'default' : 'pointer',
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 13,
                  transition: 'all .15s',
                }}
              >
                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '11px 16px', borderRadius: 12,
                  background: 'transparent', border: '1.5px solid rgba(24,23,19,0.15)',
                  cursor: 'pointer', fontFamily: "'Geologica', sans-serif",
                  fontSize: 13, color: 'rgba(24,23,19,0.6)',
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Disponibilité ── */}
        <div style={{
          background: profile.available ? '#F6F5AE' : '#FAFAF7',
          border: `1.5px solid ${profile.available ? '#181713' : 'rgba(24,23,19,0.12)'}`,
          borderRadius: 28, padding: 20,
          marginBottom: 12, position: 'relative', overflow: 'hidden',
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

        {/* ── Compétences ── */}
        <div style={{
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
          borderRadius: 24, padding: '18px 18px',
          marginBottom: 12,
        }}>
          <SectionTitle>Compétences</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile.skills.map(s => (
              <span key={s} style={{
                padding: '8px 12px', borderRadius: 999,
                background: '#F0EEE9', border: '1px solid rgba(24,23,19,0.10)',
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
                  aria-label={`Retirer ${s}`}
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
                    fontSize: 13, background: '#F0EEE9',
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
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
          <StatCard n={String(stats.helpsGiven)} label="Aides apportées" />
          <StatCard n={String(stats.requestsMade)} label="Demandes lancées" />
          <StatCard n="—" label="Réponse moy." />
        </div>

        {/* ── Historique ── */}
        <div style={{
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
          borderRadius: 24, padding: '18px',
        }}>
          <SectionTitle extra={`${stats.helpsGiven} aides`}>Historique</SectionTitle>
          {history.length === 0 ? (
            <div style={{ fontSize: 13, color: 'rgba(24,23,19,0.45)', textAlign: 'center', padding: '16px 0' }}>
              Aucune aide pour l'instant
            </div>
          ) : (
            <div>
              {history.map((h, i) => (
                <div key={h.id} style={{
                  padding: '12px 0',
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
