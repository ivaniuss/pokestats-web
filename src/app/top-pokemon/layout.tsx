import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Top Pokémon",
  description:
    "Highest performing Pokémon in Pokémon Auto Chess ranked by average rank. Filter by tier and see which Pokémon dominate the current meta.",
  openGraph: {
    title: "Top Pokémon — PokéStats",
    description:
      "Highest performing Pokémon in Pokémon Auto Chess ranked by average rank. Filter by tier and see which Pokémon dominate the current meta.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
