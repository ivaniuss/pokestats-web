import { fetchCompositions } from "@/lib/api"

export async function GET() {
  const data = await fetchCompositions()
  return Response.json(data)
}
