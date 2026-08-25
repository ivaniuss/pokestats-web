import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { fetchPokemonStats, fetchPokemonItemRecs, type PokemonStat } from "@/lib/api"
import { PkmImg, ItemImg } from "@/components/pkm-img"
import { pkmIndex } from "@/lib/pkm-index"

interface PageProps {
  params: Promise<{ name: string }>
}

export const dynamicParams = false

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

export async function generateStaticParams() {
  try {
    const stats = await fetchPokemonStats()
    return [...new Set(stats.map((s) => s.pokemon))].map((name) => ({ name }))
  } catch {
    return []
  }
}

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
  const recommended = (recs[name] ?? []).slice(0, 8)

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
                  {e.items.length > 0 ? e.items.slice(0, 5).join(", ") : "—"}
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
    </div>
  )
}
