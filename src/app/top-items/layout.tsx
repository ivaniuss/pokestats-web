import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Top Items",
  description:
    "Highest performing items in Pokémon Auto Chess ranked by average rank. Filter by tier and discover which items give the best results.",
  openGraph: {
    title: "Top Items — PokéStats",
    description:
      "Highest performing items in Pokémon Auto Chess ranked by average rank. Filter by tier and discover which items give the best results.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
