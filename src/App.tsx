import { useState, useEffect } from 'react'
import './index.css'
import { useAuth } from './hooks/useAuth'
import { useMediaQuery } from './hooks/useMediaQuery'
import { AuthModal } from './components/auth/AuthModal'
import { BottomBar } from './components/layout/BottomBar'
import { Toast } from './components/ui/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { CreateScreen } from './screens/CreateScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { DesktopScreen } from './screens/DesktopScreen'
import { RelayLogo } from './components/ui/RelayLogo'

type MobileScreen = 'home' | 'profile'

export default function App() {
  const { user, profile, loading, signIn, signOut, updateProfile } = useAuth()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
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
    <div style={{
      maxWidth: 480, margin: '0 auto',
      height: '100svh', position: 'relative',
      overflow: 'hidden', background: '#F0EEE9',
    }}>
      {/* Screens */}
      <div style={{ height: '100%', position: 'relative' }}>
        {mobileScreen === 'home' && (
          <HomeScreen
            userId={user.id}
            userName={profile.name}
          />
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
          onClose={() => setShowCreate(false)}
          onSuccess={() => {
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
  )
}

function SplashScreen() {
  return (
    <div style={{
      height: '100svh', display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#F0EEE9', gap: 16,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 22,
        background: '#181713',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'breathe 2s ease-in-out infinite',
      }}>
        <RelayLogo size={40} color="#F6F5AE" />
      </div>
      <div style={{
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700, fontSize: 28, letterSpacing: -1,
        color: '#181713',
      }}>
        Relay
      </div>
    </div>
  )
}
