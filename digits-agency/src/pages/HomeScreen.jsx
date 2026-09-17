import { useRef, useState } from 'react'
import ThemeCard from '../components/ThemeCard'
import CoinBalance from '../components/CoinBalance'
import MascotAvatar from '../components/MascotAvatar'
import { themes } from '../data/themes'
import { storeItems } from '../data/storeItems'
import { loadCaseProgress } from '../lib/progressStore'
import { activeStepsFor, stepIndexOf } from '../lib/caseSteps'
import { getCaseConfig, getCaseCount } from '../data/cases'
import { parseCSV, CsvError, MAX_CSV_BYTES } from '../lib/csv'
import { listProjects, deleteProject } from '../lib/projectStore'
import { getBalance, getOwnedItemIds, getEquippedOutfitId, getDisplayedDecorationIds } from '../lib/walletStore'
import './HomeScreen.css'

function withSavedProgress(theme) {
  const saved = loadCaseProgress(theme.id)
  if (!saved) return theme

  const caseNumber = saved.caseNumber || 1
  const totalCases = getCaseCount(theme.id)

  if (saved.step === 'complete') {
    return {
      ...theme,
      status: caseNumber >= totalCases ? 'Season Complete! 👑' : `Case ${caseNumber} Complete! 🎉`,
      progress: 1,
    }
  }

  const config = getCaseConfig(theme.id, caseNumber)
  if (!config) return theme

  const activeSteps = activeStepsFor(config)
  const index = stepIndexOf(saved.step, config)
  const stepMeta = activeSteps[index]
  if (!stepMeta) return theme

  return {
    ...theme,
    status: `Case ${caseNumber} of ${totalCases} · ${stepMeta.label} (${index + 1}/${activeSteps.length})`,
    progress: (caseNumber - 1 + index / activeSteps.length) / totalCases,
  }
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function HomeScreen({ onSelectTheme, onOpenPractice, onUploadProject, onOpenProject, onOpenStore, onOpenBuilder }) {
  const fileInputRef = useRef(null)
  const [uploadError, setUploadError] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const [refresh, setRefresh] = useState(0)

  const projects = listProjects()
  const ownedItemIds = getOwnedItemIds()
  const equippedOutfitId = getEquippedOutfitId()
  const displayedDecorations = storeItems.filter((item) => getDisplayedDecorationIds().includes(item.id))

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please choose a .csv file — that\'s the only type this version supports.')
      return
    }

    if (file.size > MAX_CSV_BYTES) {
      setUploadError(`That file's a bit big — please choose a CSV under ${Math.round(MAX_CSV_BYTES / 1024)}KB.`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const { columns, rows, truncated } = parseCSV(String(reader.result))
        const name = file.name.replace(/\.csv$/i, '').replace(/[_-]+/g, ' ').trim() || 'Untitled Project'
        setUploadError(null)
        onUploadProject({
          id: null,
          name,
          baseColumns: columns,
          rows,
          resultColumns: [],
          results: {},
          truncated,
        })
      } catch (err) {
        setUploadError(err instanceof CsvError ? err.message : "That file couldn't be read as a CSV.")
      }
    }
    reader.onerror = () => setUploadError("That file couldn't be read — please try again.")
    reader.readAsText(file)
  }

  const handleDeleteClick = (id) => {
    if (confirmDeleteId === id) {
      deleteProject(id)
      setConfirmDeleteId(null)
      setRefresh((r) => r + 1)
      return
    }
    setConfirmDeleteId(id)
    setTimeout(() => setConfirmDeleteId((cur) => (cur === id ? null : cur)), 2500)
  }

  return (
    <div className="page">
      <CoinBalance balance={getBalance()} />
      <h1 className="title">Digit's Agency</h1>

      <div className="theme-grid">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={withSavedProgress(theme)} onSelect={onSelectTheme} />
        ))}
      </div>

      <div className="home-actions">
        <button type="button" className="practice-link" onClick={onOpenPractice}>
          🧪 Practice: Comparison Blocks
        </button>
        <button type="button" className="practice-link" onClick={handleUploadClick}>
          📤 Upload My Own Data
        </button>
        <button type="button" className="practice-link" onClick={onOpenStore}>
          🛍️ Visit the Store
        </button>
        <button type="button" className="practice-link" onClick={onOpenBuilder}>
          🧮 Builder Tool: Health Score
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {uploadError && <p className="home-upload-error">{uploadError}</p>}

      {ownedItemIds.length > 0 && (
        <div className="desk-shelf">
          <h2 className="desk-shelf__title">Your Desk</h2>
          <div className="desk-shelf__display">
            <MascotAvatar equippedOutfitId={equippedOutfitId} />
            {displayedDecorations.map((item) => (
              <span key={item.id} className="desk-shelf__decoration" title={item.name} aria-hidden="true">
                {item.icon}
              </span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="projects-shelf" key={refresh}>
          <h2 className="projects-shelf__title">My Projects</h2>
          <div className="projects-shelf__list">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <button
                  type="button"
                  className="project-card__open"
                  onClick={() => onOpenProject(project.id)}
                >
                  <span className="project-card__name">📊 {project.name}</span>
                  <span className="project-card__meta">
                    {project.rows.length} rows · {project.baseColumns.length} cols · {formatDate(project.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  className={`project-card__delete${confirmDeleteId === project.id ? ' project-card__delete--confirm' : ''}`}
                  onClick={() => handleDeleteClick(project.id)}
                  aria-label={`Delete ${project.name}`}
                >
                  {confirmDeleteId === project.id ? 'Sure?' : '✕'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeScreen
