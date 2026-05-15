import { useState } from 'react'

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
  'Architecture d\'intérieur',
  'BTS SIO SLAM',
  'BTS SIO SISR',
]

interface AuthModalProps {
  onSignIn: (email: string, name: string, filiere: string) => Promise<{ error: Error | null }>
}

export function AuthModal({ onSignIn }: AuthModalProps) {
  const [step, setStep] = useState<'form' | 'sent'>('form')
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const [filiere, setFiliere] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const canSubmit = email.includes('@') && name.trim().length > 0 && filiere !== ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError('')
    const { error } = await onSignIn(email.trim(), name.trim(), filiere)
    setLoading(false)
    if (error) { setError('Une erreur est survenue. Réessaie.'); return }
    setStep('sent')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--bone)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 24px',
      overflow: 'hidden',
    }}>
      {/* Déco jaune */}
      <div style={{
        position: 'absolute', top: -120, right: -100,
        width: 320, height: 320, borderRadius: '50%',
        background: '#F6F5AE', opacity: 0.6,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: '#F6F5AE', opacity: 0.4,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Contenu au-dessus des ronds */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Logo */}
      <img
        src="/logo-t-black.png"
        alt="Relay"
        style={{ height: 88, width: 'auto', marginBottom: 28 }}
      />

      {step === 'sent' ? (
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 28, letterSpacing: -0.8,
            marginBottom: 12,
          }}>
            Vérifie ta boîte mail
          </div>
          <div style={{ fontSize: 15, color: 'rgba(24,23,19,0.65)', lineHeight: 1.5 }}>
            On a envoyé un lien de connexion à <strong>{email}</strong>.<br/>
            Clique dessus pour accéder à Relay.
          </div>
          <button
            onClick={() => setStep('form')}
            style={{
              marginTop: 28, background: 'transparent', border: 'none',
              color: 'rgba(24,23,19,0.5)', fontSize: 13, cursor: 'pointer',
              fontFamily: "'Geologica', sans-serif",
            }}
          >
            Changer d'adresse email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360 }}>
          <div style={{
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 700, fontSize: 30, letterSpacing: -1,
            marginBottom: 6, textAlign: 'center',
          }}>
            Rejoindre Relay
          </div>
          <div style={{
            fontSize: 14, color: 'rgba(24,23,19,0.6)',
            textAlign: 'center', marginBottom: 32, lineHeight: 1.4,
          }}>
            Tends la main, reçois un coup de pouce.
          </div>

          <Label>Ton prénom</Label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Clément"
            autoComplete="given-name"
            style={inputStyle}
          />

          <Label>Email Ynov</Label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="prenom.nom@ynov.com"
            autoComplete="email"
            style={inputStyle}
          />

          <Label>Ta filière</Label>
          <select
            value={filiere}
            onChange={e => setFiliere(e.target.value)}
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
          >
            <option value="">Choisir…</option>
            {FILIERES.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {error && (
            <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || loading}
            style={{
              width: '100%', padding: '16px',
              background: canSubmit && !loading ? '#181713' : '#D8D6D1',
              color: canSubmit && !loading ? '#F6F5AE' : '#A8A5A0',
              border: 'none', borderRadius: 16,
              fontFamily: "'Montserrat Alternates', sans-serif",
              fontWeight: 700, fontSize: 15,
              cursor: canSubmit && !loading ? 'pointer' : 'default',
              transition: 'all .2s',
            }}
          >
            {loading ? 'Envoi…' : 'Recevoir mon lien de connexion'}
          </button>
        </form>
      )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Montserrat Alternates', sans-serif",
      fontWeight: 600, fontSize: 12,
      letterSpacing: 0.4, textTransform: 'uppercase' as const,
      color: 'rgba(24,23,19,0.55)', marginBottom: 8,
    }}>
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
  marginBottom: 16,
}
