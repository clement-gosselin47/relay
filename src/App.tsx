import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import './index.css'
import { useAuth } from './hooks/useAuth'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useRequests } from './hooks/useRequests'
import { useTheme } from './context/ThemeContext'
import { AuthModal } from './components/auth/AuthModal'
import { BottomBar } from './components/layout/BottomBar'
import { Toast } from './components/ui/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { CreateScreen } from './screens/CreateScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { MessagesScreen } from './screens/MessagesScreen'
import { DesktopScreen } from './screens/DesktopScreen'

type MobileScreen = 'home' | 'messages' | 'profile'

export default function App() {
  const { user, profile, loading, signIn, signOut, updateProfile } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const { requests, loading: reqLoading, addRequest } = useRequests()
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('home')
  const [showCreate, setShowCreate]     = useState(false)
  const [successToast, setSuccessToast] = useState(false)

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  if (loading) return <SplashScreen />
  if (!user || !profile) return <AuthModal onSignIn={signIn} />

  if (isDesktop) {
    return (
      <DesktopScreen
        profile={profile}
        onUpdate={updateProfile}
        onSignOut={signOut}
      />
    )
  }

  // ── Mobile layout ──
  return (
    <>
    <div style={{
      width: '100%', maxWidth: 480, margin: '0 auto',
      height: '100svh', position: 'relative',
      overflow: 'hidden', background: 'var(--bone)',
    }}>
      {/* Screens */}
      <div style={{ height: '100%', position: 'relative' }}>
        {mobileScreen === 'home' && (
          <HomeScreen
            userId={user.id}
            userName={profile.name}
            requests={requests}
            loading={reqLoading}
            onNavigateToMessages={() => setMobileScreen('messages')}
          />
        )}
        {mobileScreen === 'messages' && (
          <MessagesScreen userId={user.id} />
        )}
        {mobileScreen === 'profile' && (
          <ProfileScreen
            profile={profile}
            onUpdate={updateProfile}
            onSignOut={signOut}
          />
        )}
      </div>

      {/* Create overlay */}
      {showCreate && (
        <CreateScreen
          userId={user.id}
          profile={profile}
          onClose={() => setShowCreate(false)}
          onSuccess={(newRequest) => {
            addRequest(newRequest)
            setShowCreate(false)
            setMobileScreen('home')
            setSuccessToast(true)
          }}
        />
      )}

      {/* Bottom bar */}
      <BottomBar
        active={mobileScreen}
        onNavigate={setMobileScreen}
        onCreate={() => setShowCreate(true)}
      />

      {/* Success toast after create */}
      {successToast && (
        <Toast
          message="Demande publiée ✋"
          type="success"
          onDismiss={() => setSuccessToast(false)}
        />
      )}
    </div>
    </>
  )
}


function ThemeToggleButton() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        right: 16,
        zIndex: 150,
        width: 38, height: 38, borderRadius: '50%',
        background: 'var(--paper)',
        border: `1px solid rgba(var(--ink-rgb),0.12)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        color: 'var(--ink)',
      }}
    >
      {theme === 'dark'
        ? <Sun size={16} strokeWidth={1.8} />
        : <Moon size={16} strokeWidth={1.8} />
      }
    </button>
  )
}

function SplashScreen() {
  return (
    <div style={{
      height: '100svh', display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bone)', gap: 16,
    }}>
      <img
        src="/logo-t-color.png"
        alt="Relay"
        style={{
          height: 80, width: 'auto',
          animation: 'breathe 2s ease-in-out infinite',
        }}
      />
    </div>
  )
}
