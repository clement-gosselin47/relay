interface ToggleProps {
  on: boolean
  onChange: (v: boolean) => void
  size?: 'sm' | 'lg'
  darkTrack?: boolean
}

export function Toggle({ on, onChange, size = 'sm', darkTrack }: ToggleProps) {
  const w = size === 'lg' ? 56 : 44
  const h = size === 'lg' ? 30 : 24
  const dot = h - 6

  const trackBg = on
    ? (darkTrack ? '#181713' : 'var(--yellow)')
    : `rgba(var(--ink-rgb),0.15)`
  const dotBg = on
    ? (darkTrack ? '#F6F5AE' : '#181713')
    : 'var(--paper)'

  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: w, height: h, borderRadius: h,
        background: trackBg,
        border: 'none', cursor: 'pointer',
        position: 'relative', transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 3, left: on ? w - dot - 3 : 3,
        width: dot, height: dot, borderRadius: '50%',
        background: dotBg,
        transition: 'left .2s',
      }} />
    </button>
  )
}
