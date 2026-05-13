"use client"

import { useState, useEffect, useMemo } from "react"
import type { PokemonStat } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { useSort, SortTh } from "@/components/sort"

function PokemonGroup({ name, entries, pkmIndex }: { name: string; entries: PokemonStat[]; pkmIndex: Record<string, string> }) {
  const [sortKey, setSortKey] = useState<keyof PokemonStat>("avg_rank")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sorted = useMemo(() => {
    const copy = [...entries]
    copy.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      let cmp = 0
      if (typeof va === "string" && typeof vb === "string") cmp = va.localeCompare(vb)
      else if (typeof va === "number" && typeof vb === "number") cmp = va - vb
      return sortDir === "asc" ? cmp : -cmp
    })
    return copy
  }, [entries, sortKey, sortDir])

  function toggle(k: keyof PokemonStat) {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(k); setSortDir("asc") }
  }

  return (
    <details className="mb-3">
      <summary className="cursor-pointer text-lg font-semibold text-yellow-400 flex items-center gap-2">
        <PkmImg name={name} index={pkmIndex[name]} size={36} />
        {name}
      </summary>
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700">
              <SortTh sortKey="tier" currentKey={sortKey} currentDir={sortDir} onToggle={toggle} className="text-left pr-4">Tier</SortTh>
              <SortTh sortKey="avg_rank" currentKey={sortKey} currentDir={sortDir} onToggle={toggle} className="text-right pr-4">Avg Rank</SortTh>
              <SortTh sortKey="count" currentKey={sortKey} currentDir={sortDir} onToggle={toggle} className="text-right pr-4">Games</SortTh>
              <th className="text-left py-1 text-slate-500 hidden md:table-cell">Items</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <tr key={s.tier} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4">{s.tier}</td>
                <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
                <td className="text-right pr-4 tabular-nums text-slate-400">{s.count}</td>
                <td className="py-2 text-xs text-slate-400 hidden md:table-cell">
                  <div className="flex items-center gap-1 flex-wrap">
                    {s.items.slice(0, 8).map((item) => (
                      <span key={item} className="flex items-center gap-1 mr-2">
                        <ItemImg name={item} size={16} />
                        {item}
                      </span>
                    )) || "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

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
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
      />
      {[...grouped.entries()].map(([name, entries]) => (
        <PokemonGroup key={name} name={name} entries={entries} pkmIndex={pkmIndex} />
      ))}
      {query && filtered.length === 0 && <p className="text-slate-500">No matches.</p>}
    </div>
  )
}
