const STYLES = {
  Easy: 'bg-signal-teal/15 text-signal-teal border-signal-teal/40',
  Medium: 'bg-signal-amber/15 text-signal-amber border-signal-amber/40',
  Hard: 'bg-signal-coral/15 text-signal-coral border-signal-coral/40',
}

function DifficultyBadge({ difficulty }) {
  const cls = STYLES[difficulty] || 'bg-ink-700/30 text-ink-500 border-ink-600'
  return (
    <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide ${cls}`}>
      {difficulty}
    </span>
  )
}

export default DifficultyBadge
