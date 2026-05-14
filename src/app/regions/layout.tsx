import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Regions",
  description:
    "Regional performance data in Pokémon Auto Chess. Compare avg rank, ELO, and top Pokémon across different regions.",
  openGraph: {
    title: "Regions — PokéStats",
    description:
      "Regional performance data in Pokémon Auto Chess. Compare avg rank, ELO, and top Pokémon across different regions.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
