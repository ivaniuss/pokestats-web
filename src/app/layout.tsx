import type { Metadata } from "next"
import NavClient from "./nav-client"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "PokéStats — Pokémon Auto Chess Stats & Meta Data",
    template: "%s — PokéStats",
  },
  description:
    "Live meta data for Pokémon Auto Chess. Search any Pokémon to see its stats per rank tier and best items.",
  metadataBase: new URL("https://pokestats.gg"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "PokéStats",
    title: "PokéStats — Pokémon Auto Chess Stats & Meta Data",
    description:
      "Live meta data for Pokémon Auto Chess. Search any Pokémon to see its stats per rank tier and best items.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PokéStats — Pokémon Auto Chess Stats & Meta Data",
    description:
      "Live meta data for Pokémon Auto Chess. Search any Pokémon to see its stats per rank tier and best items.",
  },
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-200">
        <NavClient>{children}</NavClient>
      </body>
    </html>
  )
}
