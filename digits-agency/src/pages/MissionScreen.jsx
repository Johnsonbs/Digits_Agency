import { useEffect, useRef, useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import ProgressIndicator from '../components/ProgressIndicator'
import RestartConfirmModal from '../components/RestartConfirmModal'
import CaseBrief from './CaseBrief'
import EntryStep from './EntryStep'
import CleaningStep from './CleaningStep'
import AnalysisStep from './AnalysisStep'
import InterpretationStep from './InterpretationStep'
import CaseCompleteStep from './CaseCompleteStep'
import CaseListScreen from './CaseListScreen'
import { defaultCaseState, activeStepsFor, stepIndexOf, nextStepAfter } from '../lib/caseSteps'
import { loadCaseProgress, saveCaseProgress } from '../lib/progressStore'
import { getCaseConfig, getCaseCount } from '../data/cases'
import { addCoins } from '../lib/walletStore'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { canAccessCase } from '../lib/access'
import './MissionScreen.css'

function MissionScreen({ themeId, themeName, onBack }) {
  const { user, isGuest, hasFullAccess } = useAuth()
  const [caseState, setCaseState] = useState(() => loadCaseProgress(themeId) || defaultCaseState(1))
  const [justEarnedCoins, setJustEarnedCoins] = useState(0)
  const [restartTick, setRestartTick] = useState(0)
  const [confirmRestartScope, setConfirmRestartScope] = useState(null) // null | 'step' | 'case' | 'mission'
  const [showCaseList, setShowCaseList] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  const caseNumber = caseState.caseNumber || 1
  const config = getCaseConfig(themeId, caseNumber)
  const totalCases = getCaseCount(themeId)
  const unlocked = canAccessCase(themeId, caseNumber, { hasFullAccess })

  useEffect(() => {
    saveCaseProgress(themeId, caseState)
  }, [themeId, caseState])

  const updateCase = (partial) => {
    setCaseState((prev) => ({ ...prev, ...partial }))
  }

  const handleHome = () => {
    saveCaseProgress(themeId, caseState)
    onBack()
  }

  const handleRestartStep = () => {
    const fresh = defaultCaseState(caseNumber)
    updateCase({ [caseState.step]: fresh[caseState.step] })
    setRestartTick((t) => t + 1)
    setConfirmRestartScope(null)
  }

  const handleRestartCase = () => {
    setCaseState({ ...defaultCaseState(caseNumber), payoutAwarded: caseState.payoutAwarded })
    setConfirmRestartScope(null)
  }

  const handleRestartMission = () => {
    setCaseState(defaultCaseState(1))
    setConfirmRestartScope(null)
    setShowCaseList(true)
  }

  const handleNextCase = () => {
    setCaseState(defaultCaseState(caseNumber + 1))
  }

  const handleCaseComplete = () => {
    if (!caseState.payoutAwarded) {
      const payout = config.brief.payout
      addCoins(payout)
      setJustEarnedCoins(payout)
      updateCase({ step: 'complete', payoutAwarded: true })
      if (user && !isGuest && supabase) {
        supabase.rpc('award_coins', { p_amount: payout }).then(({ error }) => {
          if (error) console.warn('Could not sync coins to the leaderboard:', error.message)
        })
      }
    } else {
      updateCase({ step: 'complete' })
    }
  }

  const handleAdvance = (fromStep) => {
    const next = nextStepAfter(fromStep, config)
    if (next === 'complete') {
      handleCaseComplete()
    } else {
      updateCase({ step: next })
    }
  }

  // This theme doesn't have this case number built yet.
  if (!config) {
    return (
      <div className="mission mission--coming-soon">
        <ScreenHeader title={themeName || 'New Case'} onBack={handleHome} backLabel="🏠 Home" />
        <div className="mission__coming-soon-card">
          <span aria-hidden="true" style={{ fontSize: '2.5rem' }}>
            🚧
          </span>
          <h2>More cases coming soon!</h2>

          <p>You've finished every case built for this theme so far — check back later for more.</p>
        </div>
      </div>
    )
  }

  if (!unlocked) {
    return (
      <div className="mission mission--coming-soon">
        <ScreenHeader title={themeName || 'Locked'} onBack={handleHome} backLabel="🏠 Home" />
        <div className="mission__coming-soon-card">
          <span aria-hidden="true" style={{ fontSize: '2.5rem' }}>
            🔒
          </span>
          <h2>This case isn't unlocked yet</h2>
          <p>
            Case {caseNumber} needs full access. Ask an admin to unlock more cases for you — until then, there's
            plenty more to explore in the other themes!
          </p>
        </div>
      </div>
    )
  }

  if (showCaseList) {
    return (
      <CaseListScreen
        themeId={themeId}
        themeName={themeName}
        currentCaseNumber={caseNumber}
        hasFullAccess={hasFullAccess}
        onBack={() => setShowCaseList(false)}
        onContinue={() => setShowCaseList(false)}
      />
    )
  }

  if (caseState.step === 'complete') {
    return (
      <CaseCompleteStep
        payout={justEarnedCoins}
        onBack={handleHome}
        onRestart={handleRestartCase}
        onNextCase={caseNumber < totalCases ? handleNextCase : null}
        caseTitle={config.title}
        isFinale={caseNumber === totalCases}
        steps={config.steps}
      />
    )
  }

  if (caseState.step === 'brief') {
    return (
      <CaseBrief
        config={config}
        themeName={themeName}
        onBack={handleHome}
        onStart={() => updateCase({ step: config.steps[0] })}
        onOpenCaseList={() => setShowCaseList(true)}
      />
    )
  }

  const activeSteps = activeStepsFor(config)
  const stepIndex = stepIndexOf(caseState.step, config)
  const title = themeName ? `${themeName} · Case ${caseNumber}: ${config.title}` : config.title

  return (
    <div className="mission">
      {confirmRestartScope && (
        <RestartConfirmModal
          scope={confirmRestartScope}
          onCancel={() => setConfirmRestartScope(null)}
          onConfirm={
            confirmRestartScope === 'step'
              ? handleRestartStep
              : confirmRestartScope === 'mission'
                ? handleRestartMission
                : handleRestartCase
          }
        />
      )}

      <ScreenHeader title={title} onBack={handleHome} backLabel="🏠 Home" />
      <ProgressIndicator steps={activeSteps} currentIndex={stepIndex} />

      <div className="mission__menu-row" ref={menuRef}>
        <button
          type="button"
          className="mission__menu-trigger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
        >
          ☰ Menu
        </button>
        {menuOpen && (
          <div className="mission__menu-dropdown">
            <button
              type="button"
              className="mission__menu-item"
              onClick={() => {
                setShowCaseList(true)
                setMenuOpen(false)
              }}
            >
              📋 Case List
            </button>
            <button
              type="button"
              className="mission__menu-item"
              onClick={() => {
                setConfirmRestartScope('step')
                setMenuOpen(false)
              }}
            >
              ↩ Restart this step
            </button>
            <button
              type="button"
              className="mission__menu-item"
              onClick={() => {
                setConfirmRestartScope('case')
                setMenuOpen(false)
              }}
            >
              🔄 Restart this case
            </button>
            <button
              type="button"
              className="mission__menu-item"
              onClick={() => {
                setConfirmRestartScope('mission')
                setMenuOpen(false)
              }}
            >
              🗑️ Restart this mission
            </button>
          </div>
        )}
      </div>

      <div className="mission__step">
        {caseState.step === 'entry' && (
          <EntryStep
            key={restartTick}
            initialEntries={caseState.entry?.entries}
            onChange={(entries) => updateCase({ entry: { entries } })}
            onContinue={() => handleAdvance('entry')}
            intro={config.entry.intro}
            caseFileTitle={config.entry.caseFileTitle}
            columns={config.entry.columns}
            rows={config.entry.rows}
            clue={config.entry.clue}
          />
        )}
        {caseState.step === 'cleaning' && (
          <CleaningStep
            key={restartTick}
            initialRows={caseState.cleaning?.rows}
            onChange={(rows) => updateCase({ cleaning: { rows } })}
            onContinue={() => handleAdvance('cleaning')}
            intro={config.cleaning.intro}
            columns={config.cleaning.columns}
            seedRows={config.cleaning.seedRows}
            textColumnKey={config.cleaning.textColumnKey}
          />
        )}
        {caseState.step === 'analysis' && (
          <AnalysisStep
            key={restartTick}
            initialFormulas={caseState.analysis?.formulas}
            initialResults={caseState.analysis?.results}
            onChange={(formulas, results) => updateCase({ analysis: { formulas, results } })}
            onContinue={() => handleAdvance('analysis')}
            config={config}
          />
        )}
        {caseState.step === 'interpretation' && (
          <InterpretationStep
            key={restartTick}
            initialStep={caseState.interpretation?.step}
            initialSelectedOption={caseState.interpretation?.selectedOption}
            onChange={(interp) => updateCase({ interpretation: interp })}
            onContinue={() => handleAdvance('interpretation')}
            config={config}
          />
        )}
      </div>
    </div>
  )
}

export default MissionScreen
