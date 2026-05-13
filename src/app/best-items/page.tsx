"use client"

import { useState, useEffect, useMemo } from "react"
import type { ItemEntry } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"

type SortKey = "avg_rank" | "count"
type SearchMode = "pokemon" | "item"

export default function BestItemsPage() {
  const [recs, setRecs] = useState<Record<string, ItemEntry[]>>({})
  const [pkmIndex, setPkmIndex] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<SearchMode>("pokemon")
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("avg_rank")
  const [sortAsc, setSortAsc] = useState(true)
  const [minCount, setMinCount] = useState(0)
  const [tierFilter, setTierFilter] = useState("ALL")

  // item → { tiers, avg_rank, count, pokemons }
  const [itemMap, setItemMap] = useState<Record<string, {
    tiers: Record<string, { avg_rank: number; count: number; pokemons: string[] }>
    totalCount: number; totalRank: number
  }>>({})

  useEffect(() => {
    Promise.all([
      fetch("/api/items").then((r) => r.json()),
      fetch("/assets/pkm-index.json").then((r) => r.json()),
    ]).then(([data, idx]) => {
      setRecs(data)
      setPkmIndex(idx)

      const inv: Record<string, any> = {}
      for (const [pkm, entries] of Object.entries<ItemEntry[]>(data)) {
        for (const e of entries) {
          if (!inv[e.item]) inv[e.item] = { tiers: {}, totalCount: 0, totalRank: 0 }
          if (!inv[e.item].tiers[e.tier]) inv[e.item].tiers[e.tier] = { avg_rank: 0, count: 0, pokemons: [] }
          inv[e.item].tiers[e.tier].pokemons.push(pkm)
          inv[e.item].tiers[e.tier].avg_rank = e.avg_rank
          inv[e.item].tiers[e.tier].count = e.count
          inv[e.item].totalCount += e.count
          inv[e.item].totalRank += e.avg_rank * e.count
        }
      }
      setItemMap(inv)
    }).finally(() => setLoading(false))
  }, [])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toUpperCase()
    const keys = mode === "pokemon" ? Object.keys(recs) : Object.keys(itemMap)
    return keys.filter((k) => k.includes(q)).sort((a, b) => a.indexOf(q) - b.indexOf(q) || a.localeCompare(b)).slice(0, 15)
  }, [query, recs, itemMap, mode])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(key !== "count") }
  }

  if (loading) return <div className="text-slate-400">Loading data...</div>

  const isPkm = mode === "pokemon"
  const tiers = selected ? Object.keys(isPkm
    ? Object.fromEntries((recs[selected] ?? []).map((i) => [i.tier, true]))
    : (itemMap[selected]?.tiers ?? {})
  ).sort() : []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Best Items</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode("pokemon"); setSelected(null); setQuery("") }}
          className={`px-3 py-1 rounded-lg text-sm ${mode === "pokemon" ? "bg-yellow-500 text-black" : "bg-slate-800 text-slate-300"}`}>Pokémon</button>
        <button onClick={() => { setMode("item"); setSelected(null); setQuery("") }}
          className={`px-3 py-1 rounded-lg text-sm ${mode === "item" ? "bg-yellow-500 text-black" : "bg-slate-800 text-slate-300"}`}>Item</button>
      </div>

      <div className="relative mb-6">
        <input className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400"
          placeholder={isPkm ? "Search Pokémon..." : "Search item..."}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
          onKeyDown={(e) => { if (e.key === "Enter" && suggestions.length > 0) { setSelected(suggestions[0]); setQuery(suggestions[0]) } }}
        />
        {suggestions.length > 0 && !selected && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg max-h-60 overflow-y-auto z-10">
            {suggestions.map((s) => (
              <button key={s} className="w-full text-left px-4 py-2 hover:bg-slate-700 text-sm flex items-center gap-2"
                onClick={() => { setSelected(s); setQuery(s) }}
              >
                {isPkm ? <PkmImg name={s} index={pkmIndex[s]} size={32} /> : <ItemImg name={s} size={24} />}
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && isPkm && <PkmView selected={selected} data={recs[selected] ?? []} pkmIndex={pkmIndex}
        sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} minCount={minCount} tierFilter={tierFilter} tiers={tiers}
        onTierChange={setTierFilter} onMinCountChange={setMinCount} />}

      {selected && !isPkm && <ItemView selected={selected} data={itemMap[selected]}
        sortKey={sortKey} sortAsc={sortAsc} onSort={toggleSort} minCount={minCount} tierFilter={tierFilter} tiers={tiers}
        onTierChange={setTierFilter} onMinCountChange={setMinCount} pkmIndex={pkmIndex} />}
    </div>
  )
}

function PkmView({ selected, data, pkmIndex, sortKey, sortAsc, onSort, minCount, tierFilter, tiers, onTierChange, onMinCountChange }: any) {
  const agg = useMemo(() => {
    const map = new Map<string, { count: number; rankSum: number; tiers: Set<string> }>()
    for (const i of data) {
      const e = map.get(i.item) ?? { count: 0, rankSum: 0, tiers: new Set() }
      e.count += i.count; e.rankSum += i.avg_rank * i.count; e.tiers.add(i.tier)
      map.set(i.item, e)
    }
    return [...map.entries()].filter(([, v]) => v.count > 0).map(([item, v]) => ({
      item, avg_rank: +(v.rankSum / v.count).toFixed(2), count: v.count, tiers: [...v.tiers].sort().join(", "),
    }))
  }, [data])

  const items = tierFilter === "ALL" ? agg : data.filter((i: any) => i.tier === tierFilter)
  const show = useMemo(() => {
    const f = items.filter((i: any) => i.count >= minCount && !isNaN(i.avg_rank))
    f.sort((a: any, b: any) => { const c = sortKey === "count" ? a.count - b.count : a.avg_rank - b.avg_rank; return sortAsc ? c : -c })
    return f
  }, [items, sortKey, sortAsc, minCount])

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <PkmImg name={selected} index={pkmIndex[selected]} size={48} />
          <h2 className="text-xl font-semibold text-yellow-400">{selected}</h2>
        </div>
        <Filters minCount={minCount} onMinCount={onMinCountChange} tierFilter={tierFilter} tiers={tiers} onTier={onTierChange} />
      </div>
      <details open className="mb-4">
        <summary className="cursor-pointer text-sm text-slate-400 mb-2">{tierFilter === "ALL" ? "Items used on this Pokémon" : tierFilter}</summary>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-700">
            <th className="text-left py-2 text-slate-500">Item</th>
            <Th sort="avg_rank" label="Avg Rank" sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <Th sort="count" label="Count" sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <th className="text-left py-2 text-slate-500">Tiers</th>
          </tr></thead>
          <tbody>{show.map((i: any) => (
            <tr key={i.item} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="py-2 pr-4 font-medium flex items-center gap-2"><ItemImg name={i.item} size={24} />{i.item}</td>
              <td className="text-right pr-4 tabular-nums">{i.avg_rank.toFixed(2)}</td>
              <td className="text-right pr-4 tabular-nums text-slate-400">{i.count}</td>
              <td className="py-2 text-slate-500 text-xs">{i.tiers}</td>
            </tr>
          ))}</tbody>
        </table>
      </details>
    </div>
  )
}

function ItemView({ selected, data, sortKey, sortAsc, onSort, minCount, tierFilter, tiers, onTierChange, onMinCountChange, pkmIndex }: any) {
  const tierData = tierFilter === "ALL" ? Object.entries(data.tiers) : Object.entries(data.tiers).filter(([t]) => t === tierFilter)
  const show = useMemo(() => {
    const f = tierData.filter(([, v]: any) => v.count >= minCount)
    f.sort((a: any, b: any) => {
      const c = sortKey === "count" ? a[1].count - b[1].count : a[1].avg_rank - b[1].avg_rank
      return sortAsc ? c : -c
    })
    return f
  }, [tierData, sortKey, sortAsc, minCount])

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ItemImg name={selected} size={32} />
          <h2 className="text-xl font-semibold text-yellow-400">{selected}</h2>
        </div>
        <Filters minCount={minCount} onMinCount={onMinCountChange} tierFilter={tierFilter} tiers={tiers} onTier={onTierChange} />
      </div>
      <details open className="mb-4">
        <summary className="cursor-pointer text-sm text-slate-400 mb-2">{tierFilter === "ALL" ? "Pokémon that use this item" : tierFilter}</summary>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-700">
            <th className="text-left py-2 text-slate-500">Tier</th>
            <Th sort="avg_rank" label="Avg Rank" sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <Th sort="count" label="Count" sortKey={sortKey} sortAsc={sortAsc} onSort={onSort} />
            <th className="text-left py-2 text-slate-500">Pokémon</th>
          </tr></thead>
          <tbody>{show.map(([tier, info]: any) => (
            <tr key={tier} className="border-b border-slate-800 hover:bg-slate-800/50">
              <td className="py-2 pr-4">{tier}</td>
              <td className="text-right pr-4 tabular-nums">{info.avg_rank.toFixed(2)}</td>
              <td className="text-right pr-4 tabular-nums text-slate-400">{info.count}</td>
              <td className="py-2 text-xs text-slate-400 flex items-center gap-1 flex-wrap">
                {info.pokemons.slice(0, 10).map((p: string) => (
                  <span key={p} className="flex items-center gap-1 mr-2"><PkmImg name={p} index={pkmIndex[p]} size={18} />{p}</span>
                ))}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </details>
    </div>
  )
}

function Filters({ minCount, onMinCount, tierFilter, tiers, onTier }: any) {
  return <>
    <label className="flex items-center gap-2 text-sm text-slate-400">
      Min count:
      <input type="text" inputMode="numeric" value={minCount || ""} placeholder="0"
        onChange={(e) => onMinCount(Number(e.target.value) || 0)}
        className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white" />
    </label>
    <select className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
      value={tierFilter} onChange={(e) => onTier(e.target.value)}>
      <option value="ALL">All tiers</option>
      {tiers.map((t: string) => (<option key={t} value={t}>{t}</option>))}
    </select>
  </>
}

function Th({ sort, label, sortKey, sortAsc, onSort }: any) {
  const active = sortKey === sort
  return (
    <th className={`text-left py-2 pr-4 cursor-pointer select-none ${active ? "text-yellow-400" : "text-slate-500"} hover:text-white transition-colors`}
      onClick={() => onSort(sort)}>
      {label} {active ? (sortAsc ? "▲" : "▼") : ""}
    </th>
  )
}
