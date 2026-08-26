import { fetchPokemonItemRecs } from "@/lib/api"
import { getCraftableSet } from "@/lib/craftable"
import { getSynergyMap } from "@/lib/synergy-map"
import SynergyView from "./view"

export const revalidate = 3600

export const metadata = {
  title: "Synergy Items",
  description: "Best items to collect early when playing a synergy in Pokémon Auto Chess — what to pick before you know your final legendary.",
}

const STONE_DENYLIST = new Set([
  "OLD_AMBER",
  "DAWN_STONE",
  "WATER_STONE",
  "THUNDER_STONE",
  "FIRE_STONE",
  "MOON_STONE",
  "DUSK_STONE",
  "LEAF_STONE",
  "ICE_STONE",
])

async function getCategoryMap(): Promise<Map<string, string>> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/models/precomputed/pokemons-data.csv", {
      next: { revalidate: 3600 },
    })
    const txt = await res.text()
    const lines = txt.trim().split("\n")
    const headers = lines[0].split(",")
    const idxName = headers.indexOf("Name")
    const idxCat = headers.indexOf("Category")
    const map = new Map<string, string>()
    for (const line of lines.slice(1)) {
      const cols = line.split(",")
      map.set(cols[idxName], cols[idxCat])
    }
    return map
  } catch {
    return new Map()
  }
}

async function getRecipeMap(): Promise<Map<string, [string, string]>> {
  try {
    const res = await fetch("https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/types/enum/Item.ts", {
      next: { revalidate: 3600 },
    })
    const txt = await res.text()
    const block = txt.slice(txt.indexOf("export const ItemRecipe"), txt.indexOf("export const Scarves"))
    const recipe = new Map<string, [string, string]>()
    for (const m of block.matchAll(/\[Item\.(\w+)\]:\s*\[Item\.(\w+),\s*Item\.(\w+)\]/g)) {
      recipe.set(m[1], [m[2], m[3]])
    }
    return recipe
  } catch {
    return new Map()
  }
}

export default async function SynergiesPage() {
  const [synergyMap, recs, craftable, recipe, categoryMap] = await Promise.all([
    getSynergyMap(),
    fetchPokemonItemRecs(),
    getCraftableSet(),
    getRecipeMap(),
    getCategoryMap(),
  ])

  const CARRY_CATEGORIES = new Set(["UNIQUE", "LEGENDARY", "ULTRA", "EPIC"])
  const data: Record<string, { items: { item: string; avg_rank: number; count: number; recipe?: [string, string] }[]; pokemons: string[] }> = {}

  for (const [syn, set] of synergyMap) {
    const allPokemons = [...set].sort()
    const carryPokemons = allPokemons.filter((p) => CARRY_CATEGORIES.has(categoryMap.get(p) ?? ""))
    const pokemons = carryPokemons.length >= 3 ? carryPokemons : allPokemons
    const agg = new Map<string, { count: number; rankSum: number; pokes: Set<string> }>()
    for (const pkm of pokemons) {
      for (const r of recs[pkm] ?? []) {
        if (STONE_DENYLIST.has(r.item)) continue
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
      .map(({ item, avg_rank, count }) => ({ item, avg_rank, count, recipe: recipe.get(item) }))
    if (items.length < 4) {
      items = all
        .filter((x) => craftable.has(x.item) && x.count >= 20)
        .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
        .slice(0, 8)
        .map(({ item, avg_rank, count }) => ({ item, avg_rank, count, recipe: recipe.get(item) }))
    }
    if (items.length === 0) {
      items = all
        .filter((x) => x.count >= 20)
        .sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
        .slice(0, 8)
        .map(({ item, avg_rank, count }) => ({ item, avg_rank, count, recipe: recipe.get(item) }))
    }
    data[syn] = { items, pokemons: allPokemons }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Synergy Items</h1>
      <p className="text-sm text-slate-400 mb-6">
        Playing a synergy (e.g. <span className="text-slate-200">WATER</span>) but don&apos;t know your final legendary yet? These are the items that perform best <span className="text-slate-200">on carries of that synergy (unique / legendary / ultra / epic)</span> — the Pokémon you’ll actually give your mixed items to. Lower avg rank = better (1st is best). Stones that only add a synergy are hidden. Click a Pokémon to see its detail.
      </p>
      <SynergyView data={data} />
    </div>
  )
}
