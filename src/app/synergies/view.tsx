"use client"

import { useState } from "react"
import Link from "next/link"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { pkmIndex } from "@/lib/pkm-index"

type ItemRec = { item: string; avg_rank: number; count: number; recipe?: [string, string] }
type SynergyData = Record<
  string,
  { items: ItemRec[]; uniqueItems: ItemRec[]; legendaryItems: ItemRec[]; pokemons: string[]; uniques: string[]; legendaries: string[] }
>

export default function SynergyView({ data }: { data: SynergyData }) {
  const synergies = Object.keys(data).sort()
  const [selected, setSelected] = useState(synergies.includes("WATER") ? "WATER" : synergies[0])
  const entry = data[selected]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {synergies.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border ${
              selected === s
                ? "bg-yellow-500 text-black border-yellow-500"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {!entry || entry.items.length === 0 ? (
        <p className="text-slate-500 text-sm">No item data for this synergy yet.</p>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-slate-300 mb-2">Best items for {selected} — carries (unique/legendary/epic/ultra)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {entry.items.map((it) => (
              <div key={it.item} className="border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <ItemImg name={it.item} size={28} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{it.item}</p>
                    <p className="text-xs text-slate-400">avg {it.avg_rank.toFixed(2)} · {it.count.toLocaleString()} games</p>
                  </div>
                </div>
                {it.recipe && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <span>from</span> <ItemImg name={it.recipe[0]} size={14} /> {it.recipe[0]} <span>+</span> <ItemImg name={it.recipe[1]} size={14} /> {it.recipe[1]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {entry.uniqueItems.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">For Uniques — tank ({entry.uniques.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {entry.uniqueItems.slice(0, 4).map((it) => (
                  <div key={it.item} className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-3 flex items-center gap-3">
                    <ItemImg name={it.item} size={24} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{it.item}</p>
                      <p className="text-xs text-slate-400">avg {it.avg_rank.toFixed(2)} · {it.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {entry.legendaryItems.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-sky-400 mb-2">For Legendaries — DPS ({entry.legendaries.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {entry.legendaryItems.slice(0, 4).map((it) => (
                  <div key={it.item} className="border border-sky-500/20 bg-sky-500/5 rounded-xl p-3 flex items-center gap-3">
                    <ItemImg name={it.item} size={24} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{it.item}</p>
                      <p className="text-xs text-slate-400">avg {it.avg_rank.toFixed(2)} · {it.count.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <h3 className="text-sm font-semibold text-slate-300 mb-2">Pokémon in this synergy ({entry.pokemons.length})</h3>
          <div className="flex flex-wrap gap-2">
            {entry.pokemons.slice(0, 24).map((p) => (
              <Link
                key={p}
                href={`/pokemon/${p.toLowerCase()}`}
                className="flex items-center gap-1.5 border border-slate-700 rounded-full px-2 py-1 hover:border-yellow-500/50 hover:bg-slate-800/50"
              >
                <PkmImg name={p} index={pkmIndex[p]} size={20} />
                <span className="text-xs text-slate-300">{p}</span>
              </Link>
            ))}
          </div>
          {entry.pokemons.length > 24 && (
            <p className="text-xs text-slate-500 mt-2">+ {entry.pokemons.length - 24} more — search them in /pokemon</p>
          )}
        </>
      )}
    </div>
  )
}
