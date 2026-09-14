"use client"

import { useState } from "react"
import { Bot, User, Play, Dice5 } from "lucide-react"
import { type Color, type Player, COLORS, TURN_COLORS } from "@/lib/ludo"

const DEFAULT_NAMES: Record<Color, string> = {
  red: "Player 1",
  green: "Player 2",
  yellow: "Player 3",
  blue: "Player 4",
}

export function GameSetup({ onStart }: { onStart: (players: Player[]) => void }) {
  const [count, setCount] = useState<2 | 3 | 4>(4)
  const [config, setConfig] = useState<Record<Color, { name: string; isCPU: boolean }>>({
    red: { name: DEFAULT_NAMES.red, isCPU: false },
    green: { name: DEFAULT_NAMES.green, isCPU: true },
    yellow: { name: DEFAULT_NAMES.yellow, isCPU: true },
    blue: { name: DEFAULT_NAMES.blue, isCPU: true },
  })

  const colors = TURN_COLORS[count]

  function handleStart() {
    const players: Player[] = colors.map((color) => ({
      color,
      name: config[color].name.trim() || DEFAULT_NAMES[color],
      isCPU: config[color].isCPU,
    }))
    onStart(players)
  }

  return (
    <div className="w-full max-w-md" style={{ animation: "pop-in 0.4s ease-out" }}>
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 via-amber-400 to-blue-500 shadow-lg">
            <Dice5 className="size-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="bg-gradient-to-r from-rose-600 via-amber-500 to-blue-600 bg-clip-text text-4xl font-black tracking-tight text-transparent">
            Ludo
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">developed by Sukriti</p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Number of players
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n as 2 | 3 | 4)}
                className={`rounded-xl border-2 py-2.5 text-sm font-bold transition-all ${
                  count === n
                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {n} Players
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {colors.map((color) => {
            const col = COLORS[color]
            const cfg = config[color]
            return (
              <div
                key={color}
                className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-2.5 shadow-sm"
              >
                <span
                  className="size-8 shrink-0 rounded-full border-2 border-white shadow"
                  style={{ background: `radial-gradient(circle at 32% 28%, ${col.ring}, ${col.base} 70%)` }}
                  aria-hidden
                />
                <input
                  value={cfg.name}
                  onChange={(e) =>
                    setConfig((p) => ({ ...p, [color]: { ...p[color], name: e.target.value } }))
                  }
                  maxLength={16}
                  aria-label={`${col.name} player name`}
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
                />
                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, [color]: { ...p[color], isCPU: false } }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      !cfg.isCPU ? "bg-slate-900 text-white" : "bg-white text-slate-500"
                    }`}
                    aria-pressed={!cfg.isCPU}
                  >
                    <User className="size-3.5" /> Human
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig((p) => ({ ...p, [color]: { ...p[color], isCPU: true } }))}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      cfg.isCPU ? "bg-slate-900 text-white" : "bg-white text-slate-500"
                    }`}
                    aria-pressed={cfg.isCPU}
                  >
                    <Bot className="size-3.5" /> CPU
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleStart}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-amber-500 to-blue-600 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
        >
          <Play className="size-5" fill="currentColor" /> Start Game
        </button>
      </div>
    </div>
  )
}
