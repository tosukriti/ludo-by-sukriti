"use client"

import { Star } from "lucide-react"
import {
  type Color,
  type GameState,
  BASE_SPOTS,
  COLORS,
  cellForToken,
  getCellInfo,
} from "@/lib/ludo"

const N = 15
const PCT = 100 / N

interface RenderedToken {
  color: Color
  index: number
  r: number
  c: number
  movable: boolean
}

export function LudoBoard({
  state,
  movable,
  currentColor,
  canMove,
  onTokenClick,
}: {
  state: GameState
  movable: number[]
  currentColor: Color | null
  canMove: boolean
  onTokenClick: (index: number) => void
}) {
  const activeColors = state.players.map((p) => p.color)

  // Gather every token to render.
  const tokens: RenderedToken[] = []
  for (const color of activeColors) {
    state.tokens[color].forEach((pos, index) => {
      const [r, c] = cellForToken(color, pos, index)
      tokens.push({
        color,
        index,
        r,
        c,
        movable: canMove && color === currentColor && movable.includes(index),
      })
    })
  }

  // Cluster tokens sharing a cell so they don't fully overlap.
  const groups = new Map<string, RenderedToken[]>()
  for (const t of tokens) {
    const key = `${t.r},${t.c}`
    const arr = groups.get(key) ?? []
    arr.push(t)
    groups.set(key, arr)
  }

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl ring-1 ring-black/10"
      role="grid"
      aria-label="Ludo board"
    >
      {/* Background cells */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }}>
        {Array.from({ length: N * N }).map((_, i) => {
          const r = Math.floor(i / N)
          const c = i % N
          return <CellBg key={i} r={r} c={c} />
        })}
      </div>

      {/* Center pinwheel */}
      <div
        className="absolute grid place-items-center"
        style={{
          left: `${6 * PCT}%`,
          top: `${6 * PCT}%`,
          width: `${3 * PCT}%`,
          height: `${3 * PCT}%`,
          background: `conic-gradient(from 45deg, ${COLORS.yellow.base} 0deg 90deg, ${COLORS.blue.base} 90deg 180deg, ${COLORS.red.base} 180deg 270deg, ${COLORS.green.base} 270deg 360deg)`,
        }}
      >
        <div className="size-2/5 rounded-full bg-white/90 shadow-inner" />
      </div>

      {/* Tokens */}
      {tokens.map((t) => {
        const group = groups.get(`${t.r},${t.c}`) ?? []
        const gi = group.indexOf(t)
        const n = group.length
        let dx = 0
        let dy = 0
        if (n > 1) {
          const spread = 0.22
          dx = ((gi % 2) - 0.5) * 2 * spread
          dy = (Math.floor(gi / 2) - (n <= 2 ? 0 : 0.5)) * 2 * spread
        }
        const left = (t.c + 0.5 + dx) * PCT
        const top = (t.r + 0.5 + dy) * PCT
        const col = COLORS[t.color]
        return (
          <button
            key={`${t.color}-${t.index}`}
            type="button"
            disabled={!t.movable}
            onClick={() => t.movable && onTokenClick(t.index)}
            aria-label={`${col.name} token ${t.index + 1}`}
            className="absolute z-10 rounded-full transition-[left,top] duration-300 ease-out disabled:cursor-default"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${PCT * 0.66}%`,
              height: `${PCT * 0.66}%`,
              transform: "translate(-50%, -50%)",
              animation: t.movable ? "token-pulse 1s ease-in-out infinite" : undefined,
              zIndex: t.movable ? 30 : 10,
            }}
          >
            <span
              className="block size-full rounded-full border-2 border-white shadow-md"
              style={{
                background: `radial-gradient(circle at 32% 28%, ${col.ring}, ${col.base} 70%)`,
                boxShadow: t.movable
                  ? `0 0 0 3px ${col.ring}, 0 4px 10px -2px rgba(0,0,0,0.4)`
                  : "0 3px 8px -2px rgba(0,0,0,0.45)",
              }}
            >
              <span className="absolute left-1/2 top-1/2 size-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CellBg({ r, c }: { r: number; c: number }) {
  const info = getCellInfo(r, c)

  if (info.type === "center") return <div className="border-0" />

  if (info.type === "base") {
    const col = COLORS[info.color]
    const spots = BASE_SPOTS[info.color]
    const isSpot = spots.some(([sr, sc]) => sr === r && sc === c)
    // inner white area of the base (rows/cols 1..4 within the quadrant)
    const inInner =
      (r >= 1 && r <= 4 && c >= 1 && c <= 4) ||
      (r >= 1 && r <= 4 && c >= 10 && c <= 13) ||
      (r >= 10 && r <= 13 && c >= 1 && c <= 4) ||
      (r >= 10 && r <= 13 && c >= 10 && c <= 13)
    return (
      <div className="grid place-items-center" style={{ backgroundColor: col.base }}>
        {inInner && (
          <div className="grid size-full place-items-center bg-white">
            {isSpot && (
              <div
                className="size-3/4 rounded-full border-2"
                style={{ borderColor: col.base, backgroundColor: col.light }}
              />
            )}
          </div>
        )}
      </div>
    )
  }

  if (info.type === "home") {
    return <div style={{ backgroundColor: COLORS[info.color].base }} className="opacity-90" />
  }

  if (info.type === "path") {
    const bg = info.startColor ? COLORS[info.startColor].base : "#ffffff"
    const textOnColor = !!info.startColor
    return (
      <div
        className="grid place-items-center border border-slate-200"
        style={{ backgroundColor: bg }}
      >
        {info.safe && (
          <Star
            className="size-1/2"
            style={{ color: textOnColor ? "rgba(255,255,255,0.9)" : "#94a3b8" }}
            fill={textOnColor ? "rgba(255,255,255,0.9)" : "none"}
            strokeWidth={1.5}
          />
        )}
      </div>
    )
  }

  return <div className="bg-white" />
}
