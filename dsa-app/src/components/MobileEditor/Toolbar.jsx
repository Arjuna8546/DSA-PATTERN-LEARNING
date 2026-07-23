import { useRef } from 'react'
import {
  indentSelection,
  outdentSelection,
  doUndo,
  doRedo,
  moveCursorLeft,
  moveCursorRight,
  moveCursorUp,
  moveCursorDown,
  insertPairOrWrap,
  insertTextAtCursor,
  insertFunctionCall,
} from './editorCommands'
import { BUILTIN_FUNCTIONS } from './pythonSnippets'

const PUNCTUATION_BUTTONS = [
  { label: '()', action: (v) => insertPairOrWrap(v, '(') },
  { label: '{}', action: (v) => insertPairOrWrap(v, '{') },
  { label: '[]', action: (v) => insertPairOrWrap(v, '[') },
  { label: ':', action: (v) => insertTextAtCursor(v, ':') },
  { label: ';', action: (v) => insertTextAtCursor(v, ';') },
  { label: '=', action: (v) => insertTextAtCursor(v, '=') },
  { label: '==', action: (v) => insertTextAtCursor(v, '==') },
  { label: '!=', action: (v) => insertTextAtCursor(v, '!=') },
  { label: '<', action: (v) => insertTextAtCursor(v, '<') },
  { label: '>', action: (v) => insertTextAtCursor(v, '>') },
  { label: '<=', action: (v) => insertTextAtCursor(v, '<=') },
  { label: '>=', action: (v) => insertTextAtCursor(v, '>=') },
  { label: '+', action: (v) => insertTextAtCursor(v, '+') },
  { label: '-', action: (v) => insertTextAtCursor(v, '-') },
  { label: '*', action: (v) => insertTextAtCursor(v, '*') },
  { label: '/', action: (v) => insertTextAtCursor(v, '/') },
  { label: '%', action: (v) => insertTextAtCursor(v, '%') },
  { label: '.', action: (v) => insertTextAtCursor(v, '.') },
  { label: ',', action: (v) => insertTextAtCursor(v, ',') },
  { label: '_', action: (v) => insertTextAtCursor(v, '_') },
  { label: '"', action: (v) => insertPairOrWrap(v, '"') },
  { label: "'", action: (v) => insertPairOrWrap(v, "'") },
]

function ToolbarButton({ label, onPress, wide, repeat }) {
  const timeoutRef = useRef(null)
  const intervalRef = useRef(null)

  const stopRepeat = () => {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
  }

  // pointerdown (not click) + preventDefault so the on-screen keyboard never
  // briefly closes when a toolbar button is tapped.
  const handlePointerDown = (e) => {
    e.preventDefault()
    onPress()
    if (repeat) {
      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(onPress, 70)
      }, 380)
    }
  }

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerUp={stopRepeat}
      onPointerLeave={stopRepeat}
      onPointerCancel={stopRepeat}
      className={`flex ${
        wide ? 'min-w-[56px] px-2.5' : 'min-w-[40px]'
      } h-10 shrink-0 items-center justify-center rounded-md border border-ink-600 bg-ink-800 font-mono text-sm text-paper-100 active:bg-ink-700`}
    >
      {label}
    </button>
  )
}

function Toolbar({ viewRef, quickInsertOpen, onToggleQuickInsert }) {
  const run = (fn) => () => {
    const view = viewRef.current
    if (view) fn(view)
  }

  return (
    <div className="border-t border-ink-600 bg-ink-900">
      {quickInsertOpen && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-ink-600/60 px-1.5 py-1.5">
          {BUILTIN_FUNCTIONS.map((name) => (
            <ToolbarButton
              key={name}
              label={`${name}()`}
              wide
              onPress={run((v) => insertFunctionCall(v, name))}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5 overflow-x-auto px-1.5 py-1.5">
        <ToolbarButton label="ƒ" wide onPress={onToggleQuickInsert} />
        <ToolbarButton label="Indent →" wide onPress={run(indentSelection)} />
        <ToolbarButton label="← Outdent" wide onPress={run(outdentSelection)} />
        <ToolbarButton label="Undo" wide onPress={run(doUndo)} />
        <ToolbarButton label="Redo" wide onPress={run(doRedo)} />
        <ToolbarButton label="◀" onPress={run(moveCursorLeft)} repeat />
        <ToolbarButton label="▶" onPress={run(moveCursorRight)} repeat />
        <ToolbarButton label="▲" onPress={run(moveCursorUp)} repeat />
        <ToolbarButton label="▼" onPress={run(moveCursorDown)} repeat />
        {PUNCTUATION_BUTTONS.map((btn) => (
          <ToolbarButton key={btn.label} label={btn.label} onPress={run(btn.action)} />
        ))}
      </div>
    </div>
  )
}

export default Toolbar
