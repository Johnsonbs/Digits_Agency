import { useState } from 'react'
import HomeScreen from './pages/HomeScreen'
import MissionScreen from './pages/MissionScreen'
import ComparisonSortActivity from './pages/ComparisonSortActivity'
import FreePlayGrid from './pages/FreePlayGrid'
import StoreScreen from './pages/StoreScreen'
import BuilderToolStep from './pages/BuilderToolStep'
import AuthScreen from './pages/AuthScreen'
import LeaderboardScreen from './pages/LeaderboardScreen'
import AdminScreen from './pages/AdminScreen'
import { loadProject } from './lib/projectStore'
import { AuthProvider, useAuth } from './lib/AuthContext'

function AppShell() {
  const { session, isGuest, loading, isAdmin, signOut, exitGuestMode } = useAuth()
  const [screen, setScreen] = useState({ name: 'home' })

  const goHome = () => setScreen({ name: 'home' })

  const handleSelectTheme = (theme) => {
    console.log(theme.name)
    setScreen({ name: 'mission', themeId: theme.id, themeName: theme.name })
  }

  const handleUploadProject = (project) => {
    setScreen({ name: 'freeplay', project })
  }

  const handleOpenProject = (projectId) => {
    const project = loadProject(projectId)
    if (project) setScreen({ name: 'freeplay', project })
  }

  if (loading) {
    return <div className="page" aria-busy="true" />
  }

  if (!session && !isGuest) {
    return <AuthScreen />
  }

  if (screen.name === 'leaderboard') {
    return <LeaderboardScreen onBack={goHome} />
  }

  if (screen.name === 'admin' && isAdmin) {
    return <AdminScreen onBack={goHome} />
  }

  if (screen.name === 'mission') {
    return <MissionScreen themeId={screen.themeId} themeName={screen.themeName} onBack={goHome} />
  }

  if (screen.name === 'practice') {
    return <ComparisonSortActivity onBack={goHome} />
  }

  if (screen.name === 'freeplay') {
    return <FreePlayGrid key={screen.project.id || 'new'} initialProject={screen.project} onBack={goHome} />
  }

  if (screen.name === 'store') {
    return <StoreScreen onBack={goHome} />
  }

  if (screen.name === 'builder') {
    return <BuilderToolStep toolId={screen.toolId} onBack={goHome} />
  }

  return (
    <HomeScreen
      onSelectTheme={handleSelectTheme}
      onOpenPractice={() => setScreen({ name: 'practice' })}
      onUploadProject={handleUploadProject}
      onOpenProject={handleOpenProject}
      onOpenStore={() => setScreen({ name: 'store' })}
      onOpenBuilder={() => setScreen({ name: 'builder', toolId: 'health-bmi' })}
      onOpenLeaderboard={() => setScreen({ name: 'leaderboard' })}
      onOpenAdmin={isAdmin ? () => setScreen({ name: 'admin' }) : null}
      isGuest={isGuest}
      onSignOut={signOut}
      onExitGuest={exitGuestMode}
    />
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
