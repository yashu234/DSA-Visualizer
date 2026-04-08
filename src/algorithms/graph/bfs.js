// BFS on an unweighted grid (4-neighbor).
// Returns { steps, found }

import { getNeighbors, nodeKey, reconstructPath } from '../../utils/gridUtils.js'

export function bfsSteps(grid, start, end) {
  const steps = []
  const q = [start]
  const visited = new Set([nodeKey(start)])
  const prev = new Map()

  while (q.length > 0) {
    const cur = q.shift()
    steps.push({ type: 'visit', node: cur })

    if (cur.row === end.row && cur.col === end.col) {
      const path = reconstructPath(prev, end)
      for (const p of path) steps.push({ type: 'path', node: p })
      return { steps, found: true }
    }

    for (const nb of getNeighbors(cur, grid)) {
      const k = nodeKey(nb)
      if (visited.has(k)) continue
      visited.add(k)
      prev.set(k, cur)
      steps.push({ type: 'enqueue', from: cur, node: nb })
      q.push(nb)
    }
  }

  return { steps, found: false }
}

export const bfsMeta = {
  name: 'BFS',
  time: 'O(V + E)',
}
