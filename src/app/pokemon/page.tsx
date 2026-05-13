"use client"

import { useState, useEffect, useMemo } from "react"
import type { PokemonStat } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"

export default function PokemonPage() {
  const [stats, setStats] = useState<PokemonStat[]>([])
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/pokemon").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([s, idx]) => {
      setStats(s)
      setPkmIndex(idx)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toUpperCase().replace(/ /g, "_")
    return stats.filter((s) => s.pokemon.includes(q)).sort((a, b) => a.pokemon.localeCompare(b.pokemon)).slice(0, 50)
  }, [query, stats])

  const grouped = useMemo(() => {
    const map = new Map<string, PokemonStat[]>()
    for (const s of filtered) {
      if (!map.has(s.pokemon)) map.set(s.pokemon, [])
      map.get(s.pokemon)!.push(s)
    }
    return map
  }, [filtered])

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon Stats</h1>
      <input
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 mb-6"
        placeholder="Search Pokémon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {[...grouped.entries()].map(([name, entries]) => (
        <details key={name} className="mb-3">
          <summary className="cursor-pointer text-lg font-semibold text-yellow-400 flex items-center gap-2">
            <PkmImg name={name} index={pkmIndex[name]} size={36} />
            {name}
          </summary>
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700">
                <th className="text-left py-1 pr-4">Tier</th>
                <th className="text-right py-1 pr-4">Avg Rank</th>
                <th className="text-right py-1 pr-4">Games</th>
                <th className="text-left py-1">Items</th>
              </tr>
            </thead>
            <tbody>
              {entries.sort((a, b) => a.avg_rank - b.avg_rank).map((s) => (
                <tr key={s.tier} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 pr-4">{s.tier}</td>
                  <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
                  <td className="text-right pr-4 tabular-nums text-slate-400">{s.count}</td>
                  <td className="py-2 text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                    {s.items.slice(0, 8).map((item) => (
                      <span key={item} className="flex items-center gap-1 mr-2">
                        <ItemImg name={item} size={16} />
                        {item}
                      </span>
                    )) || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
      {query && filtered.length === 0 && <p className="text-slate-500">No matches.</p>}
    </div>
  )
}


