import { pkmIndex } from "./pkm-index"

const SKIP = new Set(["DEFAULT", "EGG", "SUBSTITUTE"])

const EVOLUTION_ITEM: Record<string, { item: string; to: string }> = {
  GROUDON: { item: "RED_ORB", to: "PRIMAL_GROUDON" },
  KYOGRE: { item: "BLUE_ORB", to: "PRIMAL_KYOGRE" },
  RAYQUAZA: { item: "GREEN_ORB", to: "MEGA_RAYQUAZA" },
}

export function getEvolutionInfo(name: string) {
  return EVOLUTION_ITEM[name] ?? null
}

export function getPreEvolution(name: string) {
  for (const [from, info] of Object.entries(EVOLUTION_ITEM)) {
    if (info.to === name) return { from, item: info.item }
  }
  return null
}

export function getRelatedForms(name: string): string[] {
  const idx = pkmIndex[name]
  if (!idx) return []
  const base = idx.split("-")[0]
  return Object.entries(pkmIndex)
    .filter(([n, i]) => {
      if (SKIP.has(n) || n === name) return false
      return i === base || i.startsWith(base + "-") || i.split("-")[0] === base
    })
    .map(([n]) => n)
    .filter((n) => {
      const i = pkmIndex[n]
      return i.split("-")[0] === base
    })
}
