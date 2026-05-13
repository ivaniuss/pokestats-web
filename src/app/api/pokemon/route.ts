import { fetchPokemonItemRecs, fetchPokemonStats } from "@/lib/api"
import { cachedResponse } from "@/lib/cache"

export async function GET() {
  const [itemRecs, pokeStats] = await Promise.all([
    fetchPokemonItemRecs(),
    fetchPokemonStats(),
  ])

  const merged: Record<string, {
    pokemon: string
    items: Record<string, { games: number; tiers: string[]; avg_rank: number }>
    tiers: Record<string, { avg_rank: number; games: number; items: string[] }>
  }> = {}

  // group pokemon stats by name
  for (const s of pokeStats) {
    if (!merged[s.pokemon]) merged[s.pokemon] = { pokemon: s.pokemon, items: {}, tiers: {} }
    merged[s.pokemon].tiers[s.tier] = { avg_rank: s.avg_rank, games: s.count, items: s.items }
    for (const item of s.items) {
      if (!merged[s.pokemon].items[item]) merged[s.pokemon].items[item] = { games: 0, tiers: [], avg_rank: 0 }
      merged[s.pokemon].items[item].games += s.count
      merged[s.pokemon].items[item].tiers.push(s.tier)
    }
  }

  // add global item ranks from itemRecs
  for (const [pkm, items] of Object.entries(itemRecs)) {
    if (!merged[pkm]) continue
    for (const entry of items) {
      const existing = merged[pkm].items[entry.item]
      if (existing) {
        existing.avg_rank = entry.avg_rank
        if (!existing.tiers.includes(entry.tier)) existing.tiers.push(entry.tier)
      }
    }
  }

  return cachedResponse(merged)
}
