import './FormulaBar.css'

function FormulaBar({ targetLabel, tokens, feedback, shake, onUndo, onClear, onRun, placeholder = 'Pick a Total cell to begin' }) {
  return (
    <div className={`formula-bar${shake ? ' formula-bar--shake' : ''}`}>
      <div className="formula-bar__top">
        <span className="formula-bar__target">
          {targetLabel ? `Solving: ${targetLabel}` : placeholder}
        </span>

        <div className="formula-bar__actions">
          <button
            type="button"
            className="formula-bar__icon-btn"
            onClick={onUndo}
            disabled={!tokens.length}
            aria-label="Undo last block"
            title="Undo last block"
          >
            ↩
          </button>
          <button
            type="button"
            className="formula-bar__icon-btn"
            onClick={onClear}
            disabled={!tokens.length}
            aria-label="Clear formula"
            title="Clear formula"
          >
            ✕
          </button>
          <button
            type="button"
            className="formula-bar__run-btn"
            onClick={onRun}
            disabled={!targetLabel || !tokens.length}
          >
            ▶ Run
          </button>
        </div>
      </div>

      <div className="formula-bar__chips">
        {tokens.length === 0 && (
          <span className="formula-bar__placeholder">Click cells and blocks to build your formula…</span>
        )}
        {tokens.map((token, i) => (
          <span
            key={i}
            className={`chip chip--${token.kind}`}
            style={token.kind !== 'cell' ? { '--chip-color': token.categoryColor } : undefined}
          >
            {token.kind === 'cell' ? token.label : token.label}
          </span>
        ))}
      </div>

      {feedback && (
        <div className={`formula-bar__feedback formula-bar__feedback--${feedback.type}`}>
          {feedback.message}
        </div>
      )}
    </div>
  )
}

export default FormulaBar
