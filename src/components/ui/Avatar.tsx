import { avatarBg, initials } from '../../lib/utils'

interface AvatarProps {
  name: string
  size?: number
  ring?: boolean
  url?: string | null
}

export function Avatar({ name, size = 36, ring = false, url }: AvatarProps) {
  const bg = avatarBg(name)
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    flexShrink: 0,
    outline: ring ? `3px solid #F6F5AE` : 'none',
    outlineOffset: 2,
  }

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ ...base, objectFit: 'cover', display: 'block' }}
      />
    )
  }

  return (
    <div style={{
      ...base,
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Montserrat Alternates', sans-serif",
      fontWeight: 700,
      fontSize: size * 0.38,
      color: '#181713',
    }}>
      {initials(name)}
    </div>
  )
}
