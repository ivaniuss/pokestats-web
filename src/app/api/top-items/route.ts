import { fetchItemStats } from "@/lib/api"

export async function GET() {
  const data = await fetchItemStats()
  return Response.json(data)
}
