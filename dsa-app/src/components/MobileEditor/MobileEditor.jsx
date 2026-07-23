import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { lintGutter } from '@codemirror/lint'
import Toolbar from './Toolbar.jsx'
import { pythonCompletionSource } from './pythonSnippets.js'
import { clientSideLinter } from './clientLint.js'
import { pyodideSyntaxLinter } from './pyodideLint.js'
import { useSwipeGestures } from './useSwipeGestures.js'
import { useKeyboardInset } from './useKeyboardInset.js'

const editorTheme = EditorView.theme({
  '&': { fontSize: '15px', height: '100%', backgroundColor: 'transparent' },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    paddingBottom: '48px',
    caretColor: '#e8a13d',
  },
  '.cm-scroller': { overflow: 'auto' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: '#4a5563' },
  '.cm-activeLine': { backgroundColor: 'rgba(232,161,61,0.06)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(232,161,61,0.06)' },
  '&.cm-focused': { outline: 'none' },
})

/**
 * The mobile-first code editor. Uncontrolled/imperative on purpose (via ref)
 * so external actions like Reset or Show-Solution-into-editor can replace the
 * document without fighting the user's live cursor position on every render.
 */
const MobileEditor = forwardRef(function MobileEditor({ initialValue, onChange }, ref) {
  const containerRef = useRef(null)
  const viewRef = useRef(null)
  const [quickInsertOpen, setQuickInsertOpen] = useState(false)
  const keyboardInset = useKeyboardInset()
  const bindGestures = useSwipeGestures(viewRef)

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() ?? '',
    setValue: (text) => {
      const view = viewRef.current
      if (!view) return
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } })
    },
    focus: () => viewRef.current?.focus(),
  }))

  useEffect(() => {
    if (!containerRef.current) return undefined

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChange) {
        onChange(update.state.doc.toString())
      }
    })

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      drawSelection(),
      bracketMatching(),
      closeBrackets(),
      indentOnInput(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      python(),
      autocompletion({ override: [pythonCompletionSource] }),
      lintGutter(),
      clientSideLinter,
      pyodideSyntaxLinter,
      EditorView.lineWrapping,
      keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...completionKeymap]),
      editorTheme,
      updateListener,
      EditorView.contentAttributes.of({
        autocorrect: 'off',
        autocapitalize: 'off',
        spellcheck: 'false',
      }),
    ]

    const state = EditorState.create({ doc: initialValue, extensions })
    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // Deliberately only re-created on mount: initialValue is a seed, not a
    // controlled prop, so an external question switch remounts this component
    // (see Solve.jsx using `key={questionId}`) instead of racing user edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-hidden bg-ink-950"
        {...bindGestures()}
        style={{ touchAction: 'pan-y' }}
      />
      <div style={{ marginBottom: keyboardInset }}>
        <Toolbar
          viewRef={viewRef}
          quickInsertOpen={quickInsertOpen}
          onToggleQuickInsert={() => setQuickInsertOpen((o) => !o)}
        />
      </div>
    </div>
  )
})

export default MobileEditor
