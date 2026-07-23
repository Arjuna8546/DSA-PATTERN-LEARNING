import { useState } from 'react'

function jsonify(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function ErrorBlock({ error }) {
  const [showTraceback, setShowTraceback] = useState(false)
  return (
    <div className="rounded border border-signal-coral/40 bg-signal-coral/10 px-3 py-2 text-sm">
      <div className="font-semibold text-signal-coral">
        {error.type}: {error.message}
      </div>
      {error.traceback && (
        <>
          <button
            type="button"
            onClick={() => setShowTraceback((s) => !s)}
            className="mt-1 font-mono text-[11px] text-ink-500 underline"
          >
            {showTraceback ? 'Hide full traceback' : 'Show full traceback'}
          </button>
          {showTraceback && (
            <pre className="mt-1.5 max-h-48 overflow-auto whitespace-pre-wrap rounded bg-ink-950/80 p-2 font-mono text-[11px] text-paper-100">
              {error.traceback}
            </pre>
          )}
        </>
      )}
    </div>
  )
}

function TestCaseRow({ index, testCase }) {
  const passed = testCase.passed
  return (
    <div
      className={`rounded border px-3 py-2.5 text-sm ${
        passed
          ? 'border-signal-teal/40 bg-signal-teal/10'
          : 'border-signal-coral/40 bg-signal-coral/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-500">Case {index + 1}</span>
        <span
          className={`flex items-center gap-1 font-mono text-xs font-semibold ${
            passed ? 'text-signal-teal' : 'text-signal-coral'
          }`}
        >
          {passed ? '✓ Pass' : '✕ Fail'}
        </span>
      </div>
      <div className="mt-1.5 space-y-1 font-mono text-xs text-ink-900 dark:text-paper-100">
        <div>
          <span className="text-ink-500">input: </span>
          {jsonify(testCase.input)}
        </div>
        <div>
          <span className="text-ink-500">expected: </span>
          {jsonify(testCase.expected)}
        </div>
        {!testCase.error && (
          <div>
            <span className="text-ink-500">actual: </span>
            {jsonify(testCase.actual)}
          </div>
        )}
      </div>
      {testCase.stdout && (
        <pre className="mt-1.5 max-h-24 overflow-auto whitespace-pre-wrap rounded bg-ink-950/80 p-2 font-mono text-[11px] text-paper-100">
          {testCase.stdout}
        </pre>
      )}
      {testCase.error && (
        <div className="mt-1.5">
          <ErrorBlock error={testCase.error} />
        </div>
      )}
    </div>
  )
}

function TestResults({ status, result, errorMessage }) {
  if (status === 'idle') {
    return <p className="p-4 text-sm text-ink-500">Run your code to see test results here.</p>
  }

  if (status === 'loading-pyodide') {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-ink-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-signal-amber border-t-transparent" />
        Starting up the Python runtime — this only happens once…
      </div>
    )
  }

  if (status === 'running') {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-ink-500">
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-signal-amber border-t-transparent" />
        Running your code against all test cases…
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="p-4">
        <ErrorBlock error={{ type: 'RuntimeError', message: errorMessage, traceback: null }} />
      </div>
    )
  }

  if (!result) return null

  if (result.setupError) {
    return (
      <div className="space-y-2 p-4">
        <p className="text-sm text-ink-900 dark:text-paper-100">Your code didn't run — fix this and try again:</p>
        <ErrorBlock error={result.setupError} />
      </div>
    )
  }

  const passedCount = result.results.filter((r) => r.passed).length
  const total = result.results.length

  return (
    <div className="space-y-2.5 p-4">
      <div
        className={`rounded px-3 py-2 text-center font-mono text-sm font-semibold ${
          passedCount === total
            ? 'bg-signal-teal/15 text-signal-teal'
            : 'bg-signal-coral/15 text-signal-coral'
        }`}
      >
        {passedCount}/{total} test cases passed
      </div>
      {result.results.map((testCase, i) => (
        <TestCaseRow key={i} index={i} testCase={testCase} />
      ))}
    </div>
  )
}

export default TestResults
