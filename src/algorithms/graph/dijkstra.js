// Dijkstra on a grid with uniform edge weights (cost = 1).
// Returns { steps, found }

import { getNeighbors, nodeKey, reconstructPath } from '../../utils/gridUtils.js'

export function dijkstraSteps(grid, start, end) {
  const steps = []
  const dist = new Map()
  const prev = new Map()
  const unvisited = new Set()

  const rows = grid.length
  const cols = grid[0].length
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = grid[r][c]
      if (cell.isWall) continue
      const k = nodeKey({ row: r, col: c })
      unvisited.add(k)
      dist.set(k, Infinity)
    }
  }

  dist.set(nodeKey(start), 0)

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance (simple O(V^2) selection, OK for small grids).
    let bestKey = null
    let bestDist = Infinity
    for (const k of unvisited) {
      const d = dist.get(k) ?? Infinity
      if (d < bestDist) {
        bestDist = d
        bestKey = k
      }
    }

    if (bestKey === null || bestDist === Infinity) break

    unvisited.delete(bestKey)
    const cur = parseKey(bestKey)
    steps.push({ type: 'visit', node: cur })

    if (cur.row === end.row && cur.col === end.col) {
      const path = reconstructPath(prev, end)
      for (const p of path) steps.push({ type: 'path', node: p })
      return { steps, found: true }
    }

    for (const nb of getNeighbors(cur, grid)) {
      const nk = nodeKey(nb)
      if (!unvisited.has(nk)) continue
      const alt = bestDist + 1
      if (alt < (dist.get(nk) ?? Infinity)) {
        dist.set(nk, alt)
        prev.set(nk, cur)
        steps.push({ type: 'relax', from: cur, node: nb })
      }
    }
  }

  return { steps, found: false }
}

function parseKey(key) {
  const [r, c] = key.split(',').map((n) => Number(n))
  return { row: r, col: c }
}

export const dijkstraMeta = {
  name: 'Dijkstra',
  time: 'O(V^2) (grid demo)',
}
