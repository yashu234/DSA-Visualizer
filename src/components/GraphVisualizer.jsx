import { useEffect, useMemo, useRef, useState } from 'react'
import Controls from './Controls.jsx'

import { createGrid, moveSpecialNode, setWall, nodeKey } from '../utils/gridUtils.js'

import { bfsSteps, bfsMeta } from '../algorithms/graph/bfs.js'
import { dfsSteps, dfsMeta } from '../algorithms/graph/dfs.js'
import { dijkstraSteps, dijkstraMeta } from '../algorithms/graph/dijkstra.js'
import { aStarSteps, aStarMeta } from '../algorithms/graph/astar.js'

const ALGORITHMS = {
  bfs: { label: 'BFS', run: bfsSteps, meta: bfsMeta },
  dfs: { label: 'DFS', run: dfsSteps, meta: dfsMeta },
  dijkstra: { label: 'Dijkstra', run: dijkstraSteps, meta: dijkstraMeta },
  astar: { label: 'A*', run: aStarSteps, meta: aStarMeta },
}

export default function GraphVisualizer() {
  const rows = 20
  const cols = 40

  const [{ grid, start, end }, setGridState] = useState(() => createGrid({ rows, cols }))
  const [algorithm, setAlgorithm] = useState('bfs')
  const [speed, setSpeed] = useState(20)

  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)

  const [visited, setVisited] = useState(() => new Set())
  const [path, setPath] = useState(() => new Set())

  const [isRunning, setIsRunning] = useState(false)
  const isRunningRef = useRef(false)
  const timerRef = useRef(null)

  const mouseDownRef = useRef(false)
  const invalidatedThisDragRef = useRef(false)
  const dragModeRef = useRef(null) // 'start' | 'end' | 'wall'
  const paintWallToRef = useRef(true)

  const algoOptions = useMemo(
    () => Object.entries(ALGORITHMS).map(([value, a]) => ({ value, label: a.label })),
    [],
  )

  const meta = ALGORITHMS[algorithm]?.meta

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function resetOverlays() {
    setVisited(new Set())
    setPath(new Set())
  }

  function invalidateRunState() {
    setSteps([])
    setStepIndex(0)
    resetOverlays()
  }

  function handleReset() {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    setSteps([])
    setStepIndex(0)
    resetOverlays()
  }

  function handleGenerate() {
    if (isRunningRef.current) return
    const next = createGrid({ rows, cols })
    setGridState(next)
    handleReset()
  }

  function ensureSteps() {
    if (steps.length > 0) return steps
    const result = ALGORITHMS[algorithm].run(grid, start, end)
    setSteps(result.steps)
    return result.steps
  }

  function applyStep(step) {
    if (!step) return

    if (step.type === 'visit') {
      setVisited((prev) => {
        const next = new Set(prev)
        next.add(nodeKey(step.node))
        return next
      })
    }

    if (step.type === 'path') {
      setPath((prev) => {
        const next = new Set(prev)
        next.add(nodeKey(step.node))
        return next
      })
    }
  }

  function run() {
    const st = ensureSteps()
    if (stepIndex >= st.length) return

    setIsRunning(true)
    isRunningRef.current = true

    const tick = () => {
      if (!isRunningRef.current) return

      const step = st[stepIndexRef.current]
      applyStep(step)

      stepIndexRef.current += 1
      setStepIndex(stepIndexRef.current)

      if (stepIndexRef.current >= st.length) {
        setIsRunning(false)
        isRunningRef.current = false
        return
      }

      timerRef.current = setTimeout(tick, speed)
    }

    timerRef.current = setTimeout(tick, 0)
  }

  function pause() {
    setIsRunning(false)
    isRunningRef.current = false
    clearTimer()
  }

  function next() {
    const st = ensureSteps()
    if (stepIndex >= st.length) return
    applyStep(st[stepIndex])
    setStepIndex((i) => i + 1)
  }

  // Keep a ref to current step index for the timeout loop.
  const stepIndexRef = useRef(0)
  useEffect(() => {
    stepIndexRef.current = stepIndex
  }, [stepIndex])

  useEffect(() => {
    if (isRunningRef.current) return
    setSteps([])
    setStepIndex(0)
    resetOverlays()
  }, [algorithm])

  useEffect(() => {
    return () => clearTimer()
  }, [])

  function updateCell(pos, intent, wallValue) {
    // intent: 'wall' | 'start' | 'end'
    setGridState((prev) => {
      if (intent === 'start') {
        const target = prev.grid[pos.row][pos.col]
        if (target.isWall || target.isEnd) return prev
        const nextGrid = moveSpecialNode(prev.grid, prev.start, pos, 'start')
        return { grid: nextGrid, start: pos, end: prev.end }
      }
      if (intent === 'end') {
        const target = prev.grid[pos.row][pos.col]
        if (target.isWall || target.isStart) return prev
        const nextGrid = moveSpecialNode(prev.grid, prev.end, pos, 'end')
        return { grid: nextGrid, start: prev.start, end: pos }
      }

      const nextGrid = setWall(prev.grid, pos, Boolean(wallValue))
      return { ...prev, grid: nextGrid }
    })
  }

  function onMouseDown(e, pos) {
    if (isRunningRef.current) return
    mouseDownRef.current = true
    invalidatedThisDragRef.current = false

    // Decide drag mode.
    const cell = grid[pos.row][pos.col]
    if (cell.isStart) {
      dragModeRef.current = 'start'
    } else if (cell.isEnd) {
      dragModeRef.current = 'end'
    } else {
      dragModeRef.current = 'wall'
      paintWallToRef.current = !cell.isWall
    }

    if (!invalidatedThisDragRef.current) {
      invalidateRunState()
      invalidatedThisDragRef.current = true
    }

    if (dragModeRef.current === 'start') {
      updateCell(pos, 'start')
    } else if (dragModeRef.current === 'end') {
      updateCell(pos, 'end')
    } else {
      updateCell(pos, 'wall', paintWallToRef.current)
    }
  }

  function onMouseEnter(e, pos) {
    if (isRunningRef.current) return
    if (!mouseDownRef.current) return

    if (dragModeRef.current === 'start') {
      updateCell(pos, 'start')
      return
    }
    if (dragModeRef.current === 'end') {
      updateCell(pos, 'end')
      return
    }

    updateCell(pos, 'wall', paintWallToRef.current)
  }

  function onMouseUp() {
    mouseDownRef.current = false
    invalidatedThisDragRef.current = false
    dragModeRef.current = null
  }

  const canNext = stepIndex < (steps.length || 1)

  return (
    <div className="grid gap-4 lg:grid-cols-[380px,1fr]" onMouseLeave={onMouseUp}>
      <div className="space-y-4">
        <Controls
          title="Graph Controls"
          algorithm={algorithm}
          algorithmOptions={algoOptions}
          onAlgorithmChange={setAlgorithm}
          speed={speed}
          onSpeedChange={setSpeed}
          onGenerate={handleGenerate}
          generateLabel="New Grid"
          onStart={run}
          onPause={pause}
          onReset={handleReset}
          onNext={next}
          isRunning={isRunning}
          canNext={canNext}
          meta={meta}
        />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4">
        <div className="mb-3 text-xs text-slate-400">Drag Start/End to move • Click/drag to add/remove walls</div>

        <div
          className="mx-auto grid w-full max-w-6xl select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
          onMouseUp={onMouseUp}
        >
          {grid.flat().map((cell) => {
            const key = nodeKey(cell)
            const isVisited = visited.has(key)
            const isPath = path.has(key)

            const base = 'border border-slate-800/70'
            const color = cell.isStart
              ? 'bg-green-400'
              : cell.isEnd
                ? 'bg-green-400'
                : cell.isWall
                  ? 'bg-slate-800'
                  : isPath
                    ? 'bg-green-400'
                    : isVisited
                      ? 'bg-red-400'
                      : 'bg-blue-400'

            return (
              <div
                key={key}
                className={`${base} ${color} aspect-square`}
                onMouseDown={(e) => onMouseDown(e, cell)}
                onMouseEnter={(e) => onMouseEnter(e, cell)}
                role="button"
                tabIndex={0}
                aria-label={`node ${key}`}
              />
            )
          })}
        </div>

        <div className="mt-3 text-xs text-slate-400">
          Tip: Use “Next” to step through visits/path.
        </div>
      </div>
    </div>
  )
}
