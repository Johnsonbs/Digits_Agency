import './ThemeCard.css'

function ThemeCard({ theme, onSelect }) {
  const progressPercent = Math.round(theme.progress * 100)

  return (
    <button
      type="button"
      className="theme-card"
      style={{ '--card-color': theme.color }}
      onClick={() => onSelect(theme)}
    >
      <span className="theme-card__emoji" aria-hidden="true">
        {theme.emoji}
      </span>
      <h2 className="theme-card__name">{theme.name}</h2>
      <p className="theme-card__description">{theme.description}</p>

      <div className="theme-card__progress-row">
        <div
          className="theme-card__progress-track"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${theme.name} progress`}
        >
          <div
            className="theme-card__progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="theme-card__status">{theme.status}</span>
      </div>
    </button>
  )
}

export default ThemeCard
