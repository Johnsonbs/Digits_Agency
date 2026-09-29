import './ProgressIndicator.css'

function ProgressIndicator({ steps, currentIndex, onStepClick }) {
  return (
    <div className="progress-indicator">
      {steps.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'upcoming'
        const clickable = Boolean(onStepClick) && i !== currentIndex
        const Node = clickable ? 'button' : 'div'
        return (
          <div className="progress-step" key={step.label}>
            <Node
              type={clickable ? 'button' : undefined}
              className={`progress-step__node progress-step__node--${state}${clickable ? ' progress-step__node--clickable' : ''}`}
              onClick={clickable ? () => onStepClick(step.key) : undefined}
            >
              <span className="progress-step__circle">{i < currentIndex ? '✓' : step.icon}</span>
              <span className="progress-step__label">{step.label}</span>
            </Node>
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
