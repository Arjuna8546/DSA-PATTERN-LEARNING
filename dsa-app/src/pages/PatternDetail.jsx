import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPattern, getQuestionsForVariation } from '../lib/data'
import CodeBlock from '../components/CodeBlock.jsx'
import VariationAccordion from '../components/PatternCard/VariationAccordion.jsx'

function PatternDetail() {
  const { dsId, categoryId, patternId } = useParams()
  const navigate = useNavigate()
  const found = getPattern(dsId, categoryId, patternId)

  // 'split' = half/half, 'pattern' = left column full, 'variations' = right column full.
  const [focusMode, setFocusMode] = useState('split')
  // Tracks which side we expanded to last, so repeated clicks from split
  // alternate between the two sides instead of always picking the same one.
  const [lastFocused, setLastFocused] = useState('pattern')

  const handleToggle = () => {
    if (focusMode === 'split') {
      const next = lastFocused === 'variations' ? 'pattern' : 'variations'
      setFocusMode(next)
      setLastFocused(next)
    } else {
      setFocusMode('split')
    }
  }

  if (!found) {
    return (
      <div className="p-6">
        <p className="text-ink-900 dark:text-paper-100">Couldn't find that pattern.</p>
        <button onClick={() => navigate('/')} className="mt-3 text-signal-teal underline">
          &larr; Back to graph
        </button>
      </div>
    )
  }

  const { ds, category, pattern } = found

  return (
    <div className="min-h-screen bg-paper-50 pb-16 dark:bg-ink-950">
      <header className="sticky top-0 z-10 border-b border-ink-600/40 bg-paper-50/95 px-4 py-3 backdrop-blur dark:bg-ink-950/95">
        
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
          <button
          onClick={() => navigate('/')}
          className="mb-1.5  gap-1 font-mono text-xs text-signal-teal"
        >
          &larr; Back to graph
        </button> / {ds.name} <span className="mx-1">/</span> {category.name} <span className="mx-1">/</span> {pattern.name}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 lg:max-w-6xl lg:px-8">
        <div className="space-y-8 lg:flex lg:items-start lg:space-y-0">
          {/* Left: pattern context */}
          <div
            className={`lg:overflow-hidden lg:transition-all lg:duration-300 lg:ease-in-out ${
              focusMode === 'pattern'
                ? 'lg:w-full lg:opacity-100'
                : focusMode === 'variations'
                  ? 'lg:w-0 lg:opacity-0'
                  : 'lg:w-1/2 lg:opacity-100'
            }`}
          >
            <div className="space-y-8 lg:sticky lg:top-20 lg:self-start lg:pr-8">
              <section>
                <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-paper-100">
                  {pattern.name}
                </h1>
              </section>

              <section>
                <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-signal-violet">
                  What is this pattern?
                </h2>
                <p className="leading-relaxed text-ink-900 dark:text-paper-100">{pattern.whatIsThisPattern}</p>
              </section>

              <section>
                <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-signal-violet">
                  What problems does it solve?
                </h2>
                <ul className="list-disc space-y-1.5 pl-5 text-ink-900 dark:text-paper-100">
                  {pattern.whatProblemsDoesItSolve.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-signal-violet">
                  Step-by-step algorithm
                </h2>
                <ol className="list-decimal space-y-1.5 pl-5 text-ink-900 dark:text-paper-100">
                  {pattern.stepByStepAlgorithm.steps.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ol>
                <div className="mt-3">
                  {/* <CodeBlock code={pattern.stepByStepAlgorithm.code} /> */}
                </div>
              </section>
            </div>
          </div>

          {/* Divider + focus toggle — desktop only */}
          <div className="hidden shrink-0 lg:sticky lg:top-20 lg:flex lg:w-10 lg:justify-center lg:self-start lg:pt-1">
            <button
              type="button"
              onClick={handleToggle}
              aria-label={focusMode === 'split' ? 'Focus this panel' : 'Return to split view'}
              title={focusMode === 'split' ? 'Focus' : 'Split view'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600/30 text-sm text-ink-500 transition-colors hover:border-ink-600/60 hover:text-ink-900 dark:hover:text-paper-100"
            >
              {focusMode === 'split' ? '\u203A' : '\u2039'}
            </button>
          </div>

          {/* Right: variations */}
          <div
            className={`lg:overflow-hidden lg:transition-all lg:duration-300 lg:ease-in-out ${
              focusMode === 'variations'
                ? 'lg:w-full lg:opacity-100'
                : focusMode === 'pattern'
                  ? 'lg:w-0 lg:opacity-0'
                  : 'lg:w-1/2 lg:opacity-100'
            }`}
          >
            <section className="lg:pl-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-signal-violet">Variations</h2>
              <div className="space-y-3">
                {pattern.variations.map((variation) => (
                  <VariationAccordion
                    key={variation.id}
                    variation={variation}
                    questions={getQuestionsForVariation(dsId, categoryId, patternId, variation.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PatternDetail