const BASE = "https://pokemon-auto-chess.com"
const CACHE_TTL = 3600_000 // 1 hour in ms
const cache = new Map<string, { data: unknown; ts: number }>()

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const cached = cache.get(endpoint)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data as T
  }
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { "User-Agent": "pokestats-web/0.1" },
  })
  if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`)
  const data = await res.json()
  cache.set(endpoint, { data, ts: Date.now() })
  return data as T
}

export interface ItemEntry {
  item: string
  tier: string
  avg_rank: number
  count: number
}

export interface PokemonStat {
  pokemon: string
  tier: string
  avg_rank: number
  count: number
  items: string[]
  item_count: number
}

export interface ItemStat {
  item: string
  tier: string
  avg_rank: number
  count: number
  pokemons: string[]
}

export interface Composition {
  cluster_id: string
  mean_rank: number
  winrate: number
  count: number
  ratio: number
  synergies: Record<string, number>
  mean_team: {
    pokemons: Record<string, { frequency: number; mean_items: number; items: string[] }>
  }
}

export interface Region {
  name: string
  count: number
  rank: number
  elo: number
  pokemons: string[]
}

export async function fetchPokemonItemRecs(): Promise<Record<string, ItemEntry[]>> {
  const data = await fetchJSON<any[]>("/meta/items")
  const recs: Record<string, ItemEntry[]> = {}
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [itemName, item] of Object.entries<Record<string, any>>(tierData.items ?? {})) {
      for (const pkm of item.pokemons ?? []) {
        if (!recs[pkm]) recs[pkm] = []
        recs[pkm].push({ item: itemName, tier, avg_rank: item.rank, count: item.count })
      }
    }
  }
  for (const pkm of Object.keys(recs)) {
    recs[pkm].sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
  }
  return recs
}

export async function fetchPokemonStats(): Promise<PokemonStat[]> {
  const data = await fetchJSON<any[]>("/meta/pokemons")
  const stats: PokemonStat[] = []
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [name, pkm] of Object.entries<Record<string, any>>(tierData.pokemons ?? {})) {
      stats.push({
        pokemon: name,
        tier,
        avg_rank: pkm.rank,
        count: pkm.count,
        items: pkm.items ?? [],
        item_count: pkm.item_count ?? 0,
      })
    }
  }
  return stats
}

export async function fetchItemStats(): Promise<ItemStat[]> {
  const data = await fetchJSON<any[]>("/meta/items")
  const stats: ItemStat[] = []
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [name, item] of Object.entries<Record<string, any>>(tierData.items ?? {})) {
      stats.push({
        item: name,
        tier,
        avg_rank: item.rank,
        count: item.count,
        pokemons: item.pokemons ?? [],
      })
    }
  }
  return stats
}

export async function fetchCompositions(): Promise<Composition[]> {
  const data = await fetchJSON<any[]>("/meta-v2")
  return data
}

export async function fetchRegions(): Promise<Region[]> {
  const data = await fetchJSON<any[]>("/meta/regions")
  return data
}
