import { useParams, useNavigate } from 'react-router-dom'
import { getPattern, getQuestionsForVariation } from '../lib/data'
import CodeBlock from '../components/CodeBlock.jsx'
import VariationAccordion from '../components/PatternCard/VariationAccordion.jsx'

function PatternDetail() {
  const { dsId, categoryId, patternId } = useParams()
  const navigate = useNavigate()
  const found = getPattern(dsId, categoryId, patternId)

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
        <button
          onClick={() => navigate('/')}
          className="mb-1.5 flex items-center gap-1 font-mono text-xs text-signal-teal"
        >
          &larr; Back to graph
        </button>
        <div className="font-mono text-[11px] uppercase tracking-wide text-ink-500">
          {ds.name} <span className="mx-1">/</span> {category.name} <span className="mx-1">/</span> {pattern.name}
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-4 py-6">
        <section>
          <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-paper-100">{pattern.name}</h1>
        </section>

        <section>
          <h2 className="mb-2 font-mono text-xs uppercase tracking-wide text-signal-violet">What is this pattern?</h2>
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
            <CodeBlock code={pattern.stepByStepAlgorithm.code} />
          </div>
        </section>

        <section>
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
      </main>
    </div>
  )
}

export default PatternDetail
