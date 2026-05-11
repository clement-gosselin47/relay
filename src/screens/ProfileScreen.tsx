import { useState } from 'react'
import { Check, Plus, X, ArrowLeft, ChevronDown, LogOut, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Avatar } from '../components/ui/Avatar'
import { CategoryTile } from '../components/ui/CategoryTile'
import { Toggle } from '../components/ui/Toggle'
import { useProfile } from '../hooks/useProfile'
import { timeAgo } from '../lib/utils'
import type { Profile } from '../types'

const FILIERES = [
  'Dev Web',
  'Dev Logiciel',
  'Design UX / UI',
  'Cybersécurité',
  'Intelligence Artificielle',
  'Réseaux & Systèmes',
  'Marketing Digital',
  'Créa / Communication',
  'Management',
  'Jeux Vidéo',
]

interface ProfileScreenProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
  onSignOut: () => void
  isDesktop?: boolean
}

export function ProfileScreen({ profile, onUpdate, onSignOut, isDesktop = false }: ProfileScreenProps) {
  const { history, stats, toggleAvailable, updateCampusRadius, updateSkills, updateProfileInfo } = useProfile(profile.id)
  const [showSettings, setShowSettings] = useState(false)

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

  const RADII = [
    { key: 'building', label: 'Bât. voisins' },
    { key: 'campus',   label: 'Tout le campus' },
    { key: 'promo',    label: 'Ma promo' },
  ]

  if (showSettings) {
    return (
      <AccountSettings
        profile={profile}
        onUpdate={onUpdate}
        onBack={() => setShowSettings(false)}
        onSignOut={onSignOut}
        onUpdateSkills={async (skills) => { onUpdate({ skills }); await updateSkills(profile, skills) }}
        onSaveInfo={async (name, filiere) => { await updateProfileInfo(profile, name, filiere); onUpdate({ name, filiere }) }}
        isDesktop={isDesktop}
        px={px}
      />
    )
  }

  return (
    <div style={{
      background: 'var(--bone)', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif", color: 'var(--ink)',
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
          onClick={() => setShowSettings(true)}
          style={{
            height: 38, borderRadius: 999,
            background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
            display: 'flex', alignItems: 'center', gap: 6,
            cursor: 'pointer', padding: '0 14px',
            fontSize: 13, color: `rgba(var(--ink-rgb),0.65)`,
            fontFamily: "'Geologica', sans-serif",
          }}
        >
          Modifier
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: isDesktop ? `6px ${px} 40px` : `6px ${px} 110px`,
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
          borderRadius: 28, padding: '28px 24px',
          display: 'flex', alignItems: 'center', gap: 20,
          marginBottom: 12,
        }}>
          <Avatar name={profile.name} size={isDesktop ? 88 : 76} ring />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: isDesktop ? 32 : 26,
              letterSpacing: -0.7, lineHeight: 1.1,
              marginBottom: 6,
            }}>
              {profile.name}
            </div>

            {profile.filiere && (
              <div style={{
                display: 'inline-flex', alignItems: 'center',
                background: '#F6F5AE', padding: '4px 12px', borderRadius: 999,
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 12, letterSpacing: 0.2,
                color: '#181713',
                marginBottom: 8,
              }}>
                {profile.filiere}
              </div>
            )}

            <div style={{ fontSize: 13, color: `rgba(var(--ink-rgb),0.5)` }}>
              {profile.email}
            </div>
          </div>
        </div>

        {/* ── Disponibilité ── */}
        <div style={{
          background: profile.available ? '#F6F5AE' : 'var(--paper)',
          border: `1.5px solid ${profile.available ? '#181713' : `rgba(var(--ink-rgb),0.12)`}`,
          color: profile.available ? '#181713' : 'var(--ink)',
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
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
          borderRadius: 24, padding: '18px',
          marginBottom: 12,
        }}>
          <SectionTitle>Compétences</SectionTitle>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {profile.skills.map(s => (
              <span key={s} style={{
                padding: '8px 12px', borderRadius: 999,
                background: 'var(--bone)', border: `1px solid rgba(var(--ink-rgb),0.10)`,
                fontSize: 13, fontWeight: 500, color: 'var(--ink)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {s}
                <button
                  onClick={() => handleRemoveSkill(s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: `rgba(var(--ink-rgb),0.4)` }}
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
                    border: '1.5px solid var(--ink)',
                    fontFamily: "'Geologica', sans-serif",
                    fontSize: 13, background: 'var(--bone)',
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
                  background: 'transparent', border: `1px dashed rgba(var(--ink-rgb),0.3)`,
                  fontSize: 13, fontWeight: 500, color: `rgba(var(--ink-rgb),0.6)`,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
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
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
          borderRadius: 24, padding: '18px',
        }}>
          <SectionTitle extra={`${stats.helpsGiven} aides`}>Historique</SectionTitle>
          {history.length === 0 ? (
            <div style={{ fontSize: 13, color: `rgba(var(--ink-rgb),0.45)`, textAlign: 'center', padding: '16px 0' }}>
              Aucune aide pour l'instant
            </div>
          ) : (
            <div>
              {history.map((h, i) => (
                <div key={h.id} style={{
                  padding: '12px 0',
                  display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i < history.length - 1 ? `1px solid rgba(var(--ink-rgb),0.06)` : 'none',
                }}>
                  <CategoryTile cat={h.request.categories?.[0] ?? 'autre'} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "'Montserrat Alternates', sans-serif",
                      fontWeight: 600, fontSize: 13.5, letterSpacing: -0.1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {h.request.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: `rgba(var(--ink-rgb),0.55)`, marginTop: 2 }}>
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

// ── Page paramètres compte ────────────────────────────────────

interface AccountSettingsProps {
  profile: Profile
  onUpdate: (updates: Partial<Profile>) => void
  onBack: () => void
  onSignOut: () => void
  onUpdateSkills: (skills: string[]) => Promise<void>
  onSaveInfo: (name: string, filiere: string) => Promise<void>
  isDesktop: boolean
  px: string
}

function AccountSettings({ profile, onBack, onSignOut, onUpdateSkills, onSaveInfo, isDesktop, px }: AccountSettingsProps) {
  const { theme, toggle: toggleTheme } = useTheme()
  const [name, setName]       = useState(profile.name)
  const [filiere, setFiliere] = useState(profile.filiere)
  const [skills, setSkills]   = useState<string[]>(profile.skills)
  const [newSkill, setNewSkill]       = useState('')
  const [addingSkill, setAddingSkill] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    await onSaveInfo(name.trim(), filiere)
    await onUpdateSkills(skills)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addSkill() {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return
    setSkills(prev => [...prev, newSkill.trim()])
    setNewSkill('')
    setAddingSkill(false)
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s))
  }

  return (
    <div style={{
      background: 'var(--bone)', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif", color: 'var(--ink)',
    }}>
      {/* Header */}
      <div style={{
        padding: isDesktop ? `32px ${px} 14px` : `56px ${px} 14px`,
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}
          aria-label="Retour"
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </button>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 22, letterSpacing: -0.4,
        }}>
          Paramètres
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: isDesktop ? `6px ${px} 40px` : `6px ${px} 110px`,
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* ── Identité ── */}
        <SettingsSection label="Identité">
          <SettingsField label="Nom">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#181713' }}
              onBlur={e => { e.currentTarget.style.borderColor = `rgba(var(--ink-rgb),0.15)` }}
            />
          </SettingsField>

          <SettingsField label="Email" hint="Non modifiable">
            <div style={readonlyStyle}>{profile.email}</div>
          </SettingsField>
        </SettingsSection>

        {/* ── Filière ── */}
        <SettingsSection label="Filière">
          <div style={{ position: 'relative' }}>
            <select
              value={filiere}
              onChange={e => setFiliere(e.target.value)}
              style={{
                ...inputStyle,
                appearance: 'none',
                WebkitAppearance: 'none',
                paddingRight: 40,
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#181713' }}
              onBlur={e => { e.currentTarget.style.borderColor = `rgba(var(--ink-rgb),0.15)` }}
            >
              <option value="">Choisir une filière</option>
              {FILIERES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <ChevronDown
              size={16} strokeWidth={1.8}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: `rgba(var(--ink-rgb),0.45)`, pointerEvents: 'none',
              }}
            />
          </div>
        </SettingsSection>

        {/* ── Compétences ── */}
        <SettingsSection label="Compétences">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {skills.map(s => (
              <span key={s} style={{
                padding: '8px 12px', borderRadius: 999,
                background: 'var(--bone)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
                fontSize: 13, fontWeight: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {s}
                <button
                  onClick={() => removeSkill(s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: `rgba(var(--ink-rgb),0.4)` }}
                  aria-label={`Retirer ${s}`}
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </span>
            ))}
            {addingSkill ? (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  autoFocus
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSkill(); if (e.key === 'Escape') setAddingSkill(false) }}
                  placeholder="Ex : Figma"
                  style={{
                    padding: '7px 12px', borderRadius: 999,
                    border: '1.5px solid var(--ink)',
                    fontFamily: "'Geologica', sans-serif",
                    fontSize: 13, background: 'var(--bone)',
                    outline: 'none', width: 120,
                  }}
                />
                <button onClick={addSkill} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Check size={18} strokeWidth={2.2} color="#181713" />
                </button>
                <button onClick={() => setAddingSkill(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} strokeWidth={2} color="rgba(24,23,19,0.4)" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingSkill(true)}
                style={{
                  padding: '8px 13px', borderRadius: 999,
                  background: 'transparent', border: `1px dashed rgba(var(--ink-rgb),0.3)`,
                  fontSize: 13, fontWeight: 500, color: `rgba(var(--ink-rgb),0.6)`,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={13} strokeWidth={2.2} /> Ajouter
              </button>
            )}
          </div>
        </SettingsSection>

        {/* ── Sauvegarder ── */}
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          style={{
            width: '100%', padding: '14px',
            background: saved ? '#3a8a4a' : (saving || !name.trim() ? `rgba(var(--ink-rgb),0.1)` : 'var(--ink)'),
            color: saved ? '#fff' : (saving || !name.trim() ? `rgba(var(--ink-rgb),0.3)` : 'var(--bone)'),
            border: 'none', borderRadius: 16,
            cursor: saving || !name.trim() ? 'default' : 'pointer',
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 15,
            transition: 'all .2s',
            marginBottom: 32,
          }}
        >
          {saved ? 'Sauvegardé' : saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>

        {/* ── Apparence ── */}
        <SettingsSection label="Apparence">
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'transparent',
              border: `1.5px solid rgba(var(--ink-rgb),0.12)`,
              borderRadius: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: "'Geologica', sans-serif",
              fontSize: 14, color: 'var(--ink)',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `rgba(var(--ink-rgb),0.04)` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {theme === 'dark'
              ? <Sun size={16} strokeWidth={1.8} />
              : <Moon size={16} strokeWidth={1.8} />
            }
            {theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          </button>
        </SettingsSection>

        {/* ── Déconnexion ── */}
        <SettingsSection label="Compte">
          <button
            onClick={onSignOut}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'transparent',
              border: `1.5px solid rgba(var(--ink-rgb),0.15)`,
              borderRadius: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              fontFamily: "'Geologica', sans-serif",
              fontSize: 14, color: '#c0392b',
              transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(192,57,43,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={16} strokeWidth={1.8} />
            Se déconnecter
          </button>
        </SettingsSection>

      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  borderRadius: 12, border: `1.5px solid rgba(var(--ink-rgb),0.15)`,
  fontFamily: "'Geologica', sans-serif",
  fontSize: 14, color: 'var(--ink)', background: 'var(--paper)',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s',
}

const readonlyStyle: React.CSSProperties = {
  padding: '12px 14px', borderRadius: 12,
  border: `1.5px solid rgba(var(--ink-rgb),0.08)`,
  background: `rgba(var(--ink-rgb),0.04)`,
  fontSize: 14, color: `rgba(var(--ink-rgb),0.4)`,
  fontFamily: "'Geologica', sans-serif",
}

function SettingsSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 11,
        letterSpacing: 0.5, textTransform: 'uppercase',
        color: `rgba(var(--ink-rgb),0.45)`, marginBottom: 12,
      }}>
        {label}
      </div>
      <div style={{
        background: 'var(--paper)', borderRadius: 18,
        border: `1px solid rgba(var(--ink-rgb),0.08)`,
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingsField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 6,
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 12, fontWeight: 500, color: `rgba(var(--ink-rgb),0.55)`,
          fontFamily: "'Geologica', sans-serif",
        }}>
          {label}
        </span>
        {hint && (
          <span style={{ fontSize: 11, color: `rgba(var(--ink-rgb),0.35)` }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function StatCard({ n, label }: { n: string; label: string }) {
  return (
    <div style={{
      background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
      borderRadius: 16, padding: '12px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 22, letterSpacing: -0.6,
      }}>
        {n}
      </div>
      <div style={{ fontSize: 10.5, color: `rgba(var(--ink-rgb),0.6)`, marginTop: 2, lineHeight: 1.2 }}>
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
      color: `rgba(var(--ink-rgb),0.6)`, marginBottom: 10,
    }}>
      {children}
      {extra && (
        <span style={{ marginLeft: 'auto', fontFamily: "'Geologica', sans-serif", fontWeight: 400, fontSize: 11, color: `rgba(var(--ink-rgb),0.4)`, textTransform: 'none' }}>
          {extra}
        </span>
      )}
    </div>
  )
}
