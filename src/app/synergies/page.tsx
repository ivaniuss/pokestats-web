import { fetchPokemonItemRecs } from "@/lib/api"
import { getSynergyMap } from "@/lib/synergy-map"
import SynergyView from "./view"

export const revalidate = 3600

export const metadata = {
  title: "Synergy Items",
  description: "Best items to collect early when playing a synergy in Pokémon Auto Chess — what to pick before you know your final legendary.",
}

async function getCraftableSet(): Promise<Set<string>> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/types/enum/Item.ts", {
      next: { revalidate: 3600 },
    })
    const txt = await res.text()
    return new Set([...txt.matchAll(/\[Item\.(\w+)\]:/g)].map((m) => m[1]))
  } catch {
    return new Set()
  }
}

export default async function SynergiesPage() {
  const [synergyMap, recs, craftable] = await Promise.all([getSynergyMap(), fetchPokemonItemRecs(), getCraftableSet()])

  const data: Record<string, { items: { item: string; avg_rank: number; count: number }[]; pokemons: string[] }> = {}

  for (const [syn, set] of synergyMap) {
    const pokemons = [...set].sort()
    const agg = new Map<string, { count: number; rankSum: number; pokes: Set<string> }>()
    for (const pkm of pokemons) {
      for (const r of recs[pkm] ?? []) {
        const cur = agg.get(r.item) ?? { count: 0, rankSum: 0, pokes: new Set<string>() }
        cur.count += r.count
        cur.rankSum += r.avg_rank * r.count
        cur.pokes.add(pkm)
        agg.set(r.item, cur)
      }
    }
    const all = [...agg.entries()].map(([item, v]) => ({
      item,
      avg_rank: v.rankSum / v.count,
      count: v.count,
      pokeCount: v.pokes.size,
    }))
    let items = all
      .filter((x) => craftable.has(x.item) && x.count >= 100 && x.pokeCount >= 2)
      .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
      .slice(0, 8)
      .map(({ item, avg_rank, count }) => ({ item, avg_rank, count }))
    if (items.length < 4) {
      items = all
        .filter((x) => craftable.has(x.item) && x.count >= 20)
        .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
        .slice(0, 8)
        .map(({ item, avg_rank, count }) => ({ item, avg_rank, count }))
    }
    if (items.length === 0) {
      items = all
        .filter((x) => x.count >= 20)
        .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
        .slice(0, 8)
        .map(({ item, avg_rank, count }) => ({ item, avg_rank, count }))
    }
    data[syn] = { items, pokemons }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Synergy Items</h1>
      <p className="text-sm text-slate-400 mb-6">
        Playing a synergy (e.g. <span className="text-slate-200">WATER</span>) but don&apos;t know your final legendary yet? These are the items that perform best <span className="text-slate-200">on average across all Pokémon of that synergy</span> — great to collect early. Lower avg rank = better (1st is best). Click a Pokémon to see its detail.
      </p>
      <SynergyView data={data} />
    </div>
  )
}
