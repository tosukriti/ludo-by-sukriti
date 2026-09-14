"use client"

import { Crown, RotateCcw } from "lucide-react"
import { type Color, COLORS } from "@/lib/ludo"

export function WinnerModal({
  name,
  color,
  onPlayAgain,
}: {
  name: string
  color: Color
  onPlayAgain: () => void
}) {
  const col = COLORS[color]
  const confetti = Array.from({ length: 60 })
  const palette = [COLORS.red.base, COLORS.green.base, COLORS.yellow.base, COLORS.blue.base]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {confetti.map((_, i) => (
          <span
            key={i}
            className="absolute top-0 block size-2 rounded-sm"
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: palette[i % palette.length],
              animation: `confetti-fall ${2.5 + (i % 5) * 0.5}s linear ${(i % 10) * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/60 bg-white p-8 text-center shadow-2xl"
        style={{ animation: "pop-in 0.4s ease-out" }}
      >
        <div
          className="mx-auto mb-4 grid size-20 place-items-center rounded-full border-4 border-white shadow-lg"
          style={{ background: `radial-gradient(circle at 32% 28%, ${col.ring}, ${col.base} 70%)` }}
        >
          <Crown className="size-10 text-white" fill="currentColor" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Winner</p>
        <h2 className="mt-1 text-3xl font-black text-slate-900">{name}</h2>
        <p className="mt-2 text-sm text-slate-500">All four tokens made it home. Congratulations!</p>
        <button
          type="button"
          onClick={onPlayAgain}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
        >
          <RotateCcw className="size-5" /> Play Again
        </button>
      </div>
    </div>
  )
}
