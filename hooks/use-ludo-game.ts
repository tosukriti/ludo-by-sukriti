"use client"

import { useCallback, useEffect, useReducer, useRef } from "react"
import {
  type Color,
  type GameState,
  type Player,
  COLORS,
  START_OFFSET,
  SAFE_INDICES,
  getMovableTokens,
} from "@/lib/ludo"

type Action =
  | { type: "START"; players: Player[] }
  | { type: "ROLL" }
  | { type: "MOVE"; index: number }
  | { type: "PASS" }
  | { type: "RESET" }

function initialState(): GameState {
  return {
    phase: "setup",
    players: [],
    tokens: { red: [-1, -1, -1, -1], green: [-1, -1, -1, -1], yellow: [-1, -1, -1, -1], blue: [-1, -1, -1, -1] },
    turn: 0,
    dice: null,
    rolled: false,
    movable: [],
    sixes: 0,
    winner: null,
    message: "",
    lastMovedToken: null,
  }
}

function nextTurn(state: GameState): Partial<GameState> {
  const turn = (state.turn + 1) % state.players.length
  const player = state.players[turn]
  return {
    turn,
    dice: null,
    rolled: false,
    movable: [],
    sixes: 0,
    message: `${player.name}'s turn`,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START": {
      const s = initialState()
      s.phase = "playing"
      s.players = action.players
      s.message = `${action.players[0].name}'s turn`
      return s
    }

    case "ROLL": {
      if (state.rolled || state.winner) return state
      const dice = Math.floor(Math.random() * 6) + 1
      const color = state.players[state.turn].color
      const sixes = dice === 6 ? state.sixes + 1 : 0

      // Three sixes in a row forfeits the turn.
      if (dice === 6 && sixes === 3) {
        return {
          ...state,
          dice,
          rolled: true,
          movable: [],
          message: "Three sixes — turn forfeited!",
        }
      }

      const movable = getMovableTokens(state, color, dice)
      return {
        ...state,
        dice,
        rolled: true,
        sixes,
        movable,
        message:
          movable.length === 0
            ? `Rolled ${dice} — no moves available`
            : `Rolled ${dice} — choose a token`,
      }
    }

    case "MOVE": {
      if (!state.rolled || state.dice === null || state.winner) return state
      if (!state.movable.includes(action.index)) return state

      const color = state.players[state.turn].color
      const dice = state.dice
      const tokens: Record<Color, number[]> = {
        red: [...state.tokens.red],
        green: [...state.tokens.green],
        yellow: [...state.tokens.yellow],
        blue: [...state.tokens.blue],
      }

      const cur = tokens[color][action.index]
      const newPos = cur === -1 ? 0 : cur + dice
      tokens[color][action.index] = newPos

      let captured = false
      if (newPos <= 50) {
        const myMain = (START_OFFSET[color] + newPos) % 52
        if (!SAFE_INDICES.has(myMain)) {
          for (const p of state.players) {
            if (p.color === color) continue
            tokens[p.color].forEach((pos, j) => {
              if (pos >= 0 && pos <= 50 && (START_OFFSET[p.color] + pos) % 52 === myMain) {
                tokens[p.color][j] = -1
                captured = true
              }
            })
          }
        }
      }

      const reachedGoal = newPos === 56
      const won = tokens[color].every((p) => p === 56)

      if (won) {
        return {
          ...state,
          tokens,
          phase: "won",
          winner: color,
          rolled: false,
          movable: [],
          dice,
          lastMovedToken: { color, index: action.index },
          message: `${state.players[state.turn].name} wins!`,
        }
      }

      const extraTurn = dice === 6 || captured || reachedGoal
      const base: GameState = {
        ...state,
        tokens,
        lastMovedToken: { color, index: action.index },
      }

      if (extraTurn) {
        let msg = `${state.players[state.turn].name} rolls again`
        if (captured) msg = "Capture! Roll again"
        else if (reachedGoal) msg = "Token home! Roll again"
        return {
          ...base,
          dice: null,
          rolled: false,
          movable: [],
          sixes: dice === 6 ? state.sixes : 0,
          message: msg,
        }
      }

      return { ...base, ...nextTurn(state) }
    }

    case "PASS": {
      if (state.winner) return state
      return { ...state, ...nextTurn(state) }
    }

    case "RESET":
      return initialState()

    default:
      return state
  }
}

export function useLudoGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }, [])

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout)
    }
  }, [])

  // Auto-pass when a roll produced no legal moves.
  useEffect(() => {
    if (state.phase !== "playing") return
    if (state.rolled && state.movable.length === 0) {
      schedule(() => dispatch({ type: "PASS" }), 1100)
    }
  }, [state.rolled, state.movable, state.phase, schedule])

  // CPU behaviour: auto-roll then auto-move.
  useEffect(() => {
    if (state.phase !== "playing" || state.winner) return
    const player = state.players[state.turn]
    if (!player?.isCPU) return

    if (!state.rolled) {
      schedule(() => dispatch({ type: "ROLL" }), 750)
      return
    }
    if (state.movable.length > 0) {
      const color = player.color
      const dice = state.dice ?? 0
      // Simple strategy: capture > finish > leave base > advance furthest.
      const scored = state.movable.map((i) => {
        const pos = state.tokens[color][i]
        const newPos = pos === -1 ? 0 : pos + dice
        let score = newPos
        if (newPos === 56) score += 200
        if (pos === -1) score += 60
        if (newPos <= 50) {
          const myMain = (START_OFFSET[color] + newPos) % 52
          if (!SAFE_INDICES.has(myMain)) {
            for (const p of state.players) {
              if (p.color === color) continue
              state.tokens[p.color].forEach((op) => {
                if (op >= 0 && op <= 50 && (START_OFFSET[p.color] + op) % 52 === myMain) score += 150
              })
            }
          }
        }
        return { i, score }
      })
      scored.sort((a, b) => b.score - a.score)
      schedule(() => dispatch({ type: "MOVE", index: scored[0].i }), 850)
    }
  }, [state.turn, state.rolled, state.movable, state.dice, state.phase, state.players, state.tokens, state.winner, schedule])

  const start = useCallback((players: Player[]) => dispatch({ type: "START", players }), [])
  const roll = useCallback(() => dispatch({ type: "ROLL" }), [])
  const move = useCallback((index: number) => dispatch({ type: "MOVE", index }), [])
  const reset = useCallback(() => dispatch({ type: "RESET" }), [])

  const currentPlayer = state.players[state.turn]
  const canRoll =
    state.phase === "playing" &&
    !state.rolled &&
    !state.winner &&
    currentPlayer &&
    !currentPlayer.isCPU

  const canMove = state.phase === "playing" && state.rolled && !currentPlayer?.isCPU

  return { state, start, roll, move, reset, currentPlayer, canRoll, canMove, COLORS }
}
