import { useState } from 'react'
import ScreenHeader from '../components/ScreenHeader'
import BlockPalette from '../components/BlockPalette'
import FormulaBar from '../components/FormulaBar'
import Confetti from '../components/Confetti'
import MascotAvatar from '../components/MascotAvatar'
import { freePlayBlockCategories } from '../data/blocks'
import { getBuilderTool } from '../data/builderTools'
import { evaluateFormula, FormulaError } from '../lib/formulaEngine'
import { buildBuilderReflection } from '../lib/builderInsights'
import { getEquippedOutfitId } from '../lib/walletStore'
import '../styles/insightBubble.css'
import './BuilderToolStep.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function resolveTokens(tokens, inputs) {
  return tokens.map((t) => (t.kind === 'cell' ? { ...t, value: inputs[t.inputKey] } : t))
}

const MIN_TESTS_REQUIRED = 2

function BuilderToolStep({ toolId = 'health-bmi', onBack }) {
  const tool = getBuilderTool(toolId)
  const [equippedOutfitId] = useState(getEquippedOutfitId)

  const [phase, setPhase] = useState('build') // 'build' | 'test' | 'reflect'
  const [inputs, setInputs] = useState(() =>
    Object.fromEntries(tool.inputs.map((i) => [i.key, i.initial])),
  )
  const [target, setTarget] = useState(null) // null | 'result'
  const [tokens, setTokens] = useState([])
  const [lockedTokens, setLockedTokens] = useState(null)
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [shake, setShake] = useState(false)
  const [confettiKey, setConfettiKey] = useState(null)
  const [testCount, setTestCount] = useState(0)

  const [reflection, setReflection] = useState(null)
  const [reflectionStep, setReflectionStep] = useState('mascot')
  const [selectedOption, setSelectedOption] = useState(null)

  const runShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const runConfetti = () => {
    const key = Date.now()
    setConfettiKey(key)
    setTimeout(() => setConfettiKey((k) => (k === key ? null : k)), 1200)
  }

  const handleInputClick = (inputDef) => {
    if (target !== 'result') return
    setFeedback(null)
    setTokens((prev) => [
      ...prev,
      { kind: 'cell', inputKey: inputDef.key, label: inputDef.label, value: inputs[inputDef.key] },
    ])
  }

  const handleResultClick = () => {
    setFeedback(null)
    setTarget((t) => (t === 'result' ? null : 'result'))
  }

  const handleBlockClick = (block) => {
    if (target !== 'result') return
    setFeedback(null)
    setTokens((prev) => [...prev, block])
  }

  const handleUndo = () => {
    setFeedback(null)
    setTokens((prev) => prev.slice(0, -1))
  }

  const handleClear = () => {
    setFeedback(null)
    setTokens([])
  }

  const handleRun = () => {
    if (target !== 'result') return
    try {
      const value = evaluateFormula(tokens)
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new FormulaError('That formula needs to produce a number.')
      }
      setLockedTokens(tokens)
      setResult(value)
      setFeedback(null)
      runConfetti()
      setPhase('test')
    } catch (err) {
      const message = err instanceof FormulaError ? err.message : "That formula's not quite ready yet!"
      setFeedback({ type: 'retry', message })
      runShake()
    }
  }

  const handleAdjust = (inputDef, delta) => {
    const nextValue = clamp(inputs[inputDef.key] + delta, inputDef.min, inputDef.max)
    const nextInputs = { ...inputs, [inputDef.key]: nextValue }
    setInputs(nextInputs)

    try {
      setResult(evaluateFormula(resolveTokens(lockedTokens, nextInputs)))
    } catch {
      // The formula was already validated at build time — this shouldn't fire.
    }
    setTestCount((c) => c + 1)
  }

  const handleRebuild = () => {
    setPhase('build')
    setLockedTokens(null)
    setResult(null)
    setTestCount(0)
    setTarget(null)
  }

  const handleSeeReflection = () => {
    setReflection(buildBuilderReflection(tool, lockedTokens, inputs))
    setReflectionStep('mascot')
    setSelectedOption(null)
    setPhase('reflect')
  }

  const chosen = reflection?.options.find((o) => o.id === selectedOption)

  return (
    <div className="builder-tool">
      {confettiKey && <Confetti key={confettiKey} />}
      <ScreenHeader title={tool.title} onBack={onBack} backLabel="🏠 Home" />

      {phase !== 'reflect' && (
        <>
          <p className="builder-tool__intro">{tool.intro}</p>

          <div className="builder-tool__board">
            {tool.inputs.map((inputDef) => (
              <div key={inputDef.key} className="builder-card">
                <span className="builder-card__icon" aria-hidden="true">
                  {inputDef.icon}
                </span>
                <span className="builder-card__label">{inputDef.label}</span>

                {phase === 'build' ? (
                  <button
                    type="button"
                    className={`builder-card__value builder-card__value--ref${
                      target === 'result' ? ' builder-card__value--clickable' : ''
                    }`}
                    onClick={() => handleInputClick(inputDef)}
                    disabled={target !== 'result'}
                  >
                    {inputs[inputDef.key]}
                  </button>
                ) : (
                  <div className="builder-card__stepper">
                    <button
                      type="button"
                      className="builder-card__step-btn"
                      onClick={() => handleAdjust(inputDef, -inputDef.step)}
                    >
                      −
                    </button>
                    <span className="builder-card__value-display">{inputs[inputDef.key]}</span>
                    <button
                      type="button"
                      className="builder-card__step-btn"
                      onClick={() => handleAdjust(inputDef, inputDef.step)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            ))}

            <div className="builder-card builder-card--result">
              <span className="builder-card__icon" aria-hidden="true">
                🎯
              </span>
              <span className="builder-card__label">{tool.resultLabel}</span>
              {phase === 'build' ? (
                <button
                  type="button"
                  className={`builder-card__value builder-card__value--target${
                    target === 'result' ? ' builder-card__value--selected' : ''
                  }`}
                  onClick={handleResultClick}
                >
                  ?
                </button>
              ) : (
                <span className="builder-card__value-display builder-card__value-display--result">
                  {typeof result === 'number' ? Math.round(result * 100) / 100 : '?'}
                </span>
              )}
            </div>
          </div>

          <p className="builder-tool__disclaimer">{tool.disclaimer}</p>
        </>
      )}

      {phase === 'build' && (
        <>
          <FormulaBar
            targetLabel={target === 'result' ? tool.resultLabel : null}
            tokens={tokens}
            feedback={feedback}
            shake={shake}
            onUndo={handleUndo}
            onClear={handleClear}
            onRun={handleRun}
            placeholder={`Tap "${tool.resultLabel}" above to start building`}
          />
          <BlockPalette
            disabled={target !== 'result'}
            onBlockClick={handleBlockClick}
            categories={freePlayBlockCategories}
            hint={`👉 Tap "${tool.resultLabel}" above to start building!`}
          />
        </>
      )}

      {phase === 'test' && (
        <div className="builder-tool__test-panel">
          <p className="builder-tool__test-hint">
            {testCount >= MIN_TESTS_REQUIRED
              ? "Great testing! Try a few more, or see what Digit noticed."
              : `Try changing the numbers above — test at least ${MIN_TESTS_REQUIRED} different combinations! (${testCount}/${MIN_TESTS_REQUIRED})`}
          </p>
          <div className="builder-tool__test-actions">
            <button type="button" className="tool-btn tool-btn--ghost" onClick={handleRebuild}>
              ↩ Rebuild Formula
            </button>
            {testCount >= MIN_TESTS_REQUIRED && (
              <button type="button" className="tool-btn tool-btn--purple" onClick={handleSeeReflection}>
                🔍 See What Digit Noticed →
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'reflect' && reflection && (
        <div className="builder-tool__reflect">
          <div className="insight-mascot">
            <MascotAvatar equippedOutfitId={equippedOutfitId} className="insight-mascot__avatar" />
            <span className="insight-mascot__name">Digit says</span>
          </div>

          {reflectionStep === 'mascot' && (
            <>
              <div className="insight-bubble">{reflection.message}</div>
              <button type="button" className="insight-btn" onClick={() => setReflectionStep('question')}>
                Continue →
              </button>
            </>
          )}

          {reflectionStep === 'question' && (
            <>
              <div className="insight-bubble insight-bubble--question">{reflection.question}</div>
              <div className="insight-options">
                {reflection.options.map((opt) => (
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
                  <span>{chosen.ideal ? reflection.idealFeedback : reflection.nudgeFeedback}</span>
                  <button type="button" className="tool-btn tool-btn--purple" onClick={onBack}>
                    Done — Back to Home
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default BuilderToolStep
