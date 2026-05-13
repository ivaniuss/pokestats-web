"use client"

import { useState, useEffect } from "react"
import type { Region } from "@/lib/api"
import { useSort, SortTh } from "@/components/sort"

export default function RegionsPage() {
  const [data, setData] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/regions").then((r) => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const { sorted, toggle, key, dir } = useSort(data, "rank", "asc")

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Regions</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 pr-4 text-slate-500">#</th>
              <SortTh sortKey="name" currentKey={key} currentDir={dir} onToggle={toggle} className="text-left pr-4">Region</SortTh>
              <SortTh sortKey="rank" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Avg Rank</SortTh>
              <SortTh sortKey="count" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Count</SortTh>
              <SortTh sortKey="elo" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4 hidden md:table-cell">Avg Elo</SortTh>
              <th className="text-left py-2 text-slate-500 hidden md:table-cell">Pokémon</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr key={r.name} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4 text-slate-500">{i + 1}</td>
                <td className="py-2 pr-4 font-medium">{r.name}</td>
                <td className="text-right pr-4 tabular-nums">{r.rank.toFixed(2)}</td>
                <td className="text-right pr-4 tabular-nums text-slate-400">{r.count}</td>
                <td className="text-right pr-4 tabular-nums text-slate-400 hidden md:table-cell">{r.elo.toFixed(0)}</td>
                <td className="py-2 text-xs text-slate-500 hidden md:table-cell">{r.pokemons?.slice(0, 4).join(", ") || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
