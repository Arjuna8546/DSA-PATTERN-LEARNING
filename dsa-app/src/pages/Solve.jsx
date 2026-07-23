import { useCallback, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQuestion } from '../lib/data'
import { runTests, extractFunctionName, isPyodideLoaded } from '../lib/pyodideRunner'
import MobileEditor from '../components/MobileEditor/MobileEditor.jsx'
import QuestionPanel from '../components/QuestionPanel/QuestionPanel.jsx'
import TestResults from '../components/TestResults/TestResults.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

function Solve() {
  const { questionId } = useParams()
  const navigate = useNavigate()
  const question = getQuestion(questionId)

  const editorRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | loading-pyodide | running | done | error
  const [result, setResult] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmLoadSolution, setConfirmLoadSolution] = useState(false)

  const functionName = useMemo(
    () => (question ? extractFunctionName(question.starterCode) : null),
    [question]
  )

  const handleRun = useCallback(async () => {
    if (!editorRef.current || !question || !functionName) return
    const code = editorRef.current.getValue()
    // First run on a fresh session shows the "starting up" state; subsequent
    // runs reuse the cached Pyodide instance so this resolves quickly.
    setStatus(isPyodideLoaded() ? 'running' : 'loading-pyodide')
    setResult(null)
    setErrorMessage('')
    try {
      const res = await runTests(code, functionName, question.testCases)
      setResult(res)
      setStatus('done')
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong running your code.')
      setStatus('error')
    }
  }, [question, functionName])

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    editorRef.current?.setValue(question.starterCode)
    setConfirmReset(false)
    setResult(null)
    setStatus('idle')
  }

  const handleLoadSolutionIntoEditor = () => {
    if (!confirmLoadSolution) {
      setConfirmLoadSolution(true)
      return
    }
    editorRef.current?.setValue(question.answer)
    setConfirmLoadSolution(false)
  }

  if (!question) {
    return (
      <div className="p-6">
        <p className="text-ink-900 dark:text-paper-100">Couldn't find that question.</p>
        <button onClick={() => navigate('/')} className="mt-3 text-signal-teal underline">
          &larr; Back to graph
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-paper-50 dark:bg-ink-950">
      <QuestionPanel question={question} />

      <div className="min-h-0 flex-1">
        <MobileEditor key={question.id} ref={editorRef} initialValue={question.starterCode} />
      </div>

      <div className="flex items-center gap-2 border-t border-ink-600/40 bg-paper-50 px-3 py-2 dark:bg-ink-950">
        <button
          onClick={handleReset}
          onBlur={() => setConfirmReset(false)}
          className="rounded-md border border-ink-600 px-3 py-2 font-mono text-xs text-ink-900 dark:text-paper-100"
        >
          {confirmReset ? 'Tap again to confirm' : 'Reset'}
        </button>
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="rounded-md border border-ink-600 px-3 py-2 font-mono text-xs text-ink-900 dark:text-paper-100"
        >
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
        <button
          onClick={handleRun}
          className="ml-auto rounded-md bg-signal-amber px-5 py-2 font-mono text-sm font-semibold text-ink-950 shadow-none active:opacity-80"
        >
          Run ▶
        </button>
      </div>

      {showSolution && (
        <div className="max-h-[45vh] overflow-y-auto border-t border-ink-600/40 bg-ink-900 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
              Reference solution (read-only)
            </span>
            <button
              onClick={handleLoadSolutionIntoEditor}
              className="font-mono text-[11px] text-signal-amber underline"
            >
              {confirmLoadSolution ? 'Tap again to overwrite editor' : 'Load into editor'}
            </button>
          </div>
          <CodeBlock code={question.answer} wrap />
        </div>
      )}

      <div className="max-h-[35vh] overflow-y-auto border-t border-ink-600/40">
        <TestResults status={status} result={result} errorMessage={errorMessage} />
      </div>
    </div>
  )
}

export default Solve
