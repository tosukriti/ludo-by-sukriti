export type Color = "red" | "green" | "yellow" | "blue"

export type Cell = [number, number] // [row, col] on a 15x15 grid

export interface Player {
  color: Color
  name: string
  isCPU: boolean
}

export interface GameState {
  phase: "setup" | "playing" | "won"
  players: Player[]
  tokens: Record<Color, number[]> // each token: -1 = base, 0..50 main, 51..55 home, 56 = finished
  turn: number // index into players
  dice: number | null
  rolled: boolean // dice has been rolled, awaiting a move
  movable: number[] // token indices that can legally move with current dice
  sixes: number // consecutive sixes this turn
  winner: Color | null
  message: string
  lastMovedToken: { color: Color; index: number } | null
}

// The 52-cell shared main track, traced clockwise starting at red's entry.
export const MAIN_PATH: Cell[] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], [6, 0],
]

export const START_OFFSET: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
}

// Colored home stretch (5 cells) leading toward the center goal.
export const HOME_PATH: Record<Color, Cell[]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
}

export const CENTER: Cell = [7, 7]

// 4 colored start cells + 4 star cells = safe squares (no capturing).
export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47])

// The 4 resting spots inside each player's base.
export const BASE_SPOTS: Record<Color, Cell[]> = {
  red: [[1, 1], [1, 4], [4, 1], [4, 4]],
  green: [[1, 10], [1, 13], [4, 10], [4, 13]],
  yellow: [[10, 10], [10, 13], [13, 10], [13, 13]],
  blue: [[10, 1], [10, 4], [13, 1], [13, 4]],
}

export const COLORS: Record<Color, { base: string; light: string; ring: string; name: string }> = {
  red: { base: "#e11d48", light: "#fecdd3", ring: "#fb7185", name: "Red" },
  green: { base: "#16a34a", light: "#bbf7d0", ring: "#4ade80", name: "Green" },
  yellow: { base: "#f59e0b", light: "#fde68a", ring: "#fbbf24", name: "Yellow" },
  blue: { base: "#2563eb", light: "#bfdbfe", ring: "#60a5fa", name: "Blue" },
}

export const TURN_COLORS: Record<number, Color[]> = {
  2: ["red", "yellow"],
  3: ["red", "green", "yellow"],
  4: ["red", "green", "yellow", "blue"],
}

function buildFullPath(color: Color): Cell[] {
  const off = START_OFFSET[color]
  const arr: Cell[] = []
  for (let r = 0; r <= 50; r++) {
    arr.push(MAIN_PATH[(off + r) % 52])
  }
  for (const c of HOME_PATH[color]) arr.push(c)
  arr.push(CENTER)
  return arr // length 57, index 56 = goal
}

export const FULL_PATH: Record<Color, Cell[]> = {
  red: buildFullPath("red"),
  green: buildFullPath("green"),
  yellow: buildFullPath("yellow"),
  blue: buildFullPath("blue"),
}

// Reverse lookup from "r,c" -> main path index
const MAIN_INDEX = new Map<string, number>()
MAIN_PATH.forEach(([r, c], i) => MAIN_INDEX.set(`${r},${c}`, i))

export function mainIndexAt(r: number, c: number): number {
  const v = MAIN_INDEX.get(`${r},${c}`)
  return v === undefined ? -1 : v
}

export type CellInfo =
  | { type: "center" }
  | { type: "base"; color: Color }
  | { type: "home"; color: Color }
  | { type: "path"; startColor: Color | null; safe: boolean }
  | { type: "empty" }

export function getCellInfo(r: number, c: number): CellInfo {
  if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return { type: "center" }
  if (r < 6 && c < 6) return { type: "base", color: "red" }
  if (r < 6 && c > 8) return { type: "base", color: "green" }
  if (r > 8 && c < 6) return { type: "base", color: "blue" }
  if (r > 8 && c > 8) return { type: "base", color: "yellow" }
  if (r === 7 && c >= 1 && c <= 5) return { type: "home", color: "red" }
  if (c === 7 && r >= 1 && r <= 5) return { type: "home", color: "green" }
  if (r === 7 && c >= 9 && c <= 13) return { type: "home", color: "yellow" }
  if (c === 7 && r >= 9 && r <= 13) return { type: "home", color: "blue" }
  const idx = mainIndexAt(r, c)
  if (idx !== -1) {
    let startColor: Color | null = null
    if (idx === 0) startColor = "red"
    else if (idx === 13) startColor = "green"
    else if (idx === 26) startColor = "yellow"
    else if (idx === 39) startColor = "blue"
    return { type: "path", startColor, safe: SAFE_INDICES.has(idx) }
  }
  return { type: "empty" }
}

export function cellForToken(color: Color, pos: number, tokenIndex: number): Cell {
  if (pos < 0) return BASE_SPOTS[color][tokenIndex]
  return FULL_PATH[color][pos]
}

export function getMovableTokens(state: GameState, color: Color, dice: number): number[] {
  const movable: number[] = []
  state.tokens[color].forEach((pos, i) => {
    if (pos === 56) return
    if (pos === -1) {
      if (dice === 6) movable.push(i)
    } else if (pos + dice <= 56) {
      movable.push(i)
    }
  })
  return movable
}

export function isSafePos(color: Color, pos: number): boolean {
  if (pos < 0 || pos > 50) return true // base and home stretch are safe
  return SAFE_INDICES.has((START_OFFSET[color] + pos) % 52)
}
