// Merge Sort (step generator)
// Uses overwrite steps because merge sort writes values back into the array.

export function mergeSortSteps(array) {
  const arr = array.slice()
  const aux = array.slice()
  const steps = []

  mergeSort(arr, aux, 0, arr.length - 1, steps)
  steps.push({ type: 'sortedAll' })
  return steps
}

function mergeSort(arr, aux, left, right, steps) {
  if (left >= right) return
  const mid = Math.floor((left + right) / 2)
  mergeSort(aux, arr, left, mid, steps)
  mergeSort(aux, arr, mid + 1, right, steps)
  merge(arr, aux, left, mid, right, steps)
}

function merge(arr, aux, left, mid, right, steps) {
  let i = left
  let j = mid + 1
  let k = left

  while (i <= mid && j <= right) {
    steps.push({ type: 'compare', indices: [i, j] })
    if (aux[i] <= aux[j]) {
      steps.push({ type: 'overwrite', index: k, value: aux[i], from: i })
      arr[k] = aux[i]
      i += 1
    } else {
      steps.push({ type: 'overwrite', index: k, value: aux[j], from: j })
      arr[k] = aux[j]
      j += 1
    }
    k += 1
  }

  while (i <= mid) {
    steps.push({ type: 'overwrite', index: k, value: aux[i], from: i })
    arr[k] = aux[i]
    i += 1
    k += 1
  }

  while (j <= right) {
    steps.push({ type: 'overwrite', index: k, value: aux[j], from: j })
    arr[k] = aux[j]
    j += 1
    k += 1
  }

  // Mark this segment as sorted-ish (visual hint)
  steps.push({ type: 'segmentSorted', range: [left, right] })
}

export const mergeSortMeta = {
  name: 'Merge Sort',
  time: {
    best: 'O(n log n)',
    avg: 'O(n log n)',
    worst: 'O(n log n)',
  },
}
