const CSV_URL =
  "https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/models/precomputed/pokemons-data.csv"

let cached: { map: Map<string, Set<string>>; ts: number } | null = null
const TTL = 3600_000

export async function getSynergyMap(): Promise<Map<string, Set<string>>> {
  if (cached && Date.now() - cached.ts < TTL) return cached.map

  const res = await fetch(CSV_URL, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`CSV fetch failed ${res.status}`)
  const text = await res.text()
  const lines = text.trim().split("\n")
  const headers = lines[0].split(",")
  const idxName = headers.indexOf("Name")
  const idxT1 = headers.indexOf("Type 1")
  const idxT2 = headers.indexOf("Type 2")
  const idxT3 = headers.indexOf("Type 3")
  const idxT4 = headers.indexOf("Type 4")

  const map = new Map<string, Set<string>>()
  for (const line of lines.slice(1)) {
    const cols = line.split(",")
    const name = cols[idxName]
    if (!name) continue
    for (const idx of [idxT1, idxT2, idxT3, idxT4]) {
      const t = cols[idx]?.trim()
      if (!t) continue
      if (!map.has(t)) map.set(t, new Set())
      map.get(t)!.add(name)
    }
  }

  // Ensure at least the 31 known synergies appear even if empty
  const all = [
    "AMORPHOUS","AQUATIC","ARTIFICIAL","BABY","BUG","DARK","DRAGON","ELECTRIC","FAIRY","FIELD","FIGHTING","FIRE","FLORA","FLYING","FOSSIL","GHOST","GOURMET","GRASS","GROUND","HUMAN","ICE","LIGHT","MONSTER","NORMAL","POISON","PSYCHIC","ROCK","SOUND","STEEL","WATER","WILD",
  ]
  for (const s of all) if (!map.has(s)) map.set(s, new Set())

  cached = { map, ts: Date.now() }
  return map
}

export async function getSynergiesForPokemon(name: string): Promise<string[]> {
  const map = await getSynergyMap()
  const res: string[] = []
  for (const [syn, set] of map) if (set.has(name)) res.push(syn)
  return res
}
