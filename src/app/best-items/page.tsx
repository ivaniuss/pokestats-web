"use client"

import { useState, useEffect, useMemo } from "react"
import type { ItemEntry } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"

type SortKey = "avg_rank" | "count" | "item"

export default function BestItemsPage() {
  const [recs, setRecs] = useState<Record<string, ItemEntry[]>>({})
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("avg_rank")
  const [sortAsc, setSortAsc] = useState(true)
  const [minCount, setMinCount] = useState(0)
  const [tierFilter, setTierFilter] = useState("ALL")

  useEffect(() => {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([data, idx]) => {
      setRecs(data)
      setPkmIndex(idx)
    }).finally(() => setLoading(false))
  }, [])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toUpperCase()
    return Object.keys(recs)
      .filter((k) => k.includes(q))
      .sort((a, b) => a.indexOf(q) - b.indexOf(q) || a.localeCompare(b))
      .slice(0, 15)
  }, [query, recs])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key !== "count") }
  }

  if (loading) return <div className="text-slate-400">Loading data...</div>

  const data = selected ? recs[selected] ?? [] : []
  const tiers = [...new Set(data.map((i) => i.tier))].sort()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Best Items</h1>

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
              <button
                key={s}
                className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                onClick={() => { setSelected(s); setQuery(s) }}
              >
                <PkmImg name={s} index={pkmIndex[s]} size={32} />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <PkmImg name={selected} index={pkmIndex[selected]} size={48} />
              <h2 className="text-xl font-semibold text-yellow-400">{selected}</h2>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400">
              Min count:
              <input
                type="text"
                inputMode="numeric"
                value={minCount || ""}
                placeholder="0"
                onChange={(e) => setMinCount(Number(e.target.value) || 0)}
                className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white"
              />
            </label>
            <select
              className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
            >
              <option value="ALL">All tiers</option>
              {tiers.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </div>

          <details open className="mb-4">
            <summary className="cursor-pointer text-sm text-slate-400 mb-2">
              {tierFilter === "ALL" ? "Aggregated (all tiers)" : tierFilter}
            </summary>
            <ItemsTable
              items={tierFilter === "ALL" ? aggregateItems(data) : data.filter((i) => i.tier === tierFilter)}
              sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} minCount={minCount}
            />
          </details>
        </div>
      )}
    </div>
  )
}

function aggregateItems(items: ItemEntry[]) {
  const map = new Map<string, { count: number; rankSum: number; tiers: Set<string> }>()
  for (const i of items) {
    const e = map.get(i.item) ?? { count: 0, rankSum: 0, tiers: new Set() }
    e.count += i.count
    e.rankSum += i.avg_rank * i.count
    e.tiers.add(i.tier)
    map.set(i.item, e)
  }
  return [...map.entries()].map(([item, v]) => ({
    item, avg_rank: +(v.rankSum / v.count).toFixed(2), count: v.count, tiers: [...v.tiers].sort().join(", "),
  }))
}

function ItemsTable({ items, sortKey, sortAsc, onSort, minCount }: {
  items: { item: string; avg_rank: number; count: number; tiers?: string }[]
  sortKey: SortKey; sortAsc: boolean; onSort: (k: SortKey) => void; minCount: number
}) {
  const filtered = useMemo(() => {
    const f = items.filter((i) => i.count >= minCount)
    f.sort((a, b) => {
      let cmp: number
      if (sortKey === "item") cmp = a.item.localeCompare(b.item)
      else if (sortKey === "count") cmp = a.count - b.count
      else cmp = a.avg_rank - b.avg_rank
      return sortAsc ? cmp : -cmp
    })
    return f
  }, [items, sortKey, sortAsc, minCount])

  function Th({ sort, children }: { sort: SortKey; children: React.ReactNode }) {
    const active = sortKey === sort
    return (
      <th className={`text-left py-2 pr-4 cursor-pointer select-none ${active ? "text-yellow-400" : "text-slate-500"} hover:text-white transition-colors`}
        onClick={() => onSort(sort)}
      >{children} {active ? (sortAsc ? "▲" : "▼") : ""}</th>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-700">
          <Th sort="item">Item</Th>
          <Th sort="avg_rank">Avg Rank</Th>
          <Th sort="count">Count</Th>
          {items[0]?.tiers !== undefined && <th className="text-left py-2 text-slate-500">Tiers</th>}
        </tr>
      </thead>
      <tbody>
        {filtered.map((i) => (
          <tr key={i.item} className="border-b border-slate-800 hover:bg-slate-800/50">
            <td className="py-2 pr-4 font-medium flex items-center gap-2">
              <ItemImg name={i.item} size={24} />
              {i.item}
            </td>
            <td className="text-right pr-4 tabular-nums">{i.avg_rank.toFixed(2)}</td>
            <td className="text-right pr-4 tabular-nums text-slate-400">{i.count}</td>
            {i.tiers !== undefined && <td className="py-2 text-slate-500 text-xs">{i.tiers}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}


