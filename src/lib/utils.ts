export function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000 / 60)
  if (diff < 1) return 'à l\'instant'
  if (diff < 60) return `il y a ${diff} min`
  if (diff < 1440) return `il y a ${Math.floor(diff / 60)}h`
  return `il y a ${Math.floor(diff / 1440)}j`
}

const AVATAR_PALETTE = ['#FFD6E0','#D0F0FD','#D4EDDA','#E8D5FF','#FFF3CD','#FDDCB5']

export function avatarBg(name: string): string {
  let h = 0
  for (const c of name) h = c.charCodeAt(0) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

export function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase()
}

export function expiresAt(durationMin: number): string {
  return new Date(Date.now() + durationMin * 60 * 1000).toISOString()
}

export function minutesLeft(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000 / 60))
}
