import { fetchRegions } from "@/lib/api"
import { cachedResponse } from "@/lib/cache"

export async function GET() {
  try {
    return cachedResponse(await fetchRegions())
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Upstream API unavailable" }, { status: 502 })
  }
}
