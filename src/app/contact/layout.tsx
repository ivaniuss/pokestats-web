import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the PokéStats team. Report bugs, suggest features, or just say hi.",
  openGraph: {
    title: "Contact — PokéStats",
    description:
      "Get in touch with the PokéStats team. Report bugs, suggest features, or just say hi.",
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
