import { useMemo, useState } from 'react'
import SortingVisualizer from './components/SortingVisualizer.jsx'
import GraphVisualizer from './components/GraphVisualizer.jsx'

export default function App() {
  const [mode, setMode] = useState('sorting') // 'sorting' | 'graph'

  const title = useMemo(() => {
    return mode === 'sorting' ? 'Sorting Visualizer' : 'Graph Visualizer'
  }, [mode])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">DSA Visualizer</h1>
            <p className="text-sm text-slate-300">{title}</p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setMode('sorting')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium sm:flex-none ${
                mode === 'sorting'
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Sorting
            </button>
            <button
              type="button"
              onClick={() => setMode('graph')}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium sm:flex-none ${
                mode === 'graph'
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Graph
            </button>
          </div>
        </header>

        <main className="mt-6">
          {mode === 'sorting' ? <SortingVisualizer /> : <GraphVisualizer />}
        </main>

        <footer className="mt-8 text-xs text-slate-400">
          Colors: <span className="text-blue-400">Blue</span> default,{' '}
          <span className="text-red-400">Red</span> comparing/visiting,{' '}
          <span className="text-yellow-300">Yellow</span> swapping/active,{' '}
          <span className="text-green-400">Green</span> sorted/path
        </footer>
      </div>
    </div>
  )
}
