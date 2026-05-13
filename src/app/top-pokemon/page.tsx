"use client"

import { useState, useEffect, useMemo } from "react"
import type { PokemonStat } from "@/lib/api"
import { PkmImg } from "@/components/pkm-img"
import { useSort, SortTh } from "@/components/sort"

export default function TopPokemonPage() {
  const [stats, setStats] = useState<PokemonStat[]>([])
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [tier, setTier] = useState("ALL")
  const [minCount, setMinCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/top-pokemon").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([s, idx]) => {
      setStats(s)
      setPkmIndex(idx)
    }).finally(() => setLoading(false))
  }, [])

  const tiers = useMemo(() => {
    const s = new Set(stats.map((s) => s.tier))
    return ["ALL", ...s].sort()
  }, [stats])

  const aggregated = useMemo(() => {
    if (tier !== "ALL") {
      const f = stats.filter((s) => s.tier === tier)
      return f.map((s) => ({ ...s }))
    }
    const map = new Map<string, { count: number; rankSum: number; tier: string }>()
    for (const s of stats) {
      const e = map.get(s.pokemon) ?? { count: 0, rankSum: 0, tier: "ALL" }
      e.count += s.count
      e.rankSum += s.avg_rank * s.count
      map.set(s.pokemon, e)
    }
    return [...map.entries()]
      .filter(([, v]) => v.count >= minCount && v.count > 0)
      .map(([pokemon, v]) => ({
        pokemon,
        tier: "ALL" as const,
        avg_rank: +(v.rankSum / v.count).toFixed(2),
        count: v.count,
        items: [] as string[],
        item_count: 0,
      }))
  }, [stats, tier, minCount])

  const { sorted, toggle, key, dir } = useSort(aggregated, "avg_rank", "asc", { key: "count", dir: "desc" })

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Top Pokémon</h1>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {tiers.map((t) => (
            <button key={t} onClick={() => setTier(t)}
              className={`px-3 py-1 rounded-lg text-sm ${tier === t ? "bg-yellow-500 text-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >{t}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Min games:
          <input type="text" inputMode="numeric" value={minCount || ""} placeholder="500"
            onChange={(e) => setMinCount(Number(e.target.value) || 0)}
            className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 pr-4 text-slate-500">#</th>
              <th className="text-left py-2 pr-4 text-slate-500">Pokémon</th>
              <th className="text-left py-2 pr-4 text-slate-500">Tier</th>
              <SortTh sortKey="avg_rank" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Avg Rank</SortTh>
              <SortTh sortKey="count" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right">Games</SortTh>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={`${s.pokemon}-${s.tier}`} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                <td className="py-2 pr-4 font-medium flex items-center gap-2">
                  <PkmImg name={s.pokemon} index={pkmIndex[s.pokemon]} size={28} />
                  {s.pokemon}
                </td>
                <td className="py-2 pr-4 text-slate-400">{s.tier}</td>
                <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
                <td className="text-right tabular-nums text-slate-400">{s.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
