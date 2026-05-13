"use client"

import { useState, useEffect, useMemo } from "react"
import type { Region } from "@/lib/api"

export default function RegionsPage() {
  const [data, setData] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/regions")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const sorted = useMemo(() => data.sort((a, b) => a.rank - b.rank), [data])

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Regions</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 border-b border-slate-700">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Region</th>
            <th className="text-right py-2 pr-4">Avg Rank</th>
            <th className="text-right py-2 pr-4">Count</th>
            <th className="text-right py-2 pr-4">Avg Elo</th>
            <th className="text-left py-2">Pokémon</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.name} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
              <td className="py-2 pr-4 font-medium">{r.name}</td>
              <td className="text-right pr-4 tabular-nums">{r.rank.toFixed(2)}</td>
              <td className="text-right pr-4 tabular-nums text-slate-400">{r.count}</td>
              <td className="text-right pr-4 tabular-nums text-slate-400">{r.elo.toFixed(0)}</td>
              <td className="py-2 text-xs text-slate-500">{r.pokemons?.slice(0, 4).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
