export const revalidate = 3600

import { fetchPokemonItemRecs } from "@/lib/api"
import BestItemsExplorer from "./explorer"

export default async function BestItemsPage() {
  const recs = await fetchPokemonItemRecs()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Best Items</h1>
      <BestItemsExplorer recs={recs} />
    </div>
  )
}
