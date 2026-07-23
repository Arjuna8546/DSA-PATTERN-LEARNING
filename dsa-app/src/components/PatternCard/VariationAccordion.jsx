import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeBlock from '../CodeBlock.jsx'
import DifficultyBadge from './DifficultyBadge.jsx'

const FIELD_LABELS = {
  inputShape: 'Input shape',
  movement: 'Pointer / window movement',
  timeComplexity: 'Time',
  spaceComplexity: 'Space',
  // recognizeIt: 'How to recognize it',
}

function VariationAccordion({ variation, questions }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div className="rounded-md border border-ink-600/60 bg-paper-100 dark:bg-ink-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <div className="font-display text-base font-semibold text-ink-900 dark:text-paper-100">
            {variation.name}
          </div>
          <div className="mt-0.5 text-sm text-ink-600 dark:text-ink-500">{variation.summary}</div>
        </div>
        <span
          className={`shrink-0 font-mono text-lg text-ink-500 transition-transform ${open ? 'rotate-45' : ''}`}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-ink-600/40 px-4 py-4">
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {Object.entries(FIELD_LABELS).map(([key, label]) => (
              <div key={key} className="col-span-1 sm:col-span-1">
                <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
                <dd className="mt-0.5 text-ink-900 dark:text-paper-100">{variation[key]}</dd>
              </div>
            ))}
          </dl>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">How to recognize it</dt>
            <dd className="mt-0.5 text-ink-900 dark:text-paper-100">{variation['recognizeIt']}</dd>
          </div>

          <div>
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-500">Code</div>
            <CodeBlock code={variation.code} />
          </div>

          {variation.keyInsight && (
            <div className="rounded border-l-2 border-signal-amber bg-signal-amber/10 px-3 py-2 text-sm text-ink-900 dark:text-paper-100">
              <span className="font-semibold">Key insight — </span>
              {variation.keyInsight}
            </div>
          )}

          {questions.length > 0 && (
            <div>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                Practice questions
              </div>
              <div className="space-y-1.5">
                {questions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigate(`/solve/${q.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded border border-ink-600/40 bg-paper-50 px-3 py-2.5 text-left dark:bg-ink-800"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-ink-900 dark:text-paper-100">{q.title}</div>
                      <div className="font-mono text-[11px] text-ink-500">{q.platform}</div>
                    </div>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VariationAccordion
