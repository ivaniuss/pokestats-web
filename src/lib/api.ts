import path from "node:path"
import fs from "node:fs/promises"

export const UPSTREAM_BASE = "https://pokemon-auto-chess.com"

const CACHE_TTL_MS = 3600_000

const DISK_CACHE_ENABLED = !process.env.VITEST

const memory = new Map<string, { data: unknown; ts: number }>()

function diskCachePath(endpoint: string) {
  const safe = endpoint.replace(/[^a-z0-9]+/gi, "-")
  return path.join("node_modules", ".cache", "pokestats", `${safe}.json`)
}

async function readDiskCache(endpoint: string): Promise<unknown | undefined> {
  if (!DISK_CACHE_ENABLED) return undefined
  try {
    const stat = await fs.stat(diskCachePath(endpoint))
    if (Date.now() - stat.mtimeMs < CACHE_TTL_MS) {
      return JSON.parse(await fs.readFile(diskCachePath(endpoint), "utf8"))
    }
  } catch {
    /* no cached copy */
  }
  return undefined
}

async function writeDiskCache(endpoint: string, data: unknown) {
  if (!DISK_CACHE_ENABLED) return
  try {
    const p = diskCachePath(endpoint)
    await fs.mkdir(path.dirname(p), { recursive: true })
    await fs.writeFile(p, JSON.stringify(data))
  } catch {
    /* read-only fs: skip */
  }
}

async function fetchJSON<T>(endpoint: string): Promise<T> {
  const mem = memory.get(endpoint)
  if (mem && Date.now() - mem.ts < CACHE_TTL_MS) return mem.data as T
  const disk = await readDiskCache(endpoint)
  if (disk !== undefined) {
    memory.set(endpoint, { data: disk, ts: Date.now() })
    return disk as T
  }
  const res = await fetch(`${UPSTREAM_BASE}${endpoint}`, {
    headers: { "User-Agent": "pokestats-web/0.1" },
  })
  if (!res.ok) throw new Error(`${endpoint} returned ${res.status}`)
  const data = await res.json() as T
  memory.set(endpoint, { data, ts: Date.now() })
  await writeDiskCache(endpoint, data)
  return data
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

interface UpstreamPokemonTier {
  tier: string
  pokemons?: Record<string, {
    rank?: number
    count?: number
    items?: string[]
    item_count?: number
  }>
}

interface UpstreamItemTier {
  tier: string
  items?: Record<string, {
    rank?: number
    count?: number
    pokemons?: string[]
  }>
}

export async function fetchPokemonItemRecs(): Promise<Record<string, ItemEntry[]>> {
  const data = await fetchJSON<UpstreamItemTier[]>("/meta/items")
  const recs: Record<string, ItemEntry[]> = {}
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [itemName, item] of Object.entries(tierData.items ?? {})) {
      for (const pkm of item.pokemons ?? []) {
        if (!recs[pkm]) recs[pkm] = []
        recs[pkm].push({ item: itemName, tier, avg_rank: item.rank ?? 0, count: item.count ?? 0 })
      }
    }
  }
  for (const pkm of Object.keys(recs)) {
    recs[pkm].sort((a, b) => a.avg_rank - b.avg_rank || b.count - a.count)
  }
  return recs
}

export async function fetchPokemonStats(): Promise<PokemonStat[]> {
  const data = await fetchJSON<UpstreamPokemonTier[]>("/meta/pokemons")
  const stats: PokemonStat[] = []
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [name, pkm] of Object.entries(tierData.pokemons ?? {})) {
      stats.push({
        pokemon: name,
        tier,
        avg_rank: pkm.rank ?? 0,
        count: pkm.count ?? 0,
        items: pkm.items ?? [],
        item_count: pkm.item_count ?? 0,
      })
    }
  }
  return stats
}

export async function fetchItemStats(): Promise<ItemStat[]> {
  const data = await fetchJSON<UpstreamItemTier[]>("/meta/items")
  const stats: ItemStat[] = []
  for (const tierData of data) {
    const tier = tierData.tier
    for (const [name, item] of Object.entries(tierData.items ?? {})) {
      stats.push({
        item: name,
        tier,
        avg_rank: item.rank ?? 0,
        count: item.count ?? 0,
        pokemons: item.pokemons ?? [],
      })
    }
  }
  return stats
}

export async function fetchCompositions(): Promise<Composition[]> {
  return fetchJSON<Composition[]>("/meta-v2")
}

export async function fetchRegions(): Promise<Region[]> {
  return fetchJSON<Region[]>("/meta/regions")
}
