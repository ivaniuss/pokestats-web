"use client"

import { useState } from "react"
import Link from "next/link"
import "./globals.css"

const TIER_INFO = [
  { tier: "LEVEL_BALL", elo: "0", label: "Bronce" },
  { tier: "NET_BALL", elo: "1050", label: "" },
  { tier: "SAFARI_BALL", elo: "1100", label: "" },
  { tier: "LOVE_BALL", elo: "1150", label: "" },
  { tier: "PREMIER_BALL", elo: "1200", label: "" },
  { tier: "QUICK_BALL", elo: "1250", label: "" },
  { tier: "POKE_BALL", elo: "1300", label: "" },
  { tier: "SUPER_BALL", elo: "1350", label: "" },
  { tier: "ULTRA_BALL", elo: "1400", label: "" },
  { tier: "MASTER_BALL", elo: "1500", label: "" },
  { tier: "BEAST_BALL", elo: "1600", label: "Máximo" },
]

const HELP = {
  tiers: {
    title: "Rank Tiers",
    body: `Los tiers ordenan a los jugadores por su ELO (puntuación de ranking). Cuanto más alto el tier, mejores jugadores.
${TIER_INFO.map((t) => `  • ${t.tier} — ${t.elo} ELO${t.label ? ` (${t.label})` : ""}`).join("\n")}
BEAST_BALL es el rango más alto, LEVEL_BALL el más bajo.`,
  },
  avg_rank: {
    title: "Average Rank (Avg Rank)",
    body: "Es el puesto promedio en que terminan los jugadores cuando usan ese Pokémon/item/composición. Son 8 jugadores por partida, 1° es el mejor, 8° el peor. Un avg_rank de 2.50 significa que en promedio quedan 2° o 3°.",
  },
  count: {
    title: "Count",
    body: "Cantidad de partidas registradas con ese dato. Mientras más alto, más representativo. Recomendamos ignorar datos con count bajo (ej: < 100) porque pueden ser engañosos.",
  },
  pages: {
    title: "Pages",
    body: `• Best Items — Buscá un Pokémon y vê los mejores items para usarlo, ordenados por rendimiento.
• Pokémon — Stats de cada Pokémon separado por tier de ranking.
• Top Pokémon — Los Pokémon con mejor avg_rank, filtrable por tier.
• Top Items — Los items con mejor avg_rank, filtrable por tier.
• Compositions — Composiciones de equipo ganadoras del meta.
• Regions — Rendimiento de cada región del juego.`,
  },
}

const nav = [
  { href: "/best-items", label: "Best Items" },
  { href: "/pokemon", label: "Pokémon" },
  { href: "/top-pokemon", label: "Top Pokémon" },
  { href: "/top-items", label: "Top Items" },
  { href: "/compositions", label: "Compositions" },
  { href: "/regions", label: "Regions" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [help, setHelp] = useState<string | null>(null)

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-200">
        <nav className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
            <Link href="/" className="font-bold text-yellow-400 tracking-tight shrink-0">
              PokéStats
            </Link>

            <div className="hidden md:flex items-center gap-4 text-sm">
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="text-slate-300 hover:text-white transition-colors">
                  {n.label}
                </Link>
              ))}
              <button onClick={() => setHelp("pages")} className="text-slate-500 hover:text-white text-lg leading-none" title="Help">?</button>
            </div>

            <button className="md:hidden text-slate-300 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-slate-700 bg-slate-900 px-4 py-2 space-y-1">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}
                  className="block py-1.5 text-sm text-slate-300 hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >{n.label}</Link>
              ))}
              <button onClick={() => { setHelp("pages"); setMenuOpen(false) }}
                className="block py-1.5 text-sm text-slate-500 hover:text-white w-full text-left"
              >Help</button>
            </div>
          )}
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-4 md:py-6">{children}</main>

        {help && (
          <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center p-4" onClick={() => setHelp(null)}>
            <div className="bg-slate-800 border border-slate-600 rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-yellow-400 mb-3">{HELP[help as keyof typeof HELP]?.title || help}</h2>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {HELP[help as keyof typeof HELP]?.body || "No info available."}
              </pre>
              <div className="flex gap-2 mt-4 flex-wrap">
                {Object.entries(HELP).map(([k, v]) => (
                  <button key={k} onClick={() => setHelp(k)}
                    className={`px-3 py-1 rounded text-xs ${help === k ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                  >{v.title}</button>
                ))}
                <button onClick={() => setHelp(null)} className="px-3 py-1 rounded text-xs bg-slate-700 text-slate-300 hover:bg-slate-600 ml-auto">Close</button>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  )
}
