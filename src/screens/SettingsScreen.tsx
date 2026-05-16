import { useState } from 'react'
import { Moon, Sun, LogOut, Info, Plus, X, ChevronDown, Shield, Sliders } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Toggle } from '../components/ui/Toggle'
import { useProfile } from '../hooks/useProfile'
import type { Profile } from '../types'

const FILIERES = [
  'Informatique - Développement',
  'Informatique - Infrastructure & Réseau',
  'Intelligence Artificielle & Data',
  'Cybersécurité',
  '3D, Animation & Jeu Vidéo',
  'Marketing & Communication Digitale',
  'Création & Digital Design',
  'Audiovisuel',
  'Bâtiment Numérique',
  "Architecture d'intérieur",
  'BTS SIO SLAM',
  'BTS SIO SISR',
]

const RADII = [
  { key: 'building', label: 'Bât. voisins' },
  { key: 'campus',   label: 'Tout le campus' },
  { key: 'promo',    label: 'Ma promo' },
]

interface SettingsScreenProps {
  profile: Profile
  onUpdate: (u: Partial<Profile>) => void
  onSignOut: () => void
  isDesktop?: boolean
}

export function SettingsScreen({ profile, onUpdate, onSignOut, isDesktop }: SettingsScreenProps) {
  const { theme, toggle } = useTheme()
  const { toggleAvailable, updateCampusRadius, updateSkills, updateProfileInfo } = useProfile(profile.id)
  const isDark = theme === 'dark'

  // Filière
  const [showFiliereMenu, setShowFiliereMenu] = useState(false)
  const [pendingFiliere, setPendingFiliere]   = useState(profile.filiere)

  // Compétences
  const [addingSkill, setAddingSkill] = useState(false)
  const [newSkill, setNewSkill]       = useState('')

  // Logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const px = isDesktop ? '28px' : '20px'

  async function handleAvailable(v: boolean) {
    onUpdate({ available: v })
    await toggleAvailable(profile, v)
  }

  async function handleRadius(r: string) {
    onUpdate({ campus_radius: r })
    await updateCampusRadius(profile, r)
  }

  async function handleFiliereSelect(f: string) {
    setPendingFiliere(f)
    setShowFiliereMenu(false)
    onUpdate({ filiere: f })
    await updateProfileInfo(profile, profile.name, f)
  }

  async function handleAddSkill() {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    const skills = [...profile.skills, trimmed]
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

  return (
    <div style={{
      background: 'var(--bone)',
      height: '100%', overflowY: 'auto',
      fontFamily: "'Geologica', sans-serif",
      color: 'var(--ink)',
    }}>

      {/* ── Header ────────────────────────────────────── */}
      {isDesktop ? (
        <div style={{
          padding: `22px ${px} 12px`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 22, letterSpacing: -0.4, color: 'var(--ink)',
            }}>
              Paramètres
            </div>
            <div style={{ fontSize: 12, color: 'rgba(var(--ink-rgb),0.45)', marginTop: 3 }}>
              Personnalise ton expérience Relay.
            </div>
          </div>
          <Sliders size={18} strokeWidth={1.7} color="rgba(var(--ink-rgb),0.3)" />
        </div>
      ) : (
        <div style={{
          background: '#F6F5AE',
          padding: '26px 20px 18px',
          borderRadius: '0 0 24px 24px',
        }}>
          <div style={{ marginTop: 30 }} />
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 28,
            lineHeight: 0.95, letterSpacing: -0.8, color: '#181713',
          }}>
            Paramètres<span style={{ opacity: 0.3 }}>.</span>
          </div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(24,23,19,0.65)' }}>
            Personnalise ton expérience Relay.
          </div>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────── */}
      <div style={{
        padding: isDesktop ? `16px ${px} 40px` : '20px 16px 100px',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>

        {/* ── MON PROFIL ── */}
        <SettingsGroup title="Mon profil">

          {/* Filière */}
          <div style={{ position: 'relative' }}>
            <SettingsRow
              label="Filière"
              description={pendingFiliere || 'Non définie'}
              onClick={() => setShowFiliereMenu(v => !v)}
            >
              <ChevronDown
                size={16} strokeWidth={1.7}
                color="rgba(var(--ink-rgb),0.35)"
                style={{ transform: showFiliereMenu ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
              />
            </SettingsRow>
            {showFiliereMenu && (
              <div style={{
                margin: '0 16px 12px',
                background: 'var(--bone)',
                border: '1px solid rgba(var(--ink-rgb),0.10)',
                borderRadius: 14, overflow: 'hidden',
              }}>
                {FILIERES.map(f => (
                  <button
                    key={f}
                    onClick={() => handleFiliereSelect(f)}
                    style={{
                      width: '100%', textAlign: 'left', border: 'none',
                      borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
                      background: f === pendingFiliere ? '#F6F5AE' : 'transparent',
                      padding: '11px 16px',
                      fontFamily: "'Geologica', sans-serif",
                      fontWeight: f === pendingFiliere ? 500 : 300,
                      fontSize: 13, color: 'var(--ink)',
                      cursor: 'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compétences */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(var(--ink-rgb),0.06)' }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', marginBottom: 10,
            }}>
              Compétences
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {profile.skills.map(s => (
                <div
                  key={s}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--bone)',
                    border: '1.5px solid rgba(var(--ink-rgb),0.12)',
                    borderRadius: 999, padding: '6px 12px',
                    fontSize: 12,
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, color: 'var(--ink)',
                  }}
                >
                  {s}
                  <button
                    onClick={() => handleRemoveSkill(s)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, display: 'flex', alignItems: 'center',
                      color: 'rgba(var(--ink-rgb),0.4)',
                    }}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              {addingSkill ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(); if (e.key === 'Escape') { setAddingSkill(false); setNewSkill('') } }}
                    placeholder="Nouvelle compétence…"
                    style={{
                      border: '1.5px solid rgba(var(--ink-rgb),0.20)',
                      borderRadius: 999, padding: '6px 12px',
                      fontSize: 12, fontFamily: "'Geologica', sans-serif",
                      background: 'var(--paper)', color: 'var(--ink)',
                      outline: 'none', width: 160,
                    }}
                  />
                  <button
                    onClick={handleAddSkill}
                    style={{
                      background: '#181713', color: '#F6F5AE',
                      border: 'none', borderRadius: 999,
                      padding: '6px 12px', fontSize: 12,
                      fontFamily: "'Montserrat Alternates', sans-serif",
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Ajouter
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingSkill(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'transparent',
                    border: '1.5px dashed rgba(var(--ink-rgb),0.20)',
                    borderRadius: 999, padding: '6px 12px',
                    fontSize: 12,
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, color: 'rgba(var(--ink-rgb),0.45)',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={13} strokeWidth={2.2} /> Ajouter
                </button>
              )}
            </div>
          </div>
        </SettingsGroup>

        {/* ── VISIBILITÉ ── */}
        <SettingsGroup title="Visibilité">
          <SettingsRow
            label={profile.available ? 'Disponible' : 'Hors-ligne'}
            description="Les autres peuvent te solliciter"
          >
            <Toggle on={profile.available} onChange={handleAvailable} />
          </SettingsRow>

          <div style={{ padding: '14px 16px' }}>
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', marginBottom: 4,
            }}>
              Rayon de visibilité
            </div>
            <div style={{ fontSize: 11.5, color: 'rgba(var(--ink-rgb),0.45)', marginBottom: 12 }}>
              Zone dans laquelle tes demandes sont diffusées
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {RADII.map(r => {
                const active = (profile.campus_radius ?? 'campus') === r.key
                return (
                  <button
                    key={r.key}
                    onClick={() => handleRadius(r.key)}
                    style={{
                      flex: 1, padding: '9px 4px',
                      borderRadius: 12,
                      background: active ? '#F6F5AE' : 'var(--bone)',
                      border: `1.5px solid ${active ? '#181713' : 'rgba(var(--ink-rgb),0.12)'}`,
                      color: active ? '#181713' : 'var(--ink)',
                      fontFamily: "'Montserrat Alternates', sans-serif",
                      fontWeight: 600, fontSize: 11.5,
                      cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>
        </SettingsGroup>

        {/* ── APPARENCE ── */}
        <SettingsGroup title="Apparence">
          <SettingsRow
            label="Mode sombre"
            description={isDark ? 'Activé' : 'Désactivé'}
            icon={isDark ? <Moon size={16} strokeWidth={1.7} /> : <Sun size={16} strokeWidth={1.7} />}
          >
            <Toggle on={isDark} onChange={toggle} />
          </SettingsRow>
        </SettingsGroup>

        {/* ── CONFIDENTIALITÉ ── */}
        <SettingsGroup title="Confidentialité">
          <SettingsRow
            label="Profil public"
            description="Ton nom et ta filière sont visibles des autres"
            icon={<Shield size={16} strokeWidth={1.7} />}
          >
            <div style={{
              padding: '3px 10px', borderRadius: 999,
              background: 'rgba(58,138,74,0.10)',
              fontSize: 11, fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, color: '#3a8a4a',
            }}>
              Activé
            </div>
          </SettingsRow>
        </SettingsGroup>

        {/* ── À PROPOS ── */}
        <SettingsGroup title="À propos">
          <SettingsRow
            label="Relay"
            description="Version 1.0 · Ynov Lyon"
            icon={<Info size={16} strokeWidth={1.7} />}
          >
            <div style={{
              padding: '3px 10px', borderRadius: 999,
              background: '#F6F5AE',
              border: '1px solid rgba(24,23,19,0.15)',
              fontSize: 11, fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, color: '#181713',
            }}>
              v1.0
            </div>
          </SettingsRow>
        </SettingsGroup>

        {/* ── DÉCONNEXION ── */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            width: '100%', padding: '16px',
            background: 'var(--paper)',
            border: '1.5px solid rgba(var(--ink-rgb),0.10)',
            borderRadius: 18, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 14, color: '#D94F3D',
            transition: 'all .15s',
          }}
        >
          <LogOut size={17} strokeWidth={2} />
          Se déconnecter
        </button>
      </div>

      {/* ── Logout popup ──────────────────────────────── */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 600,
            background: 'rgba(var(--ink-rgb),0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            style={{
              background: 'var(--paper)',
              borderRadius: 24, padding: '28px 24px',
              maxWidth: 320, width: '100%',
              boxShadow: '0 16px 60px rgba(0,0,0,0.18)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <img
              src={isDark ? '/logo-t-color.png' : '/logo-t-black.png'}
              alt="Relay"
              style={{ height: 44, width: 'auto', display: 'block', margin: '0 auto 16px' }}
            />
            <div style={{
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 18,
              textAlign: 'center', marginBottom: 8, color: 'var(--ink)',
            }}>
              Tu pars déjà ?
            </div>
            <div style={{
              fontSize: 13, color: 'rgba(var(--ink-rgb),0.55)',
              textAlign: 'center', lineHeight: 1.5, marginBottom: 24,
            }}>
              Tu seras déconnecté·e de ton compte Relay.
            </div>
            <button
              onClick={onSignOut}
              style={{
                width: '100%', padding: '15px',
                background: '#D94F3D', color: '#fff',
                border: 'none', borderRadius: 14,
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 700, fontSize: 15,
                cursor: 'pointer', marginBottom: 10,
              }}
            >
              Se déconnecter
            </button>
            <button
              onClick={() => setShowLogoutConfirm(false)}
              style={{
                width: '100%', padding: '14px',
                background: 'transparent',
                border: '1.5px solid rgba(var(--ink-rgb),0.12)',
                borderRadius: 14,
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 14,
                color: 'var(--ink)', cursor: 'pointer',
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────

function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 11,
        letterSpacing: 0.5, textTransform: 'uppercase',
        color: 'rgba(var(--ink-rgb),0.45)', marginBottom: 8,
        paddingLeft: 4,
      }}>
        {title}
      </div>
      <div style={{
        background: 'var(--paper)',
        border: '1px solid rgba(var(--ink-rgb),0.09)',
        borderRadius: 18, overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, description, icon, children, onClick }: {
  label: string
  description?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
}) {
  const inner = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: '1px solid rgba(var(--ink-rgb),0.06)',
      width: '100%', textAlign: 'left',
    }}>
      {icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 9,
          background: 'rgba(var(--ink-rgb),0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink)', flexShrink: 0,
        }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 13.5, color: 'var(--ink)',
        }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 11.5, color: 'rgba(var(--ink-rgb),0.45)', marginTop: 1 }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  )

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{ all: 'unset', display: 'block', width: '100%', boxSizing: 'border-box', cursor: 'pointer' }}
      >
        {inner}
      </button>
    )
  }
  return <div>{inner}</div>
}
