"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import type { ItemEntry, PokemonStat } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { SortTh } from "@/components/sort"
import { pkmIndex } from "@/lib/pkm-index"
import { getEvolutionInfo } from "@/lib/evolutions"

type GroupSortKey = Extract<keyof PokemonStat, "tier" | "avg_rank" | "count">

function PokemonGroup({ name, entries, recs, craftable, registerRef }: {
  name: string
  entries: PokemonStat[]
  recs: Record<string, ItemEntry[]>
  craftable: Set<string>
  registerRef: (name: string, el: HTMLDetailsElement | null) => void
}) {
  const [sortKey, setSortKey] = useState<GroupSortKey>("avg_rank")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  const sorted = useMemo(() => {
    const copy = [...entries]
    copy.sort((a, b) => {
      const va = a[sortKey]
      const vb = b[sortKey]
      let cmp = 0
      if (typeof va === "string" && typeof vb === "string") cmp = va.localeCompare(vb)
      else if (typeof va === "number" && typeof vb === "number") cmp = va - vb
      cmp = sortDir === "asc" ? cmp : -cmp
      if (cmp === 0 && sortKey !== "count") cmp = b.count - a.count
      return cmp
    })
    return copy
  }, [entries, sortKey, sortDir])

  function toggle(k: GroupSortKey) {
    if (k === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc")
    else { setSortKey(k); setSortDir(k === "count" ? "desc" : "asc") }
  }

  const evo = getEvolutionInfo(name)

  return (
    <div className="mb-3 flex items-start gap-2">
      <details className="flex-1" ref={(el) => registerRef(name, el)}>
        <summary className="cursor-pointer text-lg font-semibold text-yellow-400 flex items-center gap-2">
          <PkmImg name={name} index={pkmIndex[name]} size={36} />
          {name}
        </summary>
        {evo && (
          <div className="mt-2 mb-2 flex items-center gap-2 text-xs border border-yellow-500/20 bg-yellow-500/10 rounded-lg px-2 py-1">
            <ItemImg name={evo.item} size={16} />
            <span className="text-slate-300">
              Evolves to <Link href={`/pokemon/${evo.to.toLowerCase()}`} className="text-yellow-400 hover:underline">{evo.to}</Link> with {evo.item}
            </span>
          </div>
        )}
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
            {sorted.map((s) => {
              const best = (recs[name] ?? [])
                .filter((r) => r.tier === s.tier && craftable.has(r.item))
                .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
                .slice(0, 3)
                .map((r) => r.item)
              const display =
                best.length >= 3
                  ? best
                  : [...best, ...s.items.filter((it) => craftable.has(it) && !best.includes(it))].slice(0, 3)
              return (
                <tr key={s.tier} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-2 pr-4">{s.tier}</td>
                  <td className="text-right pr-4 tabular-nums">{s.avg_rank.toFixed(2)}</td>
                  <td className="text-right pr-4 tabular-nums text-slate-400">{s.count}</td>
                  <td className="py-2 text-xs text-slate-400 hidden md:table-cell">
                    <div className="flex items-center gap-1 flex-wrap">
                      {display.length > 0
                        ? display.map((item) => (
                            <span key={item} className="flex items-center gap-1 mr-2">
                              <ItemImg name={item} size={16} />
                              {item}
                            </span>
                          ))
                        : "—"}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      </details>
      <Link
        href={`/pokemon/${name.toLowerCase()}`}
        className="shrink-0 mt-2 text-xs text-slate-500 hover:text-yellow-400"
      >
        View →
      </Link>
    </div>
  )
}

export default function PokemonSearch({ stats, recs, craftable }: { stats: PokemonStat[]; recs: Record<string, ItemEntry[]>; craftable: Set<string> }) {
  const [query, setQuery] = useState("")
  const detailsRefs = useRef<Map<string, HTMLDetailsElement>>(new Map())

  function registerRef(name: string, el: HTMLDetailsElement | null) {
    if (el) detailsRefs.current.set(name, el)
    else detailsRefs.current.delete(name)
  }

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

  return (
    <>
      <input
        className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 mb-6"
        placeholder="Search Pokémon..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && grouped.size > 0) {
            const first = [...grouped.keys()][0]
            const el = detailsRefs.current.get(first)
            if (el) el.open = !el.open
          }
        }}
      />
      {[...grouped.entries()].map(([name, entries]) => (
        <PokemonGroup key={name} name={name} entries={entries} recs={recs} craftable={craftable} registerRef={registerRef} />
      ))}
      {query && filtered.length === 0 && <p className="text-slate-500">No matches.</p>}
    </>
  )
}
