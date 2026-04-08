// Bubble Sort (step generator)
// Returns a list of steps; does NOT mutate the original input.

export function bubbleSortSteps(array) {
  const arr = array.slice()
  const steps = []

  for (let end = arr.length - 1; end > 0; end -= 1) {
    let swapped = false
    for (let i = 0; i < end; i += 1) {
      steps.push({ type: 'compare', indices: [i, i + 1] })
      if (arr[i] > arr[i + 1]) {
        steps.push({ type: 'swap', indices: [i, i + 1] })
        ;[arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]
        swapped = true
      }
    }
    steps.push({ type: 'sorted', indices: [end] })
    if (!swapped) break
  }
  steps.push({ type: 'sortedAll' })
  return steps
}

export const bubbleSortMeta = {
  name: 'Bubble Sort',
  time: {
    best: 'O(n)',
    avg: 'O(n^2)',
    worst: 'O(n^2)',
  },
}
