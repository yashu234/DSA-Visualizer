// Selection Sort (step generator)

export function selectionSortSteps(array) {
  const arr = array.slice()
  const steps = []

  for (let i = 0; i < arr.length; i += 1) {
    let minIdx = i
    for (let j = i + 1; j < arr.length; j += 1) {
      steps.push({ type: 'compare', indices: [minIdx, j] })
      if (arr[j] < arr[minIdx]) {
        minIdx = j
      }
    }

    if (minIdx !== i) {
      steps.push({ type: 'swap', indices: [i, minIdx] })
      ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
    }
    steps.push({ type: 'sorted', indices: [i] })
  }

  steps.push({ type: 'sortedAll' })
  return steps
}

export const selectionSortMeta = {
  name: 'Selection Sort',
  time: {
    best: 'O(n^2)',
    avg: 'O(n^2)',
    worst: 'O(n^2)',
  },
}
