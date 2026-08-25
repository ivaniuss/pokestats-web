import { fetchCompositions } from "@/lib/api"
import { cachedResponse } from "@/lib/cache"

export async function GET() {
  try {
    return cachedResponse(await fetchCompositions())
  } catch (err) {
    console.error(err)
    return Response.json({ error: "Upstream API unavailable" }, { status: 502 })
  }
}
