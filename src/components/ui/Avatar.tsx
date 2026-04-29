import { avatarBg, initials } from '../../lib/utils'

interface AvatarProps {
  name: string
  size?: number
  ring?: boolean
}

export function Avatar({ name, size = 36, ring = false }: AvatarProps) {
  const bg = avatarBg(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Montserrat Alternates', sans-serif",
      fontWeight: 700,
      fontSize: size * 0.38,
      color: '#181713',
      flexShrink: 0,
      outline: ring ? `3px solid #F6F5AE` : 'none',
      outlineOffset: 2,
    }}>
      {initials(name)}
    </div>
  )
}
