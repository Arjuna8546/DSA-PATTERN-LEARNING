/**
 * Lays out the ds -> category -> pattern tree left-to-right, mind-map style,
 * like the reference screenshots: a root on the left, one row per
 * collapsed node, and a node's children only take up vertical space once
 * that node is expanded.
 *
 * `tree` is the shape produced by buildTree() in GraphView.jsx:
 *   { id, kind, label, children: [...] }
 *
 * `expandedIds` is a Set of node ids the user has opened. The ds level
 * (depth 1) is always shown; category/pattern levels only appear once
 * their parent is in `expandedIds`.
 */

const ROW_HEIGHT = 46
const DEPTH_X = [40, 320, 660, 1000]

function xForDepth(depth) {
  if (depth < DEPTH_X.length) return DEPTH_X[depth]
  return DEPTH_X[DEPTH_X.length - 1] + (depth - DEPTH_X.length + 1) * 340
}

function countLeaves(node) {
  if (!node.children || node.children.length === 0) return 1
  return node.children.reduce((sum, child) => sum + countLeaves(child), 0)
}

export function computeTreeGraph(tree, expandedIds) {
  const nodes = []
  const edges = []
  let cursorRow = 0

  function visit(node, depth, parentId, colorIndex) {
    const hasChildren = !!(node.children && node.children.length)
    const isExpanded = hasChildren && expandedIds.has(node.id)

    let y
    if (!isExpanded) {
      y = cursorRow * ROW_HEIGHT
      cursorRow += 1
    } else {
      const startRow = cursorRow
      node.children.forEach((child) => visit(child, depth + 1, node.id, colorIndex))
      const endRow = cursorRow
      y = ((startRow + endRow - 1) / 2) * ROW_HEIGHT
    }

    nodes.push({
      id: node.id,
      depth,
      kind: node.kind,
      label: node.label,
      dsId: node.dsId,
      categoryId: node.categoryId,
      patternId: node.patternId,
      hasChildren,
      isExpanded,
      count: hasChildren ? countLeaves(node) : 0,
      colorIndex,
      x: xForDepth(depth),
      y,
    })
    edges.push({ id: `${parentId}->${node.id}`, source: parentId, target: node.id, colorIndex })
  }

  // Top-level (ds) nodes each seed their own branch color, which every
  // category/pattern under them then inherits via `colorIndex`.
  tree.children.forEach((ds, i) => visit(ds, 1, tree.id, i))

  const dsYs = nodes.filter((n) => n.depth === 1).map((n) => n.y)
  nodes.push({
    id: tree.id,
    depth: 0,
    kind: 'root',
    label: tree.label,
    x: xForDepth(0),
    y: dsYs.length ? (Math.min(...dsYs) + Math.max(...dsYs)) / 2 : 0,
  })

  return { nodes, edges }
}