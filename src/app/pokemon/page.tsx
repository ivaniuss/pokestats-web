export const revalidate = 3600

import { fetchPokemonItemRecs, fetchPokemonStats } from "@/lib/api"
import PokemonSearch from "./search"

export default async function PokemonPage() {
  const [stats, recs] = await Promise.all([fetchPokemonStats(), fetchPokemonItemRecs()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon Stats</h1>
      <PokemonSearch stats={stats} recs={recs} />
    </div>
  )
}
