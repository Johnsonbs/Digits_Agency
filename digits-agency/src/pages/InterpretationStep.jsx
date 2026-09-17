import { useEffect, useState } from 'react'
import MascotAvatar from '../components/MascotAvatar'
import { getExpected, headlineTargetKey } from '../lib/missionTargets'
import { getEquippedOutfitId } from '../lib/walletStore'
import '../styles/insightBubble.css'
import './InterpretationStep.css'

function InterpretationStep({ initialStep, initialSelectedOption, onChange, onContinue, config }) {
  const [insight] = useState(() => {
    const key = headlineTargetKey(config)
    return config.buildInsight(key, getExpected(key, config))
  })
  const [step, setStep] = useState(initialStep || 'mascot')
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption ?? null)
  const [equippedOutfitId] = useState(getEquippedOutfitId)

  useEffect(() => {
    onChange({ step, selectedOption })
  }, [step, selectedOption])

  const chosen = insight.options.find((o) => o.id === selectedOption)

  return (
    <div className="interpretation-step">
      <div className="insight-mascot">
        <MascotAvatar equippedOutfitId={equippedOutfitId} className="insight-mascot__avatar" />
        <span className="insight-mascot__name">Digit says</span>
      </div>

      {step === 'mascot' && (
        <>
          <div className="insight-bubble">{insight.message}</div>
          <button type="button" className="insight-btn" onClick={() => setStep('question')}>
            Continue →
          </button>
        </>
      )}

      {step === 'question' && (
        <>
          <div className="insight-bubble insight-bubble--question">{insight.question}</div>
          <div className="insight-options">
            {insight.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`insight-option${selectedOption === opt.id ? ' insight-option--picked' : ''}`}
                onClick={() => setSelectedOption(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {chosen && (
            <div
              className={`insight-feedback${chosen.ideal ? ' insight-feedback--ideal' : ' insight-feedback--nudge'}`}
            >
              <span>{chosen.ideal ? insight.idealFeedback : insight.nudgeFeedback}</span>
              <button type="button" className="tool-btn tool-btn--purple" onClick={onContinue}>
                Close the Case →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default InterpretationStep
