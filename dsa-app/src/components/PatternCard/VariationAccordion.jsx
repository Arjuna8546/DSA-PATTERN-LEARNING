import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CodeBlock from '../CodeBlock.jsx'
import DifficultyBadge from './DifficultyBadge.jsx'

const FIELD_LABELS = {
  inputShape: 'Input',
  movement: 'Movement',
  timeComplexity: 'Time',
  spaceComplexity: 'Space',
}

function ChevronIcon({ open }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-4 w-4 shrink-0 text-ink-500 transition-transform duration-300 ${open ? '-rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VariationAccordion({ variation, questions }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()
  const contentId = `variation-${variation.id}-content`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variation.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — fail silently
    }
  }

  return (
    <div className="rounded-lg border border-ink-600/60 bg-paper-100 transition-colors dark:bg-ink-900">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3.5 text-left transition-colors hover:bg-paper-50 dark:hover:bg-ink-800/50"
      >
        <div className="min-w-0">
          <div className="font-display text-base font-semibold text-ink-900 dark:text-paper-100">
            {variation.name}
          </div>
          <div className="mt-0.5 text-sm text-ink-600 dark:text-ink-500">{variation.summary}</div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 font-mono text-[10px] text-ink-500 sm:flex">
            <span className="rounded border border-ink-600/40 px-1.5 py-0.5">{variation.timeComplexity}</span>
            <span className="rounded border border-ink-600/40 px-1.5 py-0.5">{variation.spaceComplexity}</span>
          </div>
          <ChevronIcon open={open} />
        </div>
      </button>

      <div
        id={contentId}
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-ink-600/40 px-4 py-4">

            <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {Object.entries(FIELD_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-baseline gap-1.5">
                  <dt className="font-mono text-[10px] uppercase tracking-wide text-ink-500">{label}</dt>
                  <dd className="text-ink-900 dark:text-paper-100">{variation[key]}</dd>
                </div>
              ))}
            </dl>

            {/* The signal — how to spot this variation before you even see the code */}
            <div className="rounded border-l-2 border-ink-500 bg-ink-600/5 px-3 py-2 text-sm text-ink-900 dark:bg-ink-600/10 dark:text-paper-100">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                The signal
              </div>
              {variation.recognizeIt}
            </div>



            {/* Step-by-step walkthrough — the bridge between "I recognize this" and "here's the code" */}
            {Array.isArray(variation.stepByStepAlgorithm) && variation.stepByStepAlgorithm.length > 0 && (
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ink-500">
                  Step by step
                </div>
                <ol className="space-y-2">
                  {variation.stepByStepAlgorithm.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-ink-900 dark:text-paper-100">
                      <span className="mt-0.5 shrink-0 font-mono text-[11px] text-ink-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-500">Code</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="font-mono text-[10px] uppercase tracking-wide text-ink-500 transition-colors hover:text-ink-900 dark:hover:text-paper-100"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <CodeBlock code={variation.code} />
            </div>

            {/* {variation.keyInsight && (
              <div className="rounded border-l-2 border-signal-amber bg-signal-amber/10 px-3 py-2 text-sm text-ink-900 dark:text-paper-100">
                <span className="font-semibold">Key insight — </span>
                {variation.keyInsight}
              </div>
            )} */}

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
                      className="flex w-full items-center justify-between gap-3 rounded border border-ink-600/40 bg-paper-50 px-3 py-2.5 text-left transition-colors hover:border-ink-600 dark:bg-ink-800 dark:hover:border-ink-500"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink-900 dark:text-paper-100">
                          {q.title}
                        </div>
                        <div className="font-mono text-[11px] text-ink-500">{q.platform}</div>
                      </div>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VariationAccordion