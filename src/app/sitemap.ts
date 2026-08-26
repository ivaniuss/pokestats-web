import type { MetadataRoute } from "next"
import { pkmIndex } from "@/lib/pkm-index"

export const revalidate = 3600

const base = "https://pokestats.gg"

const SKIP = new Set(["DEFAULT", "EGG", "SUBSTITUTE"])

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/pokemon`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/synergies`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ]

  const pokemonRoutes: MetadataRoute.Sitemap = Object.keys(pkmIndex)
    .filter((name) => !SKIP.has(name))
    .map((name) => ({
      url: `${base}/pokemon/${name.toLowerCase()}`,
      changeFrequency: "daily",
      priority: 0.6,
    }))

  return [...staticRoutes, ...pokemonRoutes]
}
