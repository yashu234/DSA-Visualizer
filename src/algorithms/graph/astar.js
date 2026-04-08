// A* on an unweighted grid (cost = 1, 4-neighbor).
// Returns { steps, found }

import { getNeighbors, nodeKey, reconstructPath } from '../../utils/gridUtils.js'

export function aStarSteps(grid, start, end) {
  const steps = []

  const startKey = nodeKey(start)
  const endKey = nodeKey(end)

  const open = new Set([startKey])
  const cameFrom = new Map()

  const gScore = new Map()
  const fScore = new Map()
  gScore.set(startKey, 0)
  fScore.set(startKey, heuristic(start, end))

  while (open.size > 0) {
    let currentKey = null
    let bestF = Infinity

    for (const k of open) {
      const f = fScore.get(k) ?? Infinity
      if (f < bestF) {
        bestF = f
        currentKey = k
      }
    }

    if (currentKey === null) break

    const current = parseKey(currentKey)
    steps.push({ type: 'visit', node: current })

    if (currentKey === endKey) {
      const path = reconstructPath(cameFrom, end)
      for (const p of path) steps.push({ type: 'path', node: p })
      return { steps, found: true }
    }

    open.delete(currentKey)

    for (const nb of getNeighbors(current, grid)) {
      const nk = nodeKey(nb)
      const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1

      if (tentativeG < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, current)
        gScore.set(nk, tentativeG)
        fScore.set(nk, tentativeG + heuristic(nb, end))
        steps.push({ type: 'relax', from: current, node: nb })
        open.add(nk)
      }
    }
  }

  return { steps, found: false }
}

function heuristic(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col)
}

function parseKey(key) {
  const [r, c] = key.split(',').map((n) => Number(n))
  return { row: r, col: c }
}

export const aStarMeta = {
  name: 'A*',
  time: 'O(V^2) (grid demo)',
}
