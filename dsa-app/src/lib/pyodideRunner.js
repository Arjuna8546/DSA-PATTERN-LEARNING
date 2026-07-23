let worker = null
let readyPromise = null
let loaded = false
let nextId = 1
const pending = new Map()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('../workers/pyodideWorker.js', import.meta.url))
    worker.onmessage = (event) => {
      const { id, type, payload } = event.data
      const entry = pending.get(id)
      if (!entry) return
      pending.delete(id)
      if (type === 'error') entry.reject(new Error(payload))
      else entry.resolve(payload)
    }
    worker.onerror = (event) => {
      // Reject anything still in flight if the worker itself throws
      pending.forEach(({ reject }) => reject(new Error(event.message || 'Worker error')))
      pending.clear()
    }
  }
  return worker
}

function send(type, payload) {
  return new Promise((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ id, type, payload })
  })
}

/** True once Pyodide has fully finished loading in the worker. Used to decide
 * whether the background syntax linter is allowed to run (it must never be
 * the thing that triggers the initial multi-MB Pyodide download). */
export function isPyodideLoaded() {
  return loaded
}

/** Lazily starts loading Pyodide (only call this from the Run action, or from
 * runTests below) and caches the in-flight/resolved promise across calls. */
export function ensurePyodideReady() {
  if (!readyPromise) {
    readyPromise = send('init', {}).then((result) => {
      loaded = true
      return result
    })
  }
  return readyPromise
}

export async function runTests(code, functionName, testCases) {
  await ensurePyodideReady()
  return send('run', { code, functionName, testCases })
}

export async function lintCode(code) {
  if (!loaded) return null
  return send('lint', { code })
}

/** Pulls the entry-point function name out of starter code by convention:
 * the first top-level `def <name>(...)`. */
export function extractFunctionName(starterCode) {
  const match = starterCode.match(/^def\s+(\w+)\s*\(/m)
  return match ? match[1] : null
}
