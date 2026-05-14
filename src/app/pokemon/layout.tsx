import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pokémon Stats",
  description:
    "Detailed stats per Pokémon in Pokémon Auto Chess across all rank tiers. View avg rank, most used items, and performance data for every Pokémon.",
  openGraph: {
    title: "Pokémon Stats — PokéStats",
    description:
      "Detailed stats per Pokémon in Pokémon Auto Chess across all rank tiers. View avg rank, most used items, and performance data for every Pokémon.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
