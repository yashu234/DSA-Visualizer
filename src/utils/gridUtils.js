// Grid helpers for the graph visualizer.

export function createGrid({ rows = 20, cols = 40, start, end } = {}) {
  const startNode = start ?? { row: Math.floor(rows / 2), col: Math.floor(cols / 4) }
  const endNode = end ?? { row: Math.floor(rows / 2), col: Math.floor((3 * cols) / 4) }

  const grid = []
  for (let r = 0; r < rows; r += 1) {
    const row = []
    for (let c = 0; c < cols; c += 1) {
      row.push({
        row: r,
        col: c,
        isStart: r === startNode.row && c === startNode.col,
        isEnd: r === endNode.row && c === endNode.col,
        isWall: false,
      })
    }
    grid.push(row)
  }

  return { grid, start: startNode, end: endNode }
}

export function nodeKey(node) {
  return `${node.row},${node.col}`
}

export function inBounds(row, col, rows, cols) {
  return row >= 0 && row < rows && col >= 0 && col < cols
}

export function getNeighbors(pos, grid) {
  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ]

  const neighbors = []
  for (const { dr, dc } of dirs) {
    const nr = pos.row + dr
    const nc = pos.col + dc
    if (!inBounds(nr, nc, grid.length, grid[0].length)) continue
    const cell = grid[nr][nc]
    if (cell.isWall) continue
    neighbors.push({ row: nr, col: nc })
  }
  return neighbors
}

export function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

export function setWall(grid, { row, col }, isWall) {
  const next = cloneGrid(grid)
  const cell = next[row][col]
  if (cell.isStart || cell.isEnd) return next
  cell.isWall = isWall
  return next
}

export function moveSpecialNode(grid, fromPos, toPos, type /* 'start' | 'end' */) {
  const next = cloneGrid(grid)
  const from = next[fromPos.row][fromPos.col]
  const to = next[toPos.row][toPos.col]

  if (to.isWall) return next
  if (type === 'start') {
    from.isStart = false
    to.isStart = true
  } else {
    from.isEnd = false
    to.isEnd = true
  }
  return next
}

export function reconstructPath(prevMap, endPos) {
  const path = []
  let curKey = nodeKey(endPos)
  while (prevMap.has(curKey)) {
    const prev = prevMap.get(curKey)
    path.push(parseKey(curKey))
    curKey = nodeKey(prev)
  }
  path.reverse()
  return path
}

function parseKey(key) {
  const [r, c] = key.split(',').map((n) => Number(n))
  return { row: r, col: c }
}
