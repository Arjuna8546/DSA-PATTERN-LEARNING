import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { python } from '@codemirror/lang-python'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { useTheme } from '../lib/ThemeContext'

const baseTheme = EditorView.theme({
  '&': {
    fontSize: '13.5px',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    padding: '10px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--cm-gutter-fg, #4a5563)',
  },
  '.cm-scroller': {
    overflowX: 'auto',
  },
})

/** Read-only, syntax-highlighted Python code block. Not editable — used for
 * reference snippets (pattern steps, variation code, revealed solutions). */
function CodeBlock({ code, wrap = false }) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!containerRef.current) return

    const extensions = [
      python(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      baseTheme,
      EditorView.editable.of(false),
      EditorState.readOnly.of(true),
    ]
    if (wrap) extensions.push(EditorView.lineWrapping)

    const state = EditorState.create({ doc: code, extensions })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => view.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, wrap])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden rounded-md border ${
        theme === 'dark' ? 'border-ink-600 bg-ink-900 text-paper-100' : 'border-paper-200 bg-paper-100 text-ink-900'
      }`}
    />
  )
}

export default CodeBlock
