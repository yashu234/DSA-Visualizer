// Generates a random integer array for the sorting visualizer.
// Kept separate from UI so algorithms can remain pure.

export function generateArray({
  length = 60,
  min = 10,
  max = 300,
} = {}) {
  const arr = []
  for (let i = 0; i < length; i += 1) {
    arr.push(randomInt(min, max))
  }
  return arr
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
