import { useMemo } from 'react'

export default function Controls({
  title,
  algorithm,
  algorithmOptions,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  onGenerate,
  generateLabel,
  onStart,
  onPause,
  onReset,
  onNext,
  isRunning,
  canNext,
  meta,
}) {
  const speedLabel = useMemo(() => {
    if (speed <= 10) return 'Fast'
    if (speed <= 35) return 'Medium'
    return 'Slow'
  }, [speed])

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {meta ? (
            <p className="mt-1 text-xs text-slate-300">
              {meta.name}{' '}
              {meta.time ? (
                <>
                  • Time: {formatMetaTime(meta.time)}
                </>
              ) : null}
            </p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">Step-based animation</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Algorithm
            <select
              value={algorithm}
              onChange={(e) => onAlgorithmChange?.(e.target.value)}
              disabled={isRunning}
              className="h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-slate-100"
            >
              {algorithmOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-slate-300">
            Speed ({speedLabel})
            <input
              type="range"
              min={5}
              max={80}
              value={speed}
              onChange={(e) => onSpeedChange?.(Number(e.target.value))}
              className="h-10"
            />
          </label>

          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={onGenerate}
                disabled={isRunning}
                className="h-10 rounded-lg bg-slate-800 px-3 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
              >
                {generateLabel ?? 'Generate'}
              </button>
              <button
                type="button"
                onClick={isRunning ? onPause : onStart}
                className="h-10 rounded-lg bg-slate-100 px-3 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                type="button"
                onClick={onReset}
                className="h-10 rounded-lg bg-slate-800 px-3 text-sm font-medium hover:bg-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext || isRunning}
                className="h-10 rounded-lg bg-slate-800 px-3 text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatMetaTime(time) {
  if (typeof time === 'string') return time
  if (!time) return ''
  const parts = []
  if (time.best) parts.push(`best ${time.best}`)
  if (time.avg) parts.push(`avg ${time.avg}`)
  if (time.worst) parts.push(`worst ${time.worst}`)
  return parts.join(' · ')
}
