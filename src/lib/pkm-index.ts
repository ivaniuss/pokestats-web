import index from "../../public/assets/pkm-index.json"

export const pkmIndex = index as Record<string, string>

const TYPO_FIX: Record<string, string> = {
  VESPIQUEEN: "VESPIQUEN",
}

export function getPkmIndex(name: string): string {
  if (pkmIndex[name]) return pkmIndex[name]
  if (TYPO_FIX[name] && pkmIndex[TYPO_FIX[name]]) return pkmIndex[TYPO_FIX[name]]
  const base = name.split("_")[0]
  if (pkmIndex[base]) return pkmIndex[base]
  const withoutPrefix = name.split("_").slice(1).join("_")
  if (withoutPrefix && pkmIndex[withoutPrefix]) return pkmIndex[withoutPrefix]
  const last = name.split("_").at(-1)
  if (last && pkmIndex[last]) return pkmIndex[last]
  return "0000"
}
