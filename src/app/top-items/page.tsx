"use client"

import { useState, useEffect, useMemo } from "react"
import type { ItemStat } from "@/lib/api"
import { ItemImg } from "@/components/pkm-img"

export default function TopItemsPage() {
  const [stats, setStats] = useState<ItemStat[]>([])
  const [tier, setTier] = useState("ALL")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/top-items").then((r) => r.json()).then(setStats).finally(() => setLoading(false))
  }, [])

  const tiers = useMemo(() => {
    const s = new Set(stats.map((s) => s.tier))
    return ["ALL", ...s].sort()
  }, [stats])

  const filtered = useMemo(() => {
    const f = tier === "ALL" ? stats : stats.filter((s) => s.tier === tier)
    return f.sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count).slice(0, 30)
  }, [stats, tier])

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Top Items</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tiers.map((t) => (
          <button key={t} onClick={() => setTier(t)}
            className={`px-3 py-1 rounded-lg text-sm ${tier === t ? "bg-yellow-500 text-black" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
          >{t}</button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 border-b border-slate-700">
            <th className="text-left py-2 pr-4">#</th>
            <th className="text-left py-2 pr-4">Item</th>
            <th className="text-left py-2 pr-4">Tier</th>
            <th className="text-right py-2 pr-4">Avg Rank</th>
            <th className="text-right py-2 pr-4">Count</th>
            <th className="text-left py-2">Pokémon</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s, i) => (
            <tr key={`${s.item}-${s.tier}`} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
              <td className="py-2 pr-4 font-medium flex items-center gap-2">
                <ItemImg name={s.item} size={24} />
                {s.item}
              </td>
              <td className="py-2 pr-4 text-slate-400">{s.tier}</td>
              <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
              <td className="text-right pr-4 tabular-nums text-slate-400">{s.count}</td>
              <td className="py-2 text-xs text-slate-500">{s.pokemons.slice(0, 4).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


