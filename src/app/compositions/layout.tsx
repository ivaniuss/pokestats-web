import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team Compositions",
  description:
    "Winning team compositions from the current Pokémon Auto Chess meta. Explore synergies, core Pokémon, items, and performance data for top comps.",
  openGraph: {
    title: "Team Compositions — PokéStats",
    description:
      "Winning team compositions from the current Pokémon Auto Chess meta. Explore synergies, core Pokémon, items, and performance data for top comps.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
