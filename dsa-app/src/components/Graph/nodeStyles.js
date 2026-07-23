// Colors are assigned per top-level data-structure "branch" (by index) and
// inherited by every category/pattern underneath it, so a whole limb of the
// mind-map reads as one color family, e.g. all of Array's descendants stay
// purple, all of Trees' descendants stay red. This matches the reference
// mind map, where color encodes lineage rather than node type.
export const BRANCH_PALETTE = [
  '#8b7ec8', // purple    - e.g. Array
  '#c23b8f', // magenta   - e.g. String
  '#3ba7c2', // blue      - e.g. Hash map
  '#2fae94', // teal      - e.g. Stack
  '#e08a2b', // orange    - e.g. Queue / Deque
  '#d4a017', // gold      - e.g. Linked List
  '#d9536a', // red/pink  - e.g. Trees
  '#8265d6', // violet    - e.g. Recursion
  '#22b8a6', // teal (alt)- e.g. Heap
  '#a67c52', // brown     - e.g. Graphs
  '#4a90d9', // blue (alt)- e.g. Trie
  '#c2703b', // burnt orange
]

export const ROOT_COLOR = '#e7ebf0'