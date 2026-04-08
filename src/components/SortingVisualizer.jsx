import { useEffect, useMemo, useRef, useState } from 'react'
import Controls from './Controls.jsx'
import { generateArray } from '../utils/generateArray.js'

import { bubbleSortSteps, bubbleSortMeta } from '../algorithms/sorting/bubbleSort.js'
import { selectionSortSteps, selectionSortMeta } from '../algorithms/sorting/selectionSort.js'
import { mergeSortSteps, mergeSortMeta } from '../algorithms/sorting/mergeSort.js'
import { quickSortSteps, quickSortMeta } from '../algorithms/sorting/quickSort.js'

const SORTS = {
  bubble: { label: 'Bubble Sort', steps: bubbleSortSteps, meta: bubbleSortMeta },
  selection: { label: 'Selection Sort', steps: selectionSortSteps, meta: selectionSortMeta },
  merge: { label: 'Merge Sort', steps: mergeSortSteps, meta: mergeSortMeta },
  quick: { label: 'Quick Sort', steps: quickSortSteps, meta: quickSortMeta },
}

export default function SortingVisualizer() {
  const [algorithm, setAlgorithm] = useState('bubble')
  const [speed, setSpeed] = useState(25) // ms per step

  const [length, setLength] = useState(60)
  const [minValue, setMinValue] = useState(10)
  const [maxValue, setMaxValue] = useState(280)
  const [soundEnabled, setSoundEnabled] = useState(false)

  const [array, setArray] = useState(() =>
    generateArray({ length: 60, min: 10, max: 280 }),
  )
  const [initialArray, setInitialArray] = useState(() => array)
  const arrayRef = useRef(array)

  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)

  const [active, setActive] = useState({
    comparing: [],
    swapping: [],
    sorted: new Set(),
    pivot: null,
    writing: null,
  })

  const [isRunning, setIsRunning] = useState(false)
  const isRunningRef = useRef(false)
  const isPausedRef = useRef(false)
  const timerRef = useRef(null)

  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, overwrites: 0 })
  const [totalStats, setTotalStats] = useState({ comparisons: 0, swaps: 0, overwrites: 0 })

  const audioCtxRef = useRef(null)

  useEffect(() => {
    arrayRef.current = array
  }, [array])

  const algoOptions = useMemo(
    () => Object.entries(SORTS).map(([value, v]) => ({ value, label: v.label })),
    [],
  )

  const meta = SORTS[algorithm]?.meta

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function resetHighlights() {
    setActive({ comparing: [], swapping: [], sorted: new Set(), pivot: null, writing: null })
  }

  function resetStats() {
    setStats({ comparisons: 0, swaps: 0, overwrites: 0 })
    setTotalStats({ comparisons: 0, swaps: 0, overwrites: 0 })
  }

  function handleGenerate() {
    if (isRunningRef.current) return

    const safeMin = Math.min(minValue, maxValue)
    const safeMax = Math.max(minValue, maxValue)
    const next = generateArray({ length, min: safeMin, max: safeMax })

    setArray(next)
    setInitialArray(next)
    setSteps([])
    setStepIndex(0)
    resetHighlights()
    resetStats()
  }

  function handleReset() {
    clearTimer()
    setIsRunning(false)
    isRunningRef.current = false
    isPausedRef.current = false

    setArray(initialArray)
    setSteps([])
    setStepIndex(0)
    resetHighlights()
    resetStats()
  }

  function ensureSteps() {
    if (steps.length > 0) return steps
    const newSteps = SORTS[algorithm].steps(array)
    setSteps(newSteps)

    // Precompute totals for display.
    const totals = { comparisons: 0, swaps: 0, overwrites: 0 }
    for (const s of newSteps) {
      if (s.type === 'compare') totals.comparisons += 1
      if (s.type === 'swap') totals.swaps += 1
      if (s.type === 'overwrite') totals.overwrites += 1
    }
    setTotalStats(totals)

    return newSteps
  }

  function maybeBeep(step) {
    if (!soundEnabled) return
    if (!step) return

    // Lazily create AudioContext on first user-initiated run/step.
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      } catch {
        return
      }
    }

    const ctx = audioCtxRef.current
    if (!ctx) return

    const kind = step.type
    if (kind !== 'compare' && kind !== 'swap' && kind !== 'overwrite') return

    // Choose a value to map to pitch.
    let value = null
    if (kind === 'compare' || kind === 'swap') {
      const idx = step.indices?.[0]
      value = typeof idx === 'number' ? arrayRef.current[idx] : null
    }
    if (kind === 'overwrite') {
      value = step.value
    }
    if (typeof value !== 'number') value = 100

    const safeMin = Math.min(minValue, maxValue)
    const safeMax = Math.max(minValue, maxValue)
    const t = safeMax === safeMin ? 0.5 : (value - safeMin) / (safeMax - safeMin)
    const freq = 220 + Math.max(0, Math.min(1, t)) * 660

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    const baseGain = kind === 'swap' ? 0.05 : 0.02
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(baseGain, now + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.035)
  }

  function applyStep(step) {
    if (!step) return

    maybeBeep(step)

    if (step.type === 'compare') {
      setStats((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }))
    }
    if (step.type === 'swap') {
      setStats((prev) => ({ ...prev, swaps: prev.swaps + 1 }))
    }
    if (step.type === 'overwrite') {
      setStats((prev) => ({ ...prev, overwrites: prev.overwrites + 1 }))
    }

    setActive((prev) => {
      // Reset transient highlights; keep sorted set.
      const sortedSet = new Set(prev.sorted)
      const next = { comparing: [], swapping: [], sorted: sortedSet, pivot: null, writing: null }

      if (step.type === 'compare') {
        next.comparing = step.indices
      }

      if (step.type === 'swap') {
        next.swapping = step.indices
      }

      if (step.type === 'pivot') {
        next.pivot = step.index
      }

      if (step.type === 'pivotDone') {
        next.sorted.add(step.index)
      }

      if (step.type === 'sorted') {
        for (const idx of step.indices) sortedSet.add(idx)
      }

      if (step.type === 'segmentSorted') {
        const [l, r] = step.range
        for (let i = l; i <= r; i += 1) sortedSet.add(i)
      }

      if (step.type === 'sortedAll') {
        for (let i = 0; i < array.length; i += 1) sortedSet.add(i)
      }

      if (step.type === 'overwrite') {
        next.writing = step.index
      }

      return next
    })

    // Apply array mutations.
    if (step.type === 'swap') {
      const [i, j] = step.indices
      setArray((prev) => {
        const next = prev.slice()
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      })
    }

    if (step.type === 'overwrite') {
      setArray((prev) => {
        const next = prev.slice()
        next[step.index] = step.value
        return next
      })
    }
  }

  async function run() {
    const st = ensureSteps()
    if (stepIndex >= st.length) return

    setIsRunning(true)
    isRunningRef.current = true
    isPausedRef.current = false

    const tick = () => {
      if (!isRunningRef.current || isPausedRef.current) return

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
    isPausedRef.current = true
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

  // If the user changes algorithm while idle, reset to current array (do not auto-generate).
  useEffect(() => {
    if (isRunningRef.current) return
    setSteps([])
    setStepIndex(0)
    resetHighlights()
    resetStats()
  }, [algorithm])

  // Cleanup on unmount.
  useEffect(() => {
    return () => clearTimer()
  }, [])

  const canNext = stepIndex < (steps.length || 1)

  return (
    <div className="grid gap-4 lg:grid-cols-[380px,1fr]">
      <div className="space-y-4">
        <Controls
          title="Sorting Controls"
          algorithm={algorithm}
          algorithmOptions={algoOptions}
          onAlgorithmChange={setAlgorithm}
          speed={speed}
          onSpeedChange={setSpeed}
          onGenerate={handleGenerate}
          generateLabel="New Array"
          onStart={run}
          onPause={pause}
          onReset={handleReset}
          onNext={next}
          isRunning={isRunning}
          canNext={canNext}
          meta={meta}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <label className="flex flex-col gap-1 text-xs text-slate-300">
              Array Size: <span className="text-slate-100">{length}</span>
              <input
                type="range"
                min={10}
                max={160}
                value={length}
                disabled={isRunning}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-xs text-slate-300">
                Min
                <input
                  type="number"
                  value={minValue}
                  disabled={isRunning}
                  onChange={(e) => setMinValue(Number(e.target.value))}
                  className="h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-300">
                Max
                <input
                  type="number"
                  value={maxValue}
                  disabled={isRunning}
                  onChange={(e) => setMaxValue(Number(e.target.value))}
                  className="h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
              />
              Sound (beeps)
            </label>

            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-200">
              <div className="font-semibold text-slate-100">Stats</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <div className="text-slate-400">Comparisons</div>
                  <div className="font-mono">{stats.comparisons}/{totalStats.comparisons}</div>
                </div>
                <div>
                  <div className="text-slate-400">Swaps</div>
                  <div className="font-mono">{stats.swaps}/{totalStats.swaps}</div>
                </div>
                <div>
                  <div className="text-slate-400">Writes</div>
                  <div className="font-mono">{stats.overwrites}/{totalStats.overwrites}</div>
                </div>
              </div>
              <div className="mt-2 text-slate-400">Tip: click “New Array” after changing size/range.</div>
            </div>
          </div>
        </Controls>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4">
        <div className="flex h-[360px] items-end gap-[2px]">
          {array.map((value, idx) => {
            const isComparing = active.comparing.includes(idx)
            const isSwapping = active.swapping.includes(idx)
            const isSorted = active.sorted.has(idx)
            const isPivot = active.pivot === idx
            const isWriting = active.writing === idx

            const color = isSorted
              ? 'bg-green-400'
              : isSwapping || isWriting
                ? 'bg-yellow-300'
                : isComparing
                  ? 'bg-red-400'
                  : isPivot
                    ? 'bg-yellow-300'
                    : 'bg-blue-400'

            return (
              <div
                key={idx}
                className={`flex-1 rounded-t-sm ${color}`}
                style={{ height: `${value}px` }}
                title={`${value}`}
              />
            )
          })}
        </div>

        <div className="mt-3 text-xs text-slate-400">
          Tip: Use “Next” for step-by-step when paused.
        </div>
      </div>
    </div>
  )
}
