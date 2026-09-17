// Single source of truth for everything that needs to survive a closed
// browser: coin balance, store purchases, and case progress all live in one
// save blob now, keyed by section — rather than two disconnected localStorage
// entries that could drift out of sync with each other.
const STORAGE_KEY = 'digits-agency:save:v1'

// Pre-unification keys. Only read once, to migrate an existing player's data
// into the new shape the first time this loads after the update.
const LEGACY_WALLET_KEY = 'digits-agency:wallet:v1'
const LEGACY_PROGRESS_KEY = 'digits-agency:progress:v1'

const DEFAULT_WALLET = {
  balance: 0,
  ownedItemIds: [],
  equippedOutfitId: null,
  displayedDecorationIds: [],
}

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function migrateLegacy() {
  const legacyWallet = readJSON(LEGACY_WALLET_KEY)
  const legacyProgress = readJSON(LEGACY_PROGRESS_KEY)

  const migrated = {
    wallet: { ...DEFAULT_WALLET, ...(legacyWallet || {}) },
    progress: legacyProgress || {},
  }

  writeSave(migrated)

  // Data is safely copied into the unified save now — clear the old keys so
  // they can't be mistaken for the source of truth later.
  try {
    localStorage.removeItem(LEGACY_WALLET_KEY)
    localStorage.removeItem(LEGACY_PROGRESS_KEY)
  } catch {
    // Not critical if this fails — the unified save is already written.
  }

  return migrated
}

function readSave() {
  const existing = readJSON(STORAGE_KEY)
  if (existing) {
    return {
      wallet: { ...DEFAULT_WALLET, ...(existing.wallet || {}) },
      progress: existing.progress || {},
    }
  }
  return migrateLegacy()
}

function writeSave(save) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc.) — nothing
    // persists across sessions, but the app still works this session.
  }
}

export function readWallet() {
  return readSave().wallet
}

export function writeWallet(wallet) {
  writeSave({ ...readSave(), wallet })
}

export function readProgress() {
  return readSave().progress
}

export function writeProgress(progress) {
  writeSave({ ...readSave(), progress })
}
