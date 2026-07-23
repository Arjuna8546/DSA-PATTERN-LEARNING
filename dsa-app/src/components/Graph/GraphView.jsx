import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow'
import 'reactflow/dist/style.css'
import { computeTreeGraph } from './treelayout'
import GraphNode from './GraphNode'
import { BRANCH_PALETTE, ROOT_COLOR } from './nodeStyles'
import { getStoredViewport, setStoredViewport } from '../../lib/graphViewport'

const nodeTypes = { graphNode: GraphNode }

// Builds the ds -> category -> pattern hierarchy straight from the
// dataStructures prop, so this component no longer needs buildGraphModel.
function buildTree(dataStructures) {
  return {
    id: 'root',
    kind: 'root',
    label: 'DSA Patterns',
    children: dataStructures.map((ds) => ({
      id: `ds:${ds.id}`,
      kind: 'ds',
      label: ds.name,
      dsId: ds.id,
      children: (ds.categories || []).map((cat) => ({
        id: `cat:${ds.id}:${cat.id}`,
        kind: 'category',
        label: cat.name,
        dsId: ds.id,
        categoryId: cat.id,
        children: (cat.patterns || []).map((pat) => ({
          id: `pat:${ds.id}:${cat.id}:${pat.id}`,
          kind: 'pattern',
          label: pat.name,
          dsId: ds.id,
          categoryId: cat.id,
          patternId: pat.id,
          children: [],
        })),
      })),
    })),
  }
}

// Given a node id, returns the ids of the nodes that must be expanded for
// it to be visible ('pat:ds:cat:pat' -> ['ds:ds', 'cat:ds:cat']).
function ancestorsOf(id) {
  const parts = id.split(':')
  if (parts[0] === 'pat') return [`ds:${parts[1]}`, `cat:${parts[1]}:${parts[2]}`]
  if (parts[0] === 'cat') return [`ds:${parts[1]}`]
  return []
}

function GraphView({ dataStructures }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const tree = useMemo(() => buildTree(dataStructures), [dataStructures])
  const normalizedQuery = query.trim().toLowerCase()

  // While searching, auto-open the ancestors of anything that matches so
  // results aren't hidden behind a collapsed node.
  const effectiveExpanded = useMemo(() => {
    if (!normalizedQuery) return expandedIds
    const extra = new Set(expandedIds)
    const stack = [tree]
    while (stack.length) {
      const node = stack.pop()
      if (node.id !== 'root' && node.label.toLowerCase().includes(normalizedQuery)) {
        ancestorsOf(node.id).forEach((id) => extra.add(id))
      }
      ;(node.children || []).forEach((c) => stack.push(c))
    }
    return extra
  }, [expandedIds, normalizedQuery, tree])

  const { nodes: graphNodes, edges: graphEdges } = useMemo(
    () => computeTreeGraph(tree, effectiveExpanded),
    [tree, effectiveExpanded]
  )

  const flowNodes = useMemo(
    () =>
      graphNodes.map((n) => ({
        id: n.id,
        type: 'graphNode',
        position: { x: n.x, y: n.y },
        data: {
          ...n,
          dimmed:
            !!normalizedQuery && n.kind !== 'root' && !n.label.toLowerCase().includes(normalizedQuery),
        },
        draggable: false,
        sourcePosition: 'right',
        targetPosition: 'left',
      })),
    [graphNodes, normalizedQuery]
  )

  const flowEdges = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'default',
        style: {
          stroke: BRANCH_PALETTE[e.colorIndex % BRANCH_PALETTE.length],
          strokeWidth: 1.6,
        },
      })),
    [graphEdges]
  )

  const onNodeClick = useCallback(
    (_event, node) => {
      if (node.data.kind === 'pattern') {
        navigate(`/pattern/${node.data.dsId}/${node.data.categoryId}/${node.data.patternId}`)
        return
      }
      if (node.data.hasChildren) {
        setExpandedIds((prev) => {
          const next = new Set(prev)
          if (next.has(node.id)) next.delete(node.id)
          else next.add(node.id)
          return next
        })
      }
    },
    [navigate]
  )

  const storedViewport = useMemo(() => getStoredViewport(), [])

  const onMoveEnd = useCallback((_event, viewport) => {
    setStoredViewport(viewport)
  }, [])

  return (
    <div className="relative h-full w-full">

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onMoveEnd={onMoveEnd}
        {...(storedViewport
          ? { defaultViewport: storedViewport }
          : { fitView: true, fitViewOptions: { padding: 0.5 } })}
        minZoom={0.15}
        maxZoom={1.75}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        edgesFocusable={false}
      >
        <Background color="#252c36" gap={28} size={1} />
        <Controls showInteractive={false} className="!bottom-20 !left-3 sm:!bottom-3" />
      </ReactFlow>
    </div>
  )
}

export default GraphView