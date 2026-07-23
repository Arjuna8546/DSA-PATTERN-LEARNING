import { getDataStructures } from '../lib/data'
import GraphView from '../components/Graph/GraphView'
import { useTheme } from '../lib/ThemeContext'

function Home() {
  const dataStructures = getDataStructures()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen w-screen flex-col bg-paper-50 dark:bg-ink-950">
      <header className="flex items-center justify-between border-b border-ink-600/40 px-4 py-3">
        <div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-ink-900 dark:text-paper-100">
            DSA by Pattern
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-500 dark:text-ink-500">
            Tap a pattern node to open it
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-md border border-ink-600 px-3 py-1.5 text-xs font-medium text-ink-900 dark:text-paper-100"
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </header>
      <div className="relative flex-1">
        <GraphView dataStructures={dataStructures} />
      </div>
    </div>
  )
}

export default Home
