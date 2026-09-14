"use client"

import { Bot, User, Crown } from "lucide-react"
import { type GameState, COLORS } from "@/lib/ludo"

export function PlayerPanel({ state }: { state: GameState }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
      {state.players.map((player, i) => {
        const col = COLORS[player.color]
        const isTurn = state.turn === i && state.phase === "playing"
        const finished = state.tokens[player.color].filter((p) => p === 56).length
        const isWinner = state.winner === player.color
        return (
          <div
            key={player.color}
            className={`relative flex items-center gap-3 rounded-2xl border-2 bg-white p-3 transition-all ${
              isTurn ? "shadow-lg" : "border-transparent shadow-sm"
            }`}
            style={{ borderColor: isTurn ? col.base : undefined }}
          >
            {isTurn && (
              <span
                className="absolute -right-1 -top-1 flex size-3"
                aria-hidden
              >
                <span className="absolute inline-flex size-full animate-ping rounded-full opacity-75" style={{ backgroundColor: col.ring }} />
                <span className="relative inline-flex size-3 rounded-full" style={{ backgroundColor: col.base }} />
              </span>
            )}
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-white shadow"
              style={{ background: `radial-gradient(circle at 32% 28%, ${col.ring}, ${col.base} 70%)` }}
            >
              {player.isCPU ? (
                <Bot className="size-4 text-white" />
              ) : (
                <User className="size-4 text-white" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 truncate text-sm font-bold text-slate-800">
                <span className="truncate">{player.name}</span>
                {isWinner && <Crown className="size-4 shrink-0 text-amber-500" fill="currentColor" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-400">Home:</span>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3].map((t) => (
                    <span
                      key={t}
                      className="size-2 rounded-full"
                      style={{ backgroundColor: t < finished ? col.base : "#e2e8f0" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
