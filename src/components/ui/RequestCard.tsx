import { MapPin, Zap, ArrowRight } from 'lucide-react'
import { Avatar } from './Avatar'
import { timeAgo, minutesLeft } from '../../lib/utils'
import type { Request } from '../../types'

interface RequestCardProps {
  r: Request
  variant: 'yellow' | 'white'
  isHelping: boolean
  onHelp: () => void
}

export function RequestCard({ r, variant, isHelping, onHelp }: RequestCardProps) {
  const yellow = variant === 'yellow'
  const mins = r.expires_at ? minutesLeft(r.expires_at) : null

  const ink = '#181713'
  const ink60 = yellow ? 'rgba(24,23,19,0.60)' : 'rgba(var(--ink-rgb),0.60)'
  const inkColor = yellow ? ink : 'var(--ink)'
  const borderDashed = yellow ? 'rgba(24,23,19,0.18)' : 'rgba(var(--ink-rgb),0.10)'

  return (
    <div style={{
      background: yellow ? '#F6F5AE' : 'var(--paper)',
      border: yellow ? 'none' : '1px solid rgba(var(--ink-rgb),0.12)',
      borderRadius: 24,
      padding: '18px 18px 16px',
      color: inkColor,
      animation: 'slide-up .3s ease',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 160,
    }}>
      {/* TOP — auteur + badge urgence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Avatar name={r.author?.name ?? '?'} size={26} />
        {r.author && (
          <div style={{ fontSize: 12, lineHeight: 1 }}>
            <span style={{ fontWeight: 600, color: inkColor }}>
              {r.author.name.split(' ')[0]}
            </span>
            <span style={{ color: ink60 }}> · {r.author.filiere}</span>
          </div>
        )}

        {r.urgent && mins !== null && mins > 0 && (
          <span style={{
            marginLeft: 'auto',
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 11,
            padding: '4px 9px', borderRadius: 999,
            background: ink, color: '#F6F5AE',
            letterSpacing: 0.3,
            flexShrink: 0,
          }}>
            <Zap size={11} strokeWidth={2} /> {mins} min
          </span>
        )}
      </div>

      {/* TITRE */}
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600,
        fontSize: 19,
        lineHeight: 1.15,
        letterSpacing: -0.4,
        color: inkColor,
      }}>
        {r.title}
      </div>

      {/* Spacer — pousse le footer en bas */}
      <div style={{ flex: 1 }} />

      {/* FOOTER — ancré en bas */}
      <div style={{
        display: 'flex', alignItems: 'center',
        paddingTop: 12,
        borderTop: `1px dashed ${borderDashed}`,
        marginTop: 12,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: inkColor }}>
          <MapPin size={13} strokeWidth={1.7} /> {r.location}
        </span>
        <span style={{
          width: 3, height: 3, borderRadius: '50%',
          background: ink60, flexShrink: 0, margin: '0 8px',
        }} />
        <span style={{ fontSize: 12, color: ink60 }}>
          {timeAgo(r.created_at)}
        </span>

        <button
          onClick={onHelp}
          disabled={isHelping}
          style={{
            marginLeft: 'auto',
            padding: '9px 14px', borderRadius: 999,
            background: isHelping ? 'rgba(var(--ink-rgb),0.12)' : 'var(--ink)',
            color: isHelping ? 'rgba(var(--ink-rgb),0.35)' : 'var(--bone)',
            border: 'none', cursor: isHelping ? 'default' : 'pointer',
            fontFamily: "'Montserrat Alternates', sans-serif",
            fontWeight: 600, fontSize: 12.5,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            transition: 'all .15s',
            flexShrink: 0,
          }}
        >
          {isHelping ? 'En cours…' : "J'aide"} {!isHelping && <ArrowRight size={13} />}
        </button>
      </div>
    </div>
  )
}
