export const revalidate = 3600

import { fetchPokemonStats } from "@/lib/api"
import PokemonSearch from "./search"

export default async function PokemonPage() {
  const stats = await fetchPokemonStats()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon Stats</h1>
      <PokemonSearch stats={stats} />
    </div>
  )
}
