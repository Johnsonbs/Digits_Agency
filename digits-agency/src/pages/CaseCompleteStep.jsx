import { useEffect, useState } from 'react'
import Confetti from '../components/Confetti'
import CoinBalance from '../components/CoinBalance'
import { getBalance } from '../lib/walletStore'
import './CaseCompleteStep.css'

const RECAP_BY_STEP = {
  entry: { icon: '📝', label: 'Entered the case data' },
  cleaning: { icon: '🧹', label: 'Cleaned up the messy records' },
  analysis: { icon: '🧮', label: 'Calculated Totals, Grand Total, and more' },
  interpretation: { icon: '💡', label: 'Figured out what it all means' },
}

function CaseCompleteStep({ onBack, onRestart, onNextCase, payout = 0, caseTitle, isFinale = false, steps = [] }) {
  const [confettiKey, setConfettiKey] = useState(null)
  const [displayBalance, setDisplayBalance] = useState(() => Math.max(0, getBalance() - payout))
  const recap = steps.map((key) => RECAP_BY_STEP[key]).filter(Boolean)

  useEffect(() => {
    const key = Date.now()
    setConfettiKey(key)
    const confettiTimeout = setTimeout(() => setConfettiKey((k) => (k === key ? null : k)), 1400)

    // Let the celebration land first, then count the coins up.
    const coinTimeout = setTimeout(() => setDisplayBalance(getBalance()), 500)

    return () => {
      clearTimeout(confettiTimeout)
      clearTimeout(coinTimeout)
    }
  }, [])

  return (
    <div className="case-complete">
      {confettiKey && <Confetti key={confettiKey} count={isFinale ? 80 : 48} />}
      <CoinBalance balance={displayBalance} />

      <span className="case-complete__badge" aria-hidden="true">
        {isFinale ? '👑' : '🏆'}
      </span>
      <h1 className="case-complete__title">{isFinale ? 'Season Complete!' : 'Case Complete!'}</h1>
      <p className="case-complete__subtitle">You cracked {caseTitle || 'the case'}!</p>

      {payout > 0 && <p className="case-complete__payout">+{payout} coins earned! 🪙</p>}

      <ul className="case-complete__recap">
        {recap.map((item) => (
          <li key={item.label}>
            <span aria-hidden="true">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>

      <div className="case-complete__actions">
        <button type="button" className="tool-btn tool-btn--ghost" onClick={onRestart}>
          🔄 Play Again
        </button>
        {onNextCase && (
          <button type="button" className="tool-btn tool-btn--purple" onClick={onNextCase}>
            Next Case →
          </button>
        )}
        <button
          type="button"
          className={onNextCase ? 'tool-btn tool-btn--ghost' : 'tool-btn tool-btn--purple'}
          onClick={onBack}
        >
          Back to Missions
        </button>
      </div>
    </div>
  )
}

export default CaseCompleteStep
