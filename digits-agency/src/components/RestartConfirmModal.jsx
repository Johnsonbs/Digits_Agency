import './RestartConfirmModal.css'

const COPY = {
  step: {
    title: 'Restart this step?',
    body: "This clears your work on this step so you can try again. Your other steps stay exactly the way you left them. This can't be undone.",
    confirmLabel: 'Yes, restart this step',
  },
  case: {
    title: 'Restart this case?',
    body: "This clears everything you've done — Entry, Cleaning, and Analysis — and takes you back to the Brief. This can't be undone.",
    confirmLabel: 'Yes, restart the case',
  },
  mission: {
    title: 'Restart this whole mission?',
    body: "This sends you all the way back to Case 1 for this theme, clearing your progress through every case. This can't be undone.",
    confirmLabel: 'Yes, restart the mission',
  },
}

function RestartConfirmModal({ scope, onConfirm, onCancel }) {
  const copy = COPY[scope]

  return (
    <div className="restart-modal-overlay">
      <div className="restart-modal">
        <h2 className="restart-modal__title">{copy.title}</h2>
        <p className="restart-modal__body">{copy.body}</p>
        <div className="restart-modal__actions">
          <button type="button" className="tool-btn tool-btn--ghost" onClick={onCancel}>
            Never mind
          </button>
          <button type="button" className="tool-btn tool-btn--purple" onClick={onConfirm}>
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestartConfirmModal
