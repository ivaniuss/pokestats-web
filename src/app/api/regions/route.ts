import { fetchRegions } from "@/lib/api"

export async function GET() {
  const data = await fetchRegions()
  return Response.json(data)
}
