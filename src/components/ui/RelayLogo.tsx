interface RelayLogoProps {
  size?: number
  color?: string
}

export function RelayLogo({ size = 24, color = '#F6F5AE' }: RelayLogoProps) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Index */}
      <rect x="9"  y="6"  width="4" height="14" rx="2" fill={color} />
      {/* Middle */}
      <rect x="14" y="3"  width="4" height="17" rx="2" fill={color} />
      {/* Ring */}
      <rect x="19" y="4"  width="4" height="16" rx="2" fill={color} />
      {/* Pinky */}
      <rect x="24" y="8"  width="3.5" height="12" rx="1.75" fill={color} />
      {/* Palm */}
      <ellipse cx="16" cy="22" rx="10" ry="7" fill={color} />
      {/* Thumb curling right */}
      <rect x="4" y="17" width="8" height="4" rx="2" fill={color}
        transform="rotate(-25 4 17)" />
    </svg>
  )
}
