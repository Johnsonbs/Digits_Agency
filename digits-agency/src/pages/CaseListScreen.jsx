import ScreenHeader from '../components/ScreenHeader'
import { getCaseConfig, getCaseCount } from '../data/cases'
import { canAccessCase } from '../lib/access'
import './CaseListScreen.css'

function statusFor(caseNumber, currentCaseNumber, unlocked) {
  if (!unlocked) return { label: '🔒 Locked', className: 'case-list__status--locked' }
  if (caseNumber < currentCaseNumber) return { label: '✅ Complete', className: 'case-list__status--done' }
  if (caseNumber === currentCaseNumber) return { label: '🔵 In Progress', className: 'case-list__status--current' }
  return { label: '⚪ Not Started', className: 'case-list__status--upcoming' }
}

function CaseListScreen({ themeId, themeName, currentCaseNumber, hasFullAccess, onBack, onContinue }) {
  const totalCases = getCaseCount(themeId)
  const cases = Array.from({ length: totalCases }, (_, i) => i + 1)
    .map((caseNumber) => ({ caseNumber, config: getCaseConfig(themeId, caseNumber) }))
    .filter((c) => c.config)

  return (
    <div className="page">
      <ScreenHeader title={`${themeName || 'Cases'} · All Cases`} onBack={onBack} backLabel="← Back" />

      <div className="case-list">
        {cases.map(({ caseNumber, config }) => {
          const unlocked = canAccessCase(themeId, caseNumber, { hasFullAccess })
          const status = statusFor(caseNumber, currentCaseNumber, unlocked)
          return (
            <div key={caseNumber} className="case-list__row">
              <div className="case-list__heading">
                <span className="case-list__number">Case {caseNumber}</span>
                <span className={`case-list__status ${status.className}`}>{status.label}</span>
              </div>
              <h3 className="case-list__title">{config.title}</h3>
              <p className="case-list__desc">
                {unlocked ? config.brief.problem : 'Unlocks once an admin grants full access.'}
              </p>
              {caseNumber === currentCaseNumber && onContinue && (
                <button type="button" className="case-list__continue" onClick={onContinue}>
                  ▶ Continue
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CaseListScreen
