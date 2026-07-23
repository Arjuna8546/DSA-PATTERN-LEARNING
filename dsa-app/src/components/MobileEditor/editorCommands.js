import { EditorSelection } from '@codemirror/state'
import {
  indentMore,
  indentLess,
  undo,
  redo,
  cursorCharLeft,
  cursorCharRight,
  cursorLineUp,
  cursorLineDown,
} from '@codemirror/commands'

const PAIR_MAP = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'" }

/** Operates on the current line, or every selected line if the selection
 * spans multiple lines, preserving relative selection (built into CM6). */
export function indentSelection(view) {
  indentMore(view)
}

export function outdentSelection(view) {
  indentLess(view)
}

export function doUndo(view) {
  undo(view)
}

export function doRedo(view) {
  redo(view)
}

export function moveCursorLeft(view) {
  cursorCharLeft(view)
}

export function moveCursorRight(view) {
  cursorCharRight(view)
}

export function moveCursorUp(view) {
  cursorLineUp(view)
}

export function moveCursorDown(view) {
  cursorLineDown(view)
}

/** Inserts a bracket/quote pair with the cursor placed between them, or wraps
 * the current selection if there is one. */
export function insertPairOrWrap(view, open) {
  const close = PAIR_MAP[open]
  view.dispatch(
    view.state.changeByRange((range) => {
      if (range.empty) {
        return {
          changes: { from: range.from, to: range.to, insert: open + close },
          range: EditorSelection.cursor(range.from + open.length),
        }
      }
      const selected = view.state.sliceDoc(range.from, range.to)
      return {
        changes: { from: range.from, to: range.to, insert: open + selected + close },
        range: EditorSelection.range(range.from + open.length, range.from + open.length + selected.length),
      }
    })
  )
  view.focus()
}

/** Inserts plain text at the cursor and moves the cursor after it. */
export function insertTextAtCursor(view, text) {
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length),
    }))
  )
  view.focus()
}

/** Inserts `name()` with the cursor placed inside the parens. */
export function insertFunctionCall(view, name) {
  const text = `${name}()`
  view.dispatch(
    view.state.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + name.length + 1),
    }))
  )
  view.focus()
}
