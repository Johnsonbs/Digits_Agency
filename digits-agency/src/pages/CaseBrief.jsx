import ScreenHeader from '../components/ScreenHeader'
import { findBlockById } from '../data/blocks'
import './CaseBrief.css'

const STEP_LABELS = {
  entry: '📝 Entry',
  cleaning: '🧹 Cleaning',
  analysis: '🧮 Analysis',
  interpretation: '💡 Interpretation',
}

function CaseBrief({ config, themeName, onBack, onStart, onOpenCaseList }) {
  const { brief, title, caseNumber, steps } = config
  const blocks = brief.blockIds.map(findBlockById).filter(Boolean)

  return (
    <div className="case-brief">
      <ScreenHeader title={themeName || 'New Case'} onBack={onBack} backLabel="🏠 Home" />

      {onOpenCaseList && (
        <button type="button" className="case-brief__caselist-link" onClick={onOpenCaseList}>
          📋 Back to Case List
        </button>
      )}

      <div className="case-brief__card">
        <span className="case-brief__tag">Case {caseNumber}</span>
        <h2 className="case-brief__title">{title}</h2>
        <p className="case-brief__problem">{brief.problem}</p>

        <div className="case-brief__section">
          <h3 className="case-brief__section-title">This Case Includes</h3>
          <div className="case-brief__steps">
            {steps.map((key) => (
              <span key={key} className="case-brief__step-chip">
                {STEP_LABELS[key]}
              </span>
            ))}
          </div>
        </div>

        {blocks.length > 0 && (
          <div className="case-brief__section">
            <h3 className="case-brief__section-title">What You'll Need</h3>
            <div className="case-brief__blocks">
              {blocks.map((block) => (
                <span
                  key={block.id}
                  className="case-brief__block-chip"
                  style={{ '--chip-color': block.categoryColor }}
                >
                  {block.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="case-brief__payout">
          <span className="case-brief__payout-icon" aria-hidden="true">
            🪙
          </span>
          <span>
            Payout: <strong>{brief.payout} coins</strong>
          </span>
        </div>

        <button type="button" className="case-brief__start" onClick={onStart}>
          Start Case ▶
        </button>
      </div>
    </div>
  )
}

export default CaseBrief
