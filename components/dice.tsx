"use client"

import { useEffect, useRef, useState } from "react"

const PIP_LAYOUT: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function Dice({
  value,
  onRoll,
  disabled,
  accent,
}: {
  value: number | null
  onRoll: () => void
  disabled: boolean
  accent: string
}) {
  const [display, setDisplay] = useState(value ?? 1)
  const [rolling, setRolling] = useState(false)
  const prev = useRef<number | null>(value)

  useEffect(() => {
    if (value !== null && value !== prev.current) {
      setRolling(true)
      const shuffle = setInterval(() => setDisplay(Math.floor(Math.random() * 6) + 1), 80)
      const stop = setTimeout(() => {
        clearInterval(shuffle)
        setDisplay(value)
        setRolling(false)
      }, 450)
      prev.current = value
      return () => {
        clearInterval(shuffle)
        clearTimeout(stop)
      }
    }
    prev.current = value
    if (value) setDisplay(value)
  }, [value])

  const pips = PIP_LAYOUT[display] ?? [4]

  return (
    <button
      type="button"
      onClick={onRoll}
      disabled={disabled || rolling}
      aria-label="Roll dice"
      className="group relative grid size-16 place-items-center rounded-2xl border border-white/60 bg-white shadow-lg transition-all duration-150 enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl disabled:cursor-not-allowed"
      style={{ boxShadow: `0 8px 24px -8px ${accent}66`, opacity: disabled && !rolling ? 0.6 : 1 }}
    >
      <div
        className="grid size-11 grid-cols-3 grid-rows-3 gap-0.5"
        style={{ animation: rolling ? "dice-shake 0.4s ease-in-out infinite" : undefined }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="grid place-items-center">
            {pips.includes(i) && (
              <span className="block size-2.5 rounded-full" style={{ backgroundColor: accent }} />
            )}
          </span>
        ))}
      </div>
    </button>
  )
}
