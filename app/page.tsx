"use client"

import { RotateCcw } from "lucide-react"
import { useLudoGame } from "@/hooks/use-ludo-game"
import { COLORS } from "@/lib/ludo"
import { GameSetup } from "@/components/game-setup"
import { LudoBoard } from "@/components/ludo-board"
import { PlayerPanel } from "@/components/player-panel"
import { Dice } from "@/components/dice"
import { WinnerModal } from "@/components/winner-modal"

export default function Page() {
  const { state, start, roll, move, reset, currentPlayer, canRoll, canMove } = useLudoGame()

  if (state.phase === "setup") {
    return (
      <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-rose-100 via-amber-50 to-blue-100 p-4">
        <GameSetup onStart={start} />
      </main>
    )
  }

  const accent = currentPlayer ? COLORS[currentPlayer.color].base : "#0f172a"

  return (
    <main className="min-h-dvh bg-gradient-to-br from-rose-100 via-amber-50 to-blue-100 p-3 sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
        {/* Header + board */}
        <div className="flex w-full flex-col items-center gap-4 lg:max-w-[560px]">
          <header className="flex w-full items-center justify-between gap-3">
            <div>
              <h1 className="bg-gradient-to-r from-rose-600 via-amber-500 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                Ludo
              </h1>
              <p className="text-xs font-medium text-slate-500">developed by Sukriti</p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <RotateCcw className="size-4" /> New Game
            </button>
          </header>

          <div className="w-full">
            <LudoBoard
              state={state}
              movable={state.movable}
              currentColor={currentPlayer?.color ?? null}
              canMove={canMove}
              onTokenClick={move}
            />
          </div>
        </div>

        {/* Side controls */}
        <aside className="flex w-full flex-col gap-4 lg:w-64">
          <PlayerPanel state={state} />

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur">
            <div
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow"
              style={{ backgroundColor: accent }}
            >
              <span
                className="size-4 shrink-0 rounded-full border border-white/70"
                style={{ background: currentPlayer ? COLORS[currentPlayer.color].ring : "#fff" }}
              />
              <span className="truncate">{state.message}</span>
            </div>

            <Dice value={state.dice} onRoll={roll} disabled={!canRoll} accent={accent} />

            <p className="text-center text-xs text-slate-500">
              {currentPlayer?.isCPU
                ? `${currentPlayer.name} is thinking…`
                : canRoll
                  ? "Tap the dice to roll"
                  : canMove && state.movable.length > 0
                    ? "Tap a highlighted token to move"
                    : "Waiting…"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/60 bg-white/60 p-3 text-xs leading-relaxed text-slate-500 shadow-sm backdrop-blur">
            <p className="mb-1 font-semibold text-slate-600">How to play</p>
            Roll a 6 to release a token from base. Land on an opponent to send it home. Star squares are
            safe. Get all 4 tokens to the center to win. Rolling a 6, capturing, or reaching home earns
            another roll.
          </div>
        </aside>
      </div>

      {state.phase === "won" && state.winner && (
        <WinnerModal
          name={state.players.find((p) => p.color === state.winner)!.name}
          color={state.winner}
          onPlayAgain={reset}
        />
      )}
    </main>
  )
}
