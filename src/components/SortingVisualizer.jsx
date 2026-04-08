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

  const [array, setArray] = useState(() => generateArray({ length: 60, min: 10, max: 280 }))
  const [initialArray, setInitialArray] = useState(() => array)

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

  function handleGenerate() {
    if (isRunningRef.current) return
    const next = generateArray({ length: 60, min: 10, max: 280 })
    setArray(next)
    setInitialArray(next)
    setSteps([])
    setStepIndex(0)
    resetHighlights()
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
  }

  function ensureSteps() {
    if (steps.length > 0) return steps
    const newSteps = SORTS[algorithm].steps(array)
    setSteps(newSteps)
    return newSteps
  }

  function applyStep(step) {
    if (!step) return

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
  }, [algorithm])

  // Cleanup on unmount.
  useEffect(() => {
    return () => clearTimer()
  }, [])

  const canNext = stepIndex < (steps.length || 1)

  return (
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
      />

      <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-4">
        <div className="flex h-[320px] items-end gap-[2px]">
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
