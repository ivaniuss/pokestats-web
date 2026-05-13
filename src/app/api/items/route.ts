import { fetchPokemonItemRecs } from "@/lib/api"

export async function GET() {
  const data = await fetchPokemonItemRecs()
  return Response.json(data)
}
