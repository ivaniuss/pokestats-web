import { fetchPokemonStats } from "@/lib/api"

export async function GET() {
  const data = await fetchPokemonStats()
  return Response.json(data)
}
