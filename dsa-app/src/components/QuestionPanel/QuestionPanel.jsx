import { useState } from 'react'
import DifficultyBadge from '../PatternCard/DifficultyBadge.jsx'

function QuestionPanel({ question }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-b border-ink-600/40 bg-paper-50 dark:bg-ink-950">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="truncate font-display text-base font-semibold text-ink-900 dark:text-paper-100">
            {question.title}
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-ink-500">
            <span>
              {question.platform}
              {question.platformProblemId ? ` #${question.platformProblemId}` : ''}
            </span>
            <DifficultyBadge difficulty={question.difficulty} />
          </div>
        </div>
        <span className="shrink-0 font-mono text-xs text-ink-500">{expanded ? 'Hide' : 'Show'}</span>
      </button>
      {expanded && (
        <div className="max-h-[40vh] overflow-y-auto whitespace-pre-wrap px-4 pb-4 text-sm leading-relaxed text-ink-900 dark:text-paper-100">
          {question.description}
        </div>
      )}
    </div>
  )
}

export default QuestionPanel
