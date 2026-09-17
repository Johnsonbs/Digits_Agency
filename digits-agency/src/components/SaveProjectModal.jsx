import { useState } from 'react'
import './SaveProjectModal.css'

function SaveProjectModal({ initialName, onSave, onCancel }) {
  const [name, setName] = useState(initialName || '')

  const handleSave = () => {
    const trimmed = name.trim()
    onSave(trimmed || 'Untitled Project')
  }

  return (
    <div className="save-modal-overlay">
      <div className="save-modal">
        <h2 className="save-modal__title">Save this project</h2>
        <p className="save-modal__hint">Give your data a name so you can find it again later.</p>

        <input
          type="text"
          className="save-modal__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Untitled Project"
          maxLength={60}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave()
          }}
        />

        <div className="save-modal__actions">
          <button type="button" className="tool-btn tool-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="tool-btn tool-btn--purple" onClick={handleSave}>
            💾 Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SaveProjectModal
