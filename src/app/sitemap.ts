import type { MetadataRoute } from "next"
import { fetchPokemonStats } from "@/lib/api"

export const revalidate = 3600

const base = "https://pokestats.gg"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/pokemon`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ]

  try {
    const stats = await fetchPokemonStats()
    const names = [...new Set(stats.map((s) => s.pokemon))]
    const pokemonRoutes: MetadataRoute.Sitemap = names.map((name) => ({
      url: `${base}/pokemon/${name.toLowerCase()}`,
      changeFrequency: "daily",
      priority: 0.6,
    }))
    return [...staticRoutes, ...pokemonRoutes]
  } catch {
    return staticRoutes
  }
}
