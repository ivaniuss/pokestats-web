export function cachedResponse(data: unknown, maxAge = 3600) {
  return Response.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  })
}
