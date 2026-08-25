import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchPokemonStats, fetchPokemonItemRecs, type PokemonStat } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { pkmIndex } from "@/lib/pkm-index"
import { getEvolutionInfo, getPreEvolution, getRelatedForms } from "@/lib/evolutions"

interface PageProps {
  params: Promise<{ name: string }>
}

function getEntries(stats: PokemonStat[], name: string) {
  return stats.filter((s) => s.pokemon === name)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name: raw } = await params
  const name = decodeURIComponent(raw).toUpperCase()
  const stats = await fetchPokemonStats()
  const entries = getEntries(stats, name)
  if (entries.length === 0) return { title: "Not Found" }
  const total = entries.reduce((acc, e) => acc + e.count, 0)
  return {
    title: name,
    description: `${name} stats in Pokémon Auto Chess: ${total.toLocaleString()} games recorded across ${entries.length} rank tiers, average rank and best items.`,
  }
}

export const revalidate = 3600

export default async function PokemonDetailPage({ params }: PageProps) {
  const { name: raw } = await params
  const name = decodeURIComponent(raw).toUpperCase()

  if (!(name in pkmIndex)) notFound()

  const [stats, recs] = await Promise.all([fetchPokemonStats(), fetchPokemonItemRecs()])
  const entries = getEntries(stats, name)
  if (entries.length === 0) notFound()

  const sorted = [...entries].sort((a, b) => b.count - a.count)
  const totalCount = entries.reduce((acc, e) => acc + e.count, 0)
  const avgRank = entries.reduce((acc, e) => acc + e.avg_rank * e.count, 0) / (totalCount || 1)
  const recommended = (() => {
    const map = new Map<string, { count: number; rankSum: number }>()
    for (const r of recs[name] ?? []) {
      const cur = map.get(r.item) ?? { count: 0, rankSum: 0 }
      cur.count += r.count
      cur.rankSum += r.avg_rank * r.count
      map.set(r.item, cur)
    }
    return [...map.entries()]
      .map(([item, v]) => ({ item, avg_rank: v.rankSum / v.count, count: v.count }))
      .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
      .slice(0, 8)
  })()

  const evo = getEvolutionInfo(name)
  const preEvo = getPreEvolution(name)
  const related = getRelatedForms(name).filter((r) => r !== evo?.to && r !== preEvo?.from)

  return (
    <div>
      <Link href="/pokemon" className="text-sm text-slate-400 hover:text-white">&larr; All Pokémon</Link>
      <div className="flex items-center gap-3 mt-3 mb-6">
        <PkmImg name={name} index={pkmIndex[name]} size={56} />
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">{name}</h1>
          <p className="text-sm text-slate-400">
            {totalCount.toLocaleString()} games · avg rank {avgRank.toFixed(2)} · {entries.length} tiers
          </p>
        </div>
      </div>

      {evo && (
        <div className="mb-6 border border-yellow-500/30 bg-yellow-500/10 rounded-xl p-3 flex items-center gap-3">
          <ItemImg name={evo.item} size={28} />
          <p className="text-sm">
            <span className="text-slate-300">Evolves to</span>{" "}
            <Link href={`/pokemon/${evo.to.toLowerCase()}`} className="font-semibold text-yellow-400 hover:text-yellow-300">
              {evo.to}
            </Link>{" "}
            <span className="text-slate-400">with</span> <span className="font-medium text-white">{evo.item}</span>
            <span className="text-slate-500"> — equip it on {name} to transform in battle</span>
          </p>
        </div>
      )}
      {preEvo && (
        <div className="mb-6 border border-slate-700 bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
          <PkmImg name={preEvo.from} index={pkmIndex[preEvo.from]} size={28} />
          <p className="text-sm text-slate-300">
            Evolves from{" "}
            <Link href={`/pokemon/${preEvo.from.toLowerCase()}`} className="font-semibold text-yellow-400 hover:text-yellow-300">
              {preEvo.from}
            </Link>{" "}
            <span className="text-slate-500">with {preEvo.item}</span>
          </p>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">Stats by rank tier</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500">
              <th className="text-left py-2 pr-4">Tier</th>
              <th className="text-right py-2 pr-4">Avg Rank</th>
              <th className="text-right py-2 pr-4">Games</th>
              <th className="text-left py-2 hidden md:table-cell">Most used items</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((e) => (
              <tr key={e.tier} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-2 pr-4">{e.tier}</td>
                <td className="text-right pr-4 tabular-nums">{e.avg_rank.toFixed(2)}</td>
                <td className="text-right pr-4 tabular-nums text-slate-400">{e.count.toLocaleString()}</td>
                <td className="py-2 text-xs text-slate-400 hidden md:table-cell">
                  <div className="flex items-center gap-1 flex-wrap">
                    {e.items.length > 0
                      ? e.items.slice(0, 5).map((it) => (
                          <span key={it} className="flex items-center gap-1 mr-2">
                            <ItemImg name={it} size={16} />
                            {it}
                          </span>
                        ))
                      : "—"}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mb-2">Best items</h2>
      {recommended.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recommended.map((r) => (
            <div key={r.item} className="border border-slate-700 rounded-xl p-3 flex items-center gap-3">
              <ItemImg name={r.item} size={32} />
              <div className="min-w-0">
                <p className="font-medium truncate">{r.item}</p>
                <p className="text-xs text-slate-400">
                  avg rank {r.avg_rank.toFixed(2)} · {r.count.toLocaleString()} games
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">No item recommendations recorded.</p>
      )}

      {related.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Related forms</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r}
                href={`/pokemon/${r.toLowerCase()}`}
                className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-2 hover:border-yellow-500/50 hover:bg-slate-800/50"
              >
                <PkmImg name={r} index={pkmIndex[r]} size={24} />
                <span className="text-sm text-slate-300">{r}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
