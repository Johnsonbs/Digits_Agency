const STORAGE_KEY = 'digits-agency:projects:v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc.) — the
    // project just won't persist across sessions.
  }
}

function generateId() {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function listProjects() {
  return Object.values(readAll()).sort((a, b) => b.updatedAt - a.updatedAt)
}

export function loadProject(id) {
  return readAll()[id] || null
}

export function saveProject(project) {
  const all = readAll()
  const id = project.id || generateId()
  const record = { ...project, id, updatedAt: Date.now() }
  all[id] = record
  writeAll(all)
  return record
}

export function deleteProject(id) {
  const all = readAll()
  delete all[id]
  writeAll(all)
}
