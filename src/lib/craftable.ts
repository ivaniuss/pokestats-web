let cached: Set<string> | null = null
let ts = 0
const TTL = 3600_000

export async function getCraftableSet(): Promise<Set<string>> {
  if (cached && Date.now() - ts < TTL) return cached
  try {
    const res = await fetch("https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/types/enum/Item.ts", {
      next: { revalidate: 3600 },
    })
    const txt = await res.text()
    const block = txt.slice(txt.indexOf("export const ItemRecipe"), txt.indexOf("export const Scarves"))
    const set = new Set<string>()
    for (const m of block.matchAll(/\[Item\.(\w+)\]:/g)) set.add(m[1])
    cached = set
    ts = Date.now()
    return set
  } catch {
    return cached ?? new Set()
  }
}
