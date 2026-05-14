import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://pokestats.gg"

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/best-items`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/pokemon`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/top-pokemon`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/top-items`, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/compositions`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/regions`, changeFrequency: "daily", priority: 0.5 },
  ]
}
