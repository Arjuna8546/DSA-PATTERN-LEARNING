import { Handle, Position } from 'reactflow'
import { BRANCH_PALETTE, ROOT_COLOR } from './nodeStyles'

/**
 * A single mind-map node, rendered left-to-right (handles on Left/Right,
 * not Top/Bottom) so edges curve horizontally like the reference screenshots.
 *
 * - root: a boxed title on the far left.
 * - ds / category (hasChildren): bold text in the branch color, plus a
 *   small round badge showing how many patterns live under it. Tapping
 *   toggles expand/collapse (handled in GraphView).
 * - pattern (leaf): plain, unbadged text. Tapping navigates to the pattern
 *   page.
 */
function GraphNode({ data }) {
  const { kind, label, hasChildren, count, colorIndex, dimmed } = data
  const color = kind === 'root' ? ROOT_COLOR : BRANCH_PALETTE[(colorIndex ?? 0) % BRANCH_PALETTE.length]
  const isLeaf = kind === 'pattern'

  return (
    <div
      className={`flex items-center whitespace-nowrap select-none transition-opacity duration-150 ${
        dimmed ? 'opacity-25' : 'opacity-100'
      } ${kind === 'root' ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {kind === 'root' ? (
        <div
          className="rounded-lg px-4 py-3 text-center leading-tight"
          style={{ backgroundColor: '#0f1318', border: `1.5px solid ${color}` }}
        >
          <div className="text-sm font-semibold" style={{ color }}>
            {label}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span
            className={isLeaf ? 'text-xs font-medium text-paper-100/90' : 'text-sm font-bold'}
            style={isLeaf ? undefined : { color }}
          >
            {label}
          </span>
          {hasChildren && (
            <span
              className="flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {count}
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  )
}

export default GraphNode