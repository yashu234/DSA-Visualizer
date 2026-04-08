# DSA Visualizer (React + Tailwind)

A beginner-friendly Data Structures & Algorithms visualizer built with **React (Vite)** and **Tailwind CSS**.

## Features

- Sorting Visualizer
  - Bubble Sort, Selection Sort, Merge Sort, Quick Sort
  - Step-by-step animation using precomputed **step arrays** (compare/swap/overwrite)
  - Advanced controls (branch `advanced`): array size + value range, live stats, optional sound
- Graph Visualizer (grid)
  - Click/drag to add/remove walls
  - Drag Start/End to move (branch `advanced`)
  - BFS, DFS, Dijkstra, A* (branch `advanced`)
  - Step-by-step animation using precomputed **step arrays** (visit/path)
- Controls
  - New / Start / Pause / Reset / Next
  - Speed slider
  - Algorithm dropdown
  - Time complexity display for the selected algorithm

## Setup

```bash
npm install
npm run dev
```

## Advanced version

This workspace also includes an "advanced" branch with extra features.

```bash
git checkout advanced
npm install
npm run dev
```

## Notes

- Animations are driven by step arrays, not by sorting/pathfinding directly.
- This project uses only client-side code (no backend).
