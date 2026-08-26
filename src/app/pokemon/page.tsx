export const revalidate = 3600

import { fetchPokemonItemRecs, fetchPokemonStats } from "@/lib/api"
import { getCraftableSet } from "@/lib/craftable"
import PokemonSearch from "./search"

export default async function PokemonPage() {
  const [stats, recs, craftable] = await Promise.all([fetchPokemonStats(), fetchPokemonItemRecs(), getCraftableSet()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon Stats</h1>
      <PokemonSearch stats={stats} recs={recs} craftable={craftable} />
    </div>
  )
}
