export const revalidate = 3600

import { fetchPokemonItemRecs, fetchPokemonStats } from "@/lib/api"
import PokemonSearch from "./search"

export default async function PokemonPage() {
  const [stats, recs] = await Promise.all([fetchPokemonStats(), fetchPokemonItemRecs()])
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Pokémon Stats</h1>
      <p className="text-sm text-slate-400 mb-4">
        New to the game? Search a Pokémon (e.g. <span className="text-slate-200">GROUDON</span>) — you’ll get a{" "}
        <span className="text-yellow-400">starter build</span> (best items for beginners) and the full stats per rank below.
        Lower <span className="text-slate-200">avg rank</span> = better (1st is best).
      </p>
      <PokemonSearch stats={stats} recs={recs} />
    </div>
  )
}
