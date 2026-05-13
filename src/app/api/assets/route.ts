import { NextRequest } from "next/server"

const REMOTE = "https://pokemon-auto-chess.com"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const path = url.searchParams.get("path")
  if (!path) return new Response("missing path", { status: 400 })

  const remoteUrl = `${REMOTE}${path}`
  const res = await fetch(remoteUrl, {
    headers: {
      "User-Agent": "pokestats-web/0.1",
      Referer: "https://pokemon-auto-chess.com/",
    },
  })
  if (!res.ok) return new Response("not found", { status: 404 })

  const blob = await res.blob()
  return new Response(blob, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
