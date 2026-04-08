// DFS on an unweighted grid (4-neighbor).
// Returns { steps, found }

import { getNeighbors, nodeKey, reconstructPath } from '../../utils/gridUtils.js'

export function dfsSteps(grid, start, end) {
  const steps = []
  const stack = [start]
  const visited = new Set()
  const prev = new Map()

  while (stack.length > 0) {
    const cur = stack.pop()
    const curKey = nodeKey(cur)
    if (visited.has(curKey)) continue

    visited.add(curKey)
    steps.push({ type: 'visit', node: cur })

    if (cur.row === end.row && cur.col === end.col) {
      const path = reconstructPath(prev, end)
      for (const p of path) steps.push({ type: 'path', node: p })
      return { steps, found: true }
    }

    const neighbors = getNeighbors(cur, grid)
    // Reverse so it visually explores in a stable-ish order.
    for (let i = neighbors.length - 1; i >= 0; i -= 1) {
      const nb = neighbors[i]
      const k = nodeKey(nb)
      if (visited.has(k)) continue
      if (!prev.has(k)) prev.set(k, cur)
      steps.push({ type: 'push', from: cur, node: nb })
      stack.push(nb)
    }
  }

  return { steps, found: false }
}

export const dfsMeta = {
  name: 'DFS',
  time: 'O(V + E)',
}
