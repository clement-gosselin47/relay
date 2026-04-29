import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { CATEGORY } from '../lib/tokens'
import { expiresAt } from '../lib/utils'
import { Toggle } from '../components/ui/Toggle'

const FILIERES = ['Design', 'Dev', 'Marketing', 'Audio', 'Création', '3D', 'Toutes']
const DURATIONS = [5, 10, 15, 30, 60]

interface CreateScreenProps {
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export function CreateScreen({ userId, onClose, onSuccess }: CreateScreenProps) {
  const [title, setTitle]       = useState('')
  const [cat, setCat]           = useState<string | null>(null)
  const [filieres, setFilieres] = useState<string[]>([])
  const [desc, setDesc]         = useState('')
  const [location, setLocation] = useState('')
  const [urgent, setUrgent]     = useState(false)
  const [duration, setDuration] = useState(15)
  const [loading, setLoading]   = useState(false)

  const isReady = title.trim() && cat && location.trim()

  function toggleFiliere(f: string) {
    setFilieres(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  async function handleSubmit() {
    if (!isReady || loading) return
    setLoading(true)

    const { error } = await supabase.from('requests').insert({
      author_id:       userId,
      title:           title.trim(),
      description:     desc.trim() || null,
      category:        cat!,
      target_filieres: filieres,
      location:        location.trim(),
      urgent,
      duration_min:    urgent ? duration : null,
      expires_at:      urgent ? expiresAt(duration) : null,
      status:          'active',
    })

    setLoading(false)
    if (!error) { onSuccess() }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: '#F0EEE9',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geologica', sans-serif",
      maxWidth: 480, left: '50%', transform: 'translateX(-50%)',
      width: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '56px 20px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(24,23,19,0.06)',
        background: '#F0EEE9', flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: '50%',
          background: '#FAFAF7', border: '1px solid rgba(24,23,19,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <X size={18} color="#181713" />
        </button>
        <div style={{
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 600, fontSize: 14,
          letterSpacing: 0.3, textTransform: 'uppercase', color: '#181713',
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
            placeholder="Ex : Câble HDMI pour une soutenance dans 10 min"
            rows={2}
            maxLength={120}
            style={{
              ...textAreaStyle,
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 600, fontSize: 17, letterSpacing: -0.2,
            }}
          />
        </FormSection>

        {/* 2 — Catégorie */}
        <FormSection num={2} label="Catégorie">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {Object.entries(CATEGORY).map(([key, def]) => (
              <button
                key={key}
                onClick={() => setCat(cat === key ? null : key)}
                style={{
                  padding: '14px 8px',
                  borderRadius: 16,
                  background: cat === key ? '#181713' : '#FAFAF7',
                  border: `1.5px solid ${cat === key ? '#181713' : 'rgba(24,23,19,0.12)'}`,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  transition: 'all .15s',
                }}
              >
                <span style={{ fontSize: 24 }}>{def.emoji}</span>
                <span style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 11,
                  color: cat === key ? '#F6F5AE' : '#181713',
                }}>
                  {def.label}
                </span>
              </button>
            ))}
          </div>
        </FormSection>

        {/* 3 — Filières */}
        <FormSection num={3} label="Filières ciblées (optionnel)">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {FILIERES.map(f => (
              <button
                key={f}
                onClick={() => toggleFiliere(f)}
                style={{
                  padding: '8px 14px', borderRadius: 999,
                  background: filieres.includes(f) ? '#181713' : '#FAFAF7',
                  border: `1.5px solid ${filieres.includes(f) ? '#181713' : 'rgba(24,23,19,0.12)'}`,
                  color: filieres.includes(f) ? '#F6F5AE' : '#181713',
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 13,
                  cursor: 'pointer', transition: 'all .15s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </FormSection>

        {/* 4 — Description */}
        <FormSection num={4} label="Description (optionnel)">
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Donne quelques détails pour aider tes camarades"
            rows={3}
            maxLength={300}
            style={textAreaStyle}
          />
        </FormSection>

        {/* 5 — Localisation */}
        <FormSection num={5} label="Où es-tu ?">
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Ex : Bât. B · Salle 204, Cafétéria RDC…"
            style={inputStyle}
          />
        </FormSection>

        {/* 6 — Urgence */}
        <FormSection num={6} label="C'est urgent ?">
          <div style={{
            background: urgent ? '#F6F5AE' : '#FAFAF7',
            border: `1.5px solid ${urgent ? '#181713' : 'rgba(24,23,19,0.12)'}`,
            borderRadius: 20, padding: '16px 18px',
            transition: 'all .2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontFamily: "'Montserrat Alternates', sans-serif",
                  fontWeight: 600, fontSize: 15,
                  color: '#181713',
                }}>
                  Demande flash ⚡
                </div>
                <div style={{ fontSize: 13, color: 'rgba(24,23,19,0.6)', marginTop: 2 }}>
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
                  letterSpacing: 0.3, color: 'rgba(24,23,19,0.6)',
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
        background: 'linear-gradient(to top, #F0EEE9 80%, transparent)',
      }}>
        <button
          onClick={handleSubmit}
          disabled={!isReady || loading}
          style={{
            width: '100%', padding: '17px',
            background: isReady && !loading ? '#181713' : 'rgba(24,23,19,0.18)',
            color: isReady && !loading ? '#F6F5AE' : 'rgba(24,23,19,0.35)',
            border: 'none', borderRadius: 18,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 16,
            cursor: isReady && !loading ? 'pointer' : 'default',
            transition: 'all .2s',
          }}
        >
          {loading ? 'Publication…' : 'Lancer la demande ✋'}
        </button>
      </div>
    </div>
  )
}

function FormSection({ num, label, children }: {
  num: number
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 10,
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
          letterSpacing: 0.2, color: '#181713',
        }}>
          {label}
        </span>
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#FAFAF7',
  border: '1.5px solid rgba(24,23,19,0.12)',
  borderRadius: 14, padding: '14px 16px',
  fontFamily: "'Geologica', sans-serif",
  fontWeight: 300, fontSize: 15,
  color: '#181713', outline: 'none',
}

const textAreaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'none',
  lineHeight: 1.4,
}
