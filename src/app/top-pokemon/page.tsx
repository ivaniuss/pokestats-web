export const revalidate = 3600

import { fetchPokemonStats } from "@/lib/api"
import TopPokemonTable from "./table"

export default async function TopPokemonPage() {
  const stats = await fetchPokemonStats()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Top Pokémon</h1>
      <TopPokemonTable stats={stats} />
    </div>
  )
}
