import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"

export const metadata: Metadata = {
  title: "PokéStats",
  description: "Pokemon Auto Chess — meta stats & item recommendations",
}

const nav = [
  { href: "/", label: "Home" },
  { href: "/best-items", label: "Best Items" },
  { href: "/pokemon", label: "Pokemon" },
  { href: "/top-pokemon", label: "Top Pokemon" },
  { href: "/top-items", label: "Top Items" },
  { href: "/compositions", label: "Compositions" },
  { href: "/regions", label: "Regions" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="flex items-center gap-6 px-6 py-4 border-b border-slate-700 bg-slate-900/80 sticky top-0 z-10 backdrop-blur">
          <Link href="/" className="font-bold text-lg text-yellow-400 tracking-tight">
            PokéStats
          </Link>
          <div className="flex gap-4 text-sm">
            {nav.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="text-slate-300 hover:text-white transition-colors">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
