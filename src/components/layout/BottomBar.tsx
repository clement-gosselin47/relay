import { Home, User, MessageSquare, Settings } from 'lucide-react'

type Screen = 'home' | 'messages' | 'profile' | 'settings'

interface BottomBarProps {
  active: Screen
  onNavigate: (s: Screen) => void
  onCreate: () => void
}

export function BottomBar({ active, onNavigate, onCreate }: BottomBarProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%',
      transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480,
      background: 'var(--paper)',
      borderTop: '1px solid rgba(var(--ink-rgb),0.08)',
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      zIndex: 100,
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        alignItems: 'center',
        padding: '8px 8px 4px',
      }}>
        {/* Home */}
        <NavItem
          onClick={() => onNavigate('home')}
          active={active === 'home'}
          label="Accueil"
          icon={<Home size={22} strokeWidth={active === 'home' ? 2.2 : 1.7} />}
        />

        {/* Messages */}
        <NavItem
          onClick={() => onNavigate('messages')}
          active={active === 'messages'}
          label="Messages"
          icon={<MessageSquare size={22} strokeWidth={active === 'messages' ? 2.2 : 1.7} />}
        />

        {/* FAB — Create (col 3 = center) */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onCreate}
            style={{
              width: 58, height: 58,
              borderRadius: '50%',
              background: '#F6F5AE',
              border: '1.5px solid #181713',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'none',
              transform: 'translateY(-12px)',
              transition: 'transform .15s, box-shadow .15s',
              flexShrink: 0,
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'translateY(-10px) scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'translateY(-12px) scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(-12px) scale(1)')}
          >
            <img src="/logo-t-black.png" alt="" style={{ height: 28, width: 'auto' }} />
          </button>
        </div>

        {/* Profile */}
        <NavItem
          onClick={() => onNavigate('profile')}
          active={active === 'profile'}
          label="Profil"
          icon={<User size={22} strokeWidth={active === 'profile' ? 2.2 : 1.7} />}
        />

        {/* Settings */}
        <NavItem
          onClick={() => onNavigate('settings')}
          active={active === 'settings'}
          label="Réglages"
          icon={<Settings size={22} strokeWidth={active === 'settings' ? 2.2 : 1.7} />}
        />
      </div>
    </div>
  )
}

function NavItem({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        background: 'none', border: 'none', cursor: 'pointer',
        color: active ? 'var(--ink)' : '#6E6C68',
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 600, fontSize: 10, letterSpacing: 0.2,
        padding: '4px 16px',
        transition: 'color .15s',
      }}
    >
      {icon}
      {label}
    </button>
  )
}
