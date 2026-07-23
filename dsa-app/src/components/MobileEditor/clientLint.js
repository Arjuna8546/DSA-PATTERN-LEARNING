import { linter } from '@codemirror/lint'

const OPEN = { '(': ')', '[': ']', '{': '}' }
const CLOSE = { ')': '(', ']': '[', '}': '{' }

function lineStartOffsets(lines) {
  const offsets = []
  let acc = 0
  for (const line of lines) {
    offsets.push(acc)
    acc += line.length + 1
  }
  return offsets
}

function checkBrackets(text) {
  const diagnostics = []
  const stack = []
  let inString = null
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (ch === '\\') {
        i += 1
        continue
      }
      if (ch === inString) inString = null
      continue
    }
    if (ch === '#') {
      while (i < text.length && text[i] !== '\n') i += 1
      continue
    }
    if (ch === '"' || ch === "'") {
      inString = ch
      continue
    }
    if (OPEN[ch]) {
      stack.push({ ch, pos: i })
    } else if (CLOSE[ch]) {
      const top = stack[stack.length - 1]
      if (!top || top.ch !== CLOSE[ch]) {
        diagnostics.push({ from: i, to: i + 1, severity: 'error', message: `Unmatched '${ch}'` })
      } else {
        stack.pop()
      }
    }
  }
  stack.forEach(({ ch, pos }) => {
    diagnostics.push({ from: pos, to: pos + 1, severity: 'error', message: `Unmatched '${ch}' is never closed` })
  })
  return diagnostics
}

function checkQuotesAndIndentation(lines, offsets) {
  const diagnostics = []
  lines.forEach((line, idx) => {
    const start = offsets[idx]

    if (!line.includes('"""') && !line.includes("'''")) {
      const stripped = line.replace(/\\./g, '  ')
      const dq = (stripped.match(/"/g) || []).length
      const sq = (stripped.match(/'/g) || []).length
      if (dq % 2 !== 0 || sq % 2 !== 0) {
        diagnostics.push({
          from: start,
          to: start + line.length,
          severity: 'warning',
          message: 'This line has an unclosed string literal',
        })
      }
    }

    const indentMatch = line.match(/^[ \t]*/)
    const indent = indentMatch ? indentMatch[0] : ''
    if (indent.includes('\t') && indent.includes(' ')) {
      diagnostics.push({
        from: start,
        to: start + indent.length,
        severity: 'warning',
        message: 'Mixed tabs and spaces in indentation',
      })
    } else if (!indent.includes('\t') && line.trim().length > 0 && indent.length % 4 !== 0) {
      diagnostics.push({
        from: start,
        to: start + indent.length,
        severity: 'warning',
        message: 'Indentation is not a multiple of 4 spaces',
      })
    }
  })
  return diagnostics
}

/** CodeMirror linter extension: fast, pure-JS structural checks. Always
 * active, does not depend on Pyodide being loaded. */
export const clientSideLinter = linter(
  (view) => {
    const text = view.state.doc.toString()
    if (!text.trim()) return []
    const lines = text.split('\n')
    const offsets = lineStartOffsets(lines)
    return [...checkBrackets(text), ...checkQuotesAndIndentation(lines, offsets)]
  },
  { delay: 300 }
)
