import { useState } from 'react'
import HomeScreen from './pages/HomeScreen'
import MissionScreen from './pages/MissionScreen'
import ComparisonSortActivity from './pages/ComparisonSortActivity'
import FreePlayGrid from './pages/FreePlayGrid'
import StoreScreen from './pages/StoreScreen'
import BuilderToolStep from './pages/BuilderToolStep'
import AuthScreen from './pages/AuthScreen'
import ResetPasswordScreen from './pages/ResetPasswordScreen'
import LeaderboardScreen from './pages/LeaderboardScreen'
import AdminScreen from './pages/AdminScreen'
import CaseListScreen from './pages/CaseListScreen'
import { loadProject } from './lib/projectStore'
import { loadCaseProgress } from './lib/progressStore'
import { AuthProvider, useAuth } from './lib/AuthContext'

function AppShell() {
  const { session, isGuest, loading, recovering, isAdmin, hasFullAccess, signOut, exitGuestMode } = useAuth()
  const [screen, setScreen] = useState({ name: 'home' })

  const goHome = () => setScreen({ name: 'home' })

  const handleSelectTheme = (theme) => {
    setScreen({ name: 'caselist', themeId: theme.id, themeName: theme.name })
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

  if (recovering) {
    return <ResetPasswordScreen />
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

  if (screen.name === 'caselist') {
    const currentCaseNumber = loadCaseProgress(screen.themeId)?.caseNumber || 1
    return (
      <CaseListScreen
        themeId={screen.themeId}
        themeName={screen.themeName}
        currentCaseNumber={currentCaseNumber}
        hasFullAccess={hasFullAccess}
        onBack={goHome}
        onContinue={() => setScreen({ name: 'mission', themeId: screen.themeId, themeName: screen.themeName })}
      />
    )
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
