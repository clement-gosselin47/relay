import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { DEV_BYPASS } from '../lib/dev-mock'
import { CATEGORY } from '../lib/tokens'
import { expiresAt } from '../lib/utils'
import { Toggle } from '../components/ui/Toggle'
import type { Profile, Request } from '../types'

const FILIERES_LIST = ['Design', 'Dev', 'Marketing', 'Audio', 'Création', '3D']
const DURATIONS = [5, 10, 15]

interface CreateScreenProps {
  userId: string
  profile: Profile
  onClose: () => void
  onSuccess: (r: Request) => void
}

export function CreateScreen({ userId, profile, onClose, onSuccess }: CreateScreenProps) {
  const [title, setTitle]       = useState('')
  const [cats, setCats]         = useState<string[]>([])
  const [filieres, setFilieres] = useState<string[]>([])
  const [desc, setDesc]         = useState('')
  const [location, setLocation] = useState('')
  const [urgent, setUrgent]     = useState(false)
  const [duration, setDuration] = useState(15)
  const [loading, setLoading]   = useState(false)

  const isReady = title.trim() && cats.length > 0 && location.trim()

  function toggleCat(key: string) {
    setCats(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key])
  }

  const allSelected = FILIERES_LIST.every(f => filieres.includes(f))

  function toggleFiliere(f: string) {
    if (f === 'Toutes') {
      setFilieres(allSelected ? [] : [...FILIERES_LIST])
    } else {
      setFilieres(prev =>
        prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
      )
    }
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--bone)',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
      maxWidth: 480, left: '50%', transform: 'translateX(-50%)',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid rgba(var(--ink-rgb),0.06)`,
        background: 'var(--bone)', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--paper)', border: `1px solid rgba(var(--ink-rgb),0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--ink)',
        }}>
          <X size={18} />
        </button>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 14,
          letterSpacing: 0.3, textTransform: 'uppercase', color: 'var(--ink)',
        }}>
          Demande flash
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Form */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px 20px 120px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* 1 — Titre */}
        <FormSection num={1} label="Ton besoin en une phrase">
          <textarea
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex : J'ai besoin d'aide sur Figma pour ma maquette"
            rows={2}
            maxLength={120}
            style={{
              ...textAreaStyle,
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 17, letterSpacing: -0.2,
            }}
          />
        </FormSection>

        {/* 2 — Catégories (multi) */}
        <FormSection num={2} label="Catégories">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(CATEGORY).map(([key, def]) => {
              const active = cats.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleCat(key)}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: active ? 'var(--ink)' : 'var(--paper)',
                    border: `1.5px solid ${active ? 'var(--ink)' : `rgba(var(--ink-rgb),0.12)`}`,
                    color: active ? 'var(--yellow)' : 'var(--ink)',
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span>{def.emoji}</span>
                  {def.label}
                </button>
              )
            })}
          </div>
        </FormSection>

        {/* 3 — Filières */}
        <FormSection
          num={3}
          label="Filières ciblées (optionnel)"
          hint="Quelle filière peut t'aider ? Les étudiants de ces filières verront ta demande en priorité."
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FILIERES_LIST.map(f => {
              const active = filieres.includes(f)
              return (
                <button
                  key={f}
                  onClick={() => toggleFiliere(f)}
                  style={{
                    padding: '8px 14px', borderRadius: 999,
                    background: active ? 'var(--ink)' : 'var(--paper)',
                    border: `1.5px solid ${active ? 'var(--ink)' : `rgba(var(--ink-rgb),0.12)`}`,
                    color: active ? 'var(--yellow)' : 'var(--ink)',
                    fontFamily: "'Montserrat Alternates', sans-serif",
                    fontWeight: 600, fontSize: 13,
                    cursor: 'pointer', transition: 'all .15s',
                  }}
                >
                  {f}
                </button>
              )
            })}
            <button
              onClick={() => toggleFiliere('Toutes')}
              style={{
                padding: '8px 14px', borderRadius: 999,
                background: allSelected ? 'var(--ink)' : 'var(--paper)',
                border: `1.5px solid ${allSelected ? 'var(--ink)' : `rgba(var(--ink-rgb),0.12)`}`,
                color: allSelected ? 'var(--yellow)' : 'var(--ink)',
                fontFamily: "'Montserrat Alternates', sans-serif",
                fontWeight: 600, fontSize: 13,
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              Toutes
            </button>
          </div>
        </FormSection>

        {/* 4 — Localisation */}
        <FormSection num={4} label="Où es-tu ?">
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Ex : Bât. B · Salle 204, Cafétéria RDC…"
            style={inputStyle}
          />
        </FormSection>

        {/* 5 — Description */}
        <FormSection num={5} label="Description (optionnel)">
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Donne quelques détails pour aider tes camarades"
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
              <Toggle on={urgent} onChange={setUrgent} />
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

      {/* Submit */}
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

function FormSection({ num, label, hint, children }: {
  num: number
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: hint ? 6 : 10,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: '#181713', color: '#F6F5AE',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700, fontSize: 11, flexShrink: 0,
        }}>
          {num}
        </div>
        <span style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 13,
          letterSpacing: 0.2, color: 'var(--ink)',
        }}>
          {label}
        </span>
      </div>
      {hint && (
        <p style={{
          margin: '0 0 10px 30px',
          fontFamily: "'Geologica', sans-serif",
          fontWeight: 300, fontSize: 12,
          color: `rgba(var(--ink-rgb),0.55)`,
          lineHeight: 1.45,
        }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'var(--paper)',
  border: `1.5px solid rgba(var(--ink-rgb),0.12)`,
  borderRadius: 14, padding: '14px 16px',
  fontFamily: "'Geologica', sans-serif",
  fontWeight: 300, fontSize: 15,
  color: 'var(--ink)', outline: 'none',
}

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.4,
}
