"use client"

import { useState, useEffect, useMemo } from "react"
import type { ItemStat } from "@/lib/api"
import { ItemImg } from "@/components/pkm-img"
import { useSort, SortTh } from "@/components/sort"

export default function TopItemsPage() {
  const [stats, setStats] = useState<ItemStat[]>([])
  const [tier, setTier] = useState("ALL")
  const [minCount, setMinCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/top-items").then((r) => r.json()).then(setStats).finally(() => setLoading(false))
  }, [])

  const tiers = useMemo(() => {
    const s = new Set(stats.map((s) => s.tier))
    return ["ALL", ...s].sort()
  }, [stats])

  const aggregated = useMemo(() => {
    if (tier !== "ALL") {
      return stats.filter((s) => s.tier === tier)
    }
    const map = new Map<string, { count: number; rankSum: number; tier: string; pokemons: string[] }>()
    for (const s of stats) {
      const e = map.get(s.item) ?? { count: 0, rankSum: 0, tier: "ALL", pokemons: [] }
      e.count += s.count
      e.rankSum += s.avg_rank * s.count
      e.pokemons = [...new Set([...e.pokemons, ...s.pokemons])]
      map.set(s.item, e)
    }
    return [...map.entries()]
      .filter(([, v]) => v.count >= minCount && v.count > 0 && v.rankSum > 0)
      .map(([item, v]) => ({
        item,
        tier: "ALL" as const,
        avg_rank: +(v.rankSum / v.count).toFixed(2),
        count: v.count,
        pokemons: v.pokemons,
      }))
  }, [stats, tier, minCount])

  const { sorted, toggle, key, dir } = useSort(aggregated, "avg_rank", "asc", { key: "count", dir: "desc" })

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Top Items</h1>
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
              <SortTh sortKey="item" currentKey={key} currentDir={dir} onToggle={toggle} className="text-left pr-4">Item</SortTh>
              <th className="text-left py-2 pr-4 text-slate-500">Tier</th>
              <SortTh sortKey="avg_rank" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Avg Rank</SortTh>
              <SortTh sortKey="count" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Count</SortTh>
              <th className="text-left py-2 text-slate-500 hidden md:table-cell">Pokémon</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={`${s.item}-${s.tier}`} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                <td className="py-2 pr-4 font-medium flex items-center gap-2">
                  <ItemImg name={s.item} size={24} />
                  {s.item}
                </td>
                <td className="py-2 pr-4 text-slate-400">{s.tier}</td>
                <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
                <td className="text-right pr-4 tabular-nums text-slate-400">{s.count}</td>
                <td className="py-2 text-xs text-slate-500 hidden md:table-cell">{s.pokemons.slice(0, 4).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
