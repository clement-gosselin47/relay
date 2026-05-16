import { useState } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DEV_BYPASS } from '../lib/dev-mock'
import { CATEGORY } from '../lib/tokens'
import { expiresAt } from '../lib/utils'
import { Toggle } from '../components/ui/Toggle'
import type { Profile, Request } from '../types'

const FILIERES_LIST = [
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

const DURATIONS = [5, 10, 15]

interface CreateScreenProps {
  userId: string
  profile: Profile
  onClose: () => void
  onSuccess: (r: Request) => void
}

export function CreateScreen({ userId, profile, onClose, onSuccess }: CreateScreenProps) {
  const [title, setTitle]                 = useState('')
  const [cats, setCats]                   = useState<string[]>([])
  const [filieres, setFilieres]           = useState<string[]>([])
  const [showFiliereMenu, setShowFiliereMenu] = useState(false)
  const [desc, setDesc]                   = useState('')
  const [location, setLocation]           = useState('')
  const [urgent, setUrgent]               = useState(false)
  const [duration, setDuration]           = useState(15)
  const [loading, setLoading]             = useState(false)

  const isReady = title.trim() && cats.length > 0 && location.trim()
  const allSelected = filieres.length === FILIERES_LIST.length

  function toggleCat(key: string) {
    setCats(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  function toggleFiliere(f: string) {
    setFilieres(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  function toggleAll() {
    setFilieres(allSelected ? [] : [...FILIERES_LIST])
  }

  async function handleSubmit() {
    if (!isReady || loading) return
    setLoading(true)

    const now = new Date().toISOString()
    const newRequest: Request = {
      id:              DEV_BYPASS ? `req-${Date.now()}` : '',
      author_id:       userId,
      title:           title.trim(),
      description:     desc.trim() || null,
      categories:      cats,
      target_filieres: filieres,
      location:        location.trim(),
      urgent,
      duration_min:    urgent ? duration : null,
      expires_at:      urgent ? expiresAt(duration) : null,
      status:          'active',
      created_at:      now,
      author:          profile,
    }

    if (DEV_BYPASS) {
      setLoading(false)
      onSuccess(newRequest)
      return
    }

    const { data, error } = await supabase
      .from('requests')
      .insert({
        author_id:       userId,
        title:           newRequest.title,
        description:     newRequest.description,
        categories:      newRequest.categories,
        target_filieres: newRequest.target_filieres,
        location:        newRequest.location,
        urgent:          newRequest.urgent,
        duration_min:    newRequest.duration_min,
        expires_at:      newRequest.expires_at,
        status:          'active',
      })
      .select('id')
      .single()

    setLoading(false)
    if (!error && data) {
      onSuccess({ ...newRequest, id: data.id })
    }
  }

  const filiereLabel = filieres.length === 0
    ? 'Toutes les filières'
    : allSelected
      ? 'Toutes les filières'
      : `${filieres.length} filière${filieres.length > 1 ? 's' : ''} ciblée${filieres.length > 1 ? 's' : ''}`

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bone)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
      maxWidth: 480, left: '50%', transform: 'translateX(-50%)',
      width: '100%',
    }}>

      {/* ── Header ── */}
      <div style={{
        padding: '20px 20px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: `1px solid rgba(var(--ink-rgb),0.06)`,
        background: 'var(--bone)', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--ink)',
        }}>
          <X size={17} />
        </button>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 20,
          letterSpacing: -0.4, lineHeight: 1, color: 'var(--ink)',
        }}>
          Demande flash<span style={{ opacity: 0.3 }}>.</span>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '22px 20px 120px',
        WebkitOverflowScrolling: 'touch',
      }}>

        {/* 1 — Titre */}
        <FormSection num={1} label="Ton besoin en une phrase">
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Décris ton besoin en quelques mots…"
            rows={2}
            maxLength={120}
            style={textAreaStyle}
          />
        </FormSection>

        {/* 2 — Catégories */}
        <FormSection num={2} label="Catégories">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CATEGORY).map(([key, def]) => {
              const active = cats.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleCat(key)}
                  style={{
                    padding: '8px 16px', borderRadius: 999,
                    background: active ? 'var(--ink)' : 'var(--paper)',
                    border: `1.5px solid ${active ? 'var(--ink)' : `rgba(var(--ink-rgb),0.12)`}`,
                    color: active ? 'var(--yellow)' : 'var(--ink)',
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {def.label}
                </button>
              )
            })}
          </div>
        </FormSection>

        {/* 3 — Filières ciblées */}
        <FormSection num={3} label="Filières ciblées (optionnel)">

          {/* Trigger */}
          <button
            onClick={() => setShowFiliereMenu(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--paper)',
              border: `1.5px solid ${showFiliereMenu ? 'var(--ink)' : `rgba(var(--ink-rgb),0.12)`}`,
              borderRadius: showFiliereMenu ? '14px 14px 0 0' : 14,
              padding: '13px 16px',
              cursor: 'pointer', transition: 'border .15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'Geologica', sans-serif",
                fontWeight: 300, fontSize: 14, color: 'var(--ink)',
              }}>
                {filiereLabel}
              </span>
              {filieres.length > 0 && !allSelected && (
                <span style={{
                  background: 'var(--ink)', color: 'var(--yellow)',
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 700, fontSize: 10,
                  padding: '2px 7px', borderRadius: 999,
                }}>
                  {filieres.length}
                </span>
              )}
            </div>
            <ChevronDown
              size={16} strokeWidth={2}
              color={`rgba(var(--ink-rgb),0.45)`}
              style={{ transform: showFiliereMenu ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}
            />
          </button>

          {/* Dropdown panel */}
          {showFiliereMenu && (
            <div style={{
              background: 'var(--paper)',
              border: `1.5px solid var(--ink)`,
              borderTop: `1px solid rgba(var(--ink-rgb),0.08)`,
              borderRadius: '0 0 14px 14px',
              overflow: 'hidden',
              maxHeight: 280, overflowY: 'auto',
            }}>
              {/* Toutes */}
              <FiliereRow
                label="Toutes les filières"
                checked={allSelected}
                onToggle={toggleAll}
                bold
              />
              <div style={{ height: 1, background: `rgba(var(--ink-rgb),0.07)`, margin: '0 16px' }} />
              {FILIERES_LIST.map(f => (
                <FiliereRow
                  key={f}
                  label={f}
                  checked={filieres.includes(f)}
                  onToggle={() => toggleFiliere(f)}
                />
              ))}
            </div>
          )}
        </FormSection>

        {/* 4 — Localisation */}
        <FormSection num={4} label="Où es-tu ?">
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Donne-nous ton emplacement sur le campus…"
            style={inputStyle}
          />
        </FormSection>

        {/* 5 — Description */}
        <FormSection num={5} label="Description (optionnel)">
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Donne quelques détails pour aider tes camarades…"
            rows={3}
            maxLength={300}
            style={textAreaStyle}
          />
        </FormSection>

        {/* 6 — Urgence */}
        <FormSection num={6} label="C'est urgent ?">
          <div style={{
            background: urgent ? '#F6F5AE' : 'var(--paper)',
            border: `1.5px solid ${urgent ? '#181713' : `rgba(var(--ink-rgb),0.12)`}`,
            borderRadius: 20, padding: '16px 18px',
            color: urgent ? '#181713' : 'var(--ink)',
            transition: 'all .2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 15,
                }}>
                  Demande flash
                </div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>
                  Apparaît en priorité avec un timer
                </div>
              </div>
              <Toggle darkTrack on={urgent} onChange={setUrgent} />
            </div>

            {urgent && (
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(24,23,19,0.18)' }}>
                <div style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 12,
                  letterSpacing: 0.3, opacity: 0.6,
                  textTransform: 'uppercase', marginBottom: 10,
                }}>
                  Expire dans
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      style={{
                        padding: '8px 14px', borderRadius: 999,
                        background: duration === d ? '#181713' : 'rgba(24,23,19,0.08)',
                        color: duration === d ? '#F6F5AE' : '#181713',
                        border: 'none', cursor: 'pointer',
                        fontFamily: "'Montserrat Alternates', sans-serif",
                        fontWeight: 600, fontSize: 13,
                        transition: 'all .15s',
                      }}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FormSection>
      </div>

      {/* ── Submit ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '16px 20px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        background: `linear-gradient(to top, var(--bone) 80%, transparent)`,
      }}>
        <button
          onClick={handleSubmit}
          disabled={!isReady || loading}
          style={{
            width: '100%', padding: '17px',
            background: isReady && !loading ? 'var(--ink)' : `rgba(var(--ink-rgb),0.18)`,
            color: isReady && !loading ? 'var(--yellow)' : `rgba(var(--ink-rgb),0.35)`,
            border: 'none', borderRadius: 18,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 16,
            cursor: isReady && !loading ? 'pointer' : 'default',
            transition: 'all .2s',
          }}
        >
          {loading ? 'Publication…' : 'Lancer la demande'}
        </button>
      </div>
    </div>
  )
}

// ── Filière dropdown row ──────────────────────────────────────────

function FiliereRow({ label, checked, onToggle, bold }: {
  label: string
  checked: boolean
  onToggle: () => void
  bold?: boolean
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: checked ? `rgba(var(--ink-rgb),0.04)` : 'transparent',
        border: 'none',
        borderBottom: `1px solid rgba(var(--ink-rgb),0.05)`,
        cursor: 'pointer', textAlign: 'left',
        transition: 'background .1s',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
        background: checked ? 'var(--ink)' : 'transparent',
        border: `1.5px solid ${checked ? 'var(--ink)' : `rgba(var(--ink-rgb),0.25)`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s',
      }}>
        {checked && <Check size={12} strokeWidth={2.5} color="#F6F5AE" />}
      </div>

      <span style={{
        fontFamily: bold ? "'Montserrat Alternates', sans-serif" : "'Geologica', sans-serif",
        fontWeight: bold ? 600 : 300,
        fontSize: 13.5, color: 'var(--ink)',
        flex: 1,
      }}>
        {label}
      </span>
    </button>
  )
}

// ── FormSection ───────────────────────────────────────────────────

function FormSection({ num, label, children }: {
  num: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'var(--ink)', color: '#F6F5AE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 12, flexShrink: 0,
        }}>
          {num}
        </div>
        <span style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 14,
          letterSpacing: 0, color: 'var(--ink)',
        }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--paper)',
  border: `1.5px solid rgba(var(--ink-rgb),0.12)`,
  borderRadius: 14, padding: '14px 16px',
  fontFamily: "'Geologica', sans-serif",
  fontWeight: 300, fontSize: 14,
  color: 'var(--ink)', outline: 'none',
}

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.5,
}
