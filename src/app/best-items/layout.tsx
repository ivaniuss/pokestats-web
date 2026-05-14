import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Best Items",
  description:
    "Find the best items for any Pokémon in Pokémon Auto Chess. Search by Pokémon or item, filter by rank tier, and see performance data across all tiers.",
  openGraph: {
    title: "Best Items — PokéStats",
    description:
      "Find the best items for any Pokémon in Pokémon Auto Chess. Search by Pokémon or item, filter by rank tier, and see performance data across all tiers.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
