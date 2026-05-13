"use client"

import { useState, useEffect, useMemo } from "react"
import { PkmImg, ItemImg } from "@/components/pkm-img"

type MergedPkm = {
  pokemon: string
  items: Record<string, { games: number; tiers: string[]; avg_rank: number }>
  tiers: Record<string, { avg_rank: number; games: number; items: string[] }>
}

export default function PokemonPage() {
  const [data, setData] = useState<Record<string, MergedPkm>>({})
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/pokemon").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([d, idx]) => {
      setData(d)
      setPkmIndex(idx)
    }).finally(() => setLoading(false))
  }, [])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toUpperCase()
    return Object.keys(data)
      .filter((k) => k.includes(q))
      .sort((a, b) => a.indexOf(q) - b.indexOf(q) || a.localeCompare(b))
      .slice(0, 15)
  }, [query, data])

  if (loading) return <div className="text-slate-400">Loading data...</div>

  const pkm = selected ? data[selected] : null

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon</h1>

      <div className="relative mb-6">
        <input
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
          placeholder="Search Pokémon..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && suggestions.length > 0) {
              setSelected(suggestions[0])
              setQuery(suggestions[0])
            }
          }}
        />
        {suggestions.length > 0 && !selected && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-60 overflow-y-auto z-10">
            {suggestions.map((s) => (
              <button key={s} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                onClick={() => { setSelected(s); setQuery(s) }}
              >
                <PkmImg name={s} index={pkmIndex[s]} size={32} />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {pkm && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <PkmImg name={pkm.pokemon} index={pkmIndex[pkm.pokemon]} size={56} />
            <div>
              <h2 className="text-2xl font-bold text-yellow-400">{pkm.pokemon}</h2>
              <p className="text-sm text-slate-500">Items used on this Pokémon &mdash; ranked by global performance</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-3">Items</h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Item</th>
                  <th className="text-right py-2 pr-4">Global Rank</th>
                  <th className="text-right py-2 pr-4">Games</th>
                  <th className="text-left py-2">Tiers</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pkm.items)
                  .filter(([, v]) => v.avg_rank > 0)
                  .sort((a, b) => a[1].avg_rank - b[1].avg_rank || b[1].games - a[1].games)
                  .map(([item, info]) => (
                    <tr key={item} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-2 pr-4 font-medium flex items-center gap-2">
                        <ItemImg name={item} size={24} />
                        {item}
                      </td>
                      <td className="text-right pr-4 tabular-nums">{info.avg_rank.toFixed(2)}</td>
                      <td className="text-right pr-4 tabular-nums text-slate-400">{info.games}</td>
                      <td className="py-2 text-xs text-slate-500">{[...new Set(info.tiers)].sort().join(", ")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold mb-3">Per-tier stats</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2 pr-4">Tier</th>
                  <th className="text-right py-2 pr-4">Avg Rank</th>
                  <th className="text-right py-2 pr-4">Games</th>
                  <th className="text-left py-2">Items</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(pkm.tiers)
                  .filter(([, t]) => t.games > 0 && t.avg_rank > 0)
                  .sort((a, b) => a[1].avg_rank - b[1].avg_rank)
                  .map(([tier, info]) => (
                    <tr key={tier} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-2 pr-4">{tier}</td>
                      <td className="text-right pr-4 tabular-nums">{info.avg_rank.toFixed(2)}</td>
                      <td className="text-right pr-4 tabular-nums text-slate-400">{info.games}</td>
                      <td className="py-2 text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                        {info.items.slice(0, 6).map((item) => (
                          <span key={item} className="flex items-center gap-1 mr-2">
                            <ItemImg name={item} size={16} />
                            {item}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
