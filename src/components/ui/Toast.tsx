import { useEffect } from 'react'

export type ToastType = 'success' | 'info' | 'error'

interface ToastProps {
  message: string
  type?: ToastType
  onDismiss: () => void
  duration?: number
}

export function Toast({ message, type = 'success', onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration)
    return () => clearTimeout(t)
  }, [onDismiss, duration])

  const bg = type === 'success' ? '#181713' : type === 'error' ? '#c0392b' : '#3d3a35'

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', bottom: 100, left: '50%',
        transform: 'translateX(-50%)',
        background: bg, color: type === 'success' ? '#F6F5AE' : '#fff',
        padding: '12px 20px', borderRadius: 999,
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
        zIndex: 9999, cursor: 'pointer',
        whiteSpace: 'nowrap',
        animation: 'slide-up .25s ease',
        maxWidth: 'calc(100vw - 40px)',
        textAlign: 'center',
      }}
    >
      {message}
    </div>
  )
}
