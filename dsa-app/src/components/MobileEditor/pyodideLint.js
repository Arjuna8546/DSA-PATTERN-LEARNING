import { linter } from '@codemirror/lint'
import { lintCode, isPyodideLoaded } from '../../lib/pyodideRunner'

/** Reuses the same engine as execution (Pyodide's own compile()) to get real
 * syntax-error line/col info. Never triggers the initial Pyodide download —
 * it simply returns no diagnostics until Pyodide has been loaded by a Run. */
export const pyodideSyntaxLinter = linter(
  async (view) => {
    if (!isPyodideLoaded()) return []
    const code = view.state.doc.toString()
    if (!code.trim()) return []
    try {
      const result = await lintCode(code)
      if (!result) return []
      const doc = view.state.doc
      const lineNumber = Math.min(Math.max(result.line || 1, 1), doc.lines)
      const line = doc.line(lineNumber)
      const col = Math.max(0, (result.col || 1) - 1)
      const from = Math.min(line.from + col, line.to)
      return [
        {
          from,
          to: line.to,
          severity: 'error',
          message: result.message || 'Syntax error',
        },
      ]
    } catch {
      return []
    }
  },
  { delay: 500 }
)
