import './ProgressIndicator.css'

function ProgressIndicator({ steps, currentIndex }) {
  return (
    <div className="progress-indicator">
      {steps.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming'
        return (
          <div className="progress-step" key={step.label}>
            <div className={`progress-step__node progress-step__node--${state}`}>
              <span className="progress-step__circle">{i < currentIndex ? '✓' : step.icon}</span>
              <span className="progress-step__label">{step.label}</span>
            </div>
            {i < steps.length - 1 && (
              <span className={`progress-step__connector${i < currentIndex ? ' progress-step__connector--done' : ''}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default ProgressIndicator
