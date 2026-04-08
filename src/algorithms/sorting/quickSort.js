// Quick Sort (step generator)

export function quickSortSteps(array) {
  const arr = array.slice()
  const steps = []

  quickSort(arr, 0, arr.length - 1, steps)
  steps.push({ type: 'sortedAll' })
  return steps
}

function quickSort(arr, low, high, steps) {
  if (low > high) return
  if (low === high) {
    steps.push({ type: 'sorted', indices: [low] })
    return
  }

  const p = partition(arr, low, high, steps)
  steps.push({ type: 'sorted', indices: [p] })
  quickSort(arr, low, p - 1, steps)
  quickSort(arr, p + 1, high, steps)
}

function partition(arr, low, high, steps) {
  const pivotIdx = high
  const pivotVal = arr[pivotIdx]
  steps.push({ type: 'pivot', index: pivotIdx })

  let i = low
  for (let j = low; j < high; j += 1) {
    steps.push({ type: 'compare', indices: [j, pivotIdx] })
    if (arr[j] < pivotVal) {
      if (i !== j) {
        steps.push({ type: 'swap', indices: [i, j] })
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      i += 1
    }
  }

  steps.push({ type: 'swap', indices: [i, pivotIdx] })
  ;[arr[i], arr[pivotIdx]] = [arr[pivotIdx], arr[i]]
  steps.push({ type: 'pivotDone', index: i })
  return i
}

export const quickSortMeta = {
  name: 'Quick Sort',
  time: {
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n^2)',
  },
}
