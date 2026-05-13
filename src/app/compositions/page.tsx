"use client"

import { useState, useEffect, useMemo } from "react"
import type { Composition } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { useSort, SortTh } from "@/components/sort"

export default function CompositionsPage() {
  const [data, setData] = useState<Composition[]>([])
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/compositions").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([d, idx]) => {
      setData(d)
      setPkmIndex(idx)
    }).finally(() => setLoading(false))
  }, [])

  const { sorted, toggle, key, dir } = useSort(data, "mean_rank", "asc", { key: "count", dir: "desc" })

  if (loading) return <div className="text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Team Compositions</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 pr-4 text-slate-500">ID</th>
              <SortTh sortKey="mean_rank" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Avg Rank</SortTh>
              <SortTh sortKey="winrate" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Winrate</SortTh>
              <SortTh sortKey="count" currentKey={key} currentDir={dir} onToggle={toggle} className="text-right pr-4">Count</SortTh>
              <th className="text-left py-2 pr-4 text-slate-500 hidden md:table-cell">Synergies</th>
              <th className="text-left py-2 text-slate-500 hidden md:table-cell">Core</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr key={c.cluster_id}
                className={`border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer ${selectedId === c.cluster_id ? "bg-slate-800" : ""}`}
                onClick={() => setSelectedId(selectedId === c.cluster_id ? null : c.cluster_id)}
              >
                <td className="py-2 pr-4 text-slate-500">{c.cluster_id}</td>
                <td className="text-right pr-4 tabular-nums">{c.mean_rank.toFixed(2)}</td>
                <td className="text-right pr-4 tabular-nums text-green-400">{c.winrate.toFixed(1)}%</td>
                <td className="text-right pr-4 tabular-nums text-slate-400">{c.count}</td>
                <td className="py-2 pr-4 text-xs hidden md:table-cell">
                  {Object.entries(c.synergies || {}).map(([k, v]) => (
                    <span key={k} className="mr-2">{k}:{v}</span>
                  ))}
                </td>
                <td className="py-2 text-xs text-slate-400 hidden md:table-cell">
                  {Object.entries(c.mean_team?.pokemons || {}).sort(([, a], [, b]) => b.frequency - a.frequency).slice(0, 4).map(([p]) => p).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (() => {
        const c = data.find((d) => d.cluster_id === selectedId)
        if (!c) return null
        return (
          <div className="mt-6 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold text-yellow-400 mb-3">Cluster {c.cluster_id} — Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-700">
                    <th className="text-left py-1 pr-4">Pokémon</th>
                    <th className="text-right py-1 pr-4">Freq</th>
                    <th className="text-left py-1">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(c.mean_team?.pokemons || {}).sort(([, a], [, b]) => b.frequency - a.frequency).map(([pkm, info]) => (
                    <tr key={pkm} className="border-b border-slate-800">
                      <td className="py-2 pr-4 font-medium flex items-center gap-2">
                        <PkmImg name={pkm} index={pkmIndex[pkm]} size={28} />
                        {pkm}
                      </td>
                      <td className="text-right pr-4 tabular-nums text-slate-400">{(info.frequency * 100).toFixed(0)}%</td>
                      <td className="py-2 text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                        {info.items?.map((item) => (
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
            </div>
          </div>
        )
      })()}
    </div>
  )
}
