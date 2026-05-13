import { fetchRegions } from "@/lib/api"
import { cachedResponse } from "@/lib/cache"

export async function GET() {
  return cachedResponse(await fetchRegions())
}
