const STORAGE_KEY = 'dsa-graph-expanded-ids'

export function getStoredExpandedIds() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

export function setStoredExpandedIds(ids) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // storage unavailable — fail silently
  }
}