"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import "./globals.css"

const LANG = {
  en: "EN",
  es: "ES",
  pt: "PT",
}

const TIER_INFO = [
  { tier: "LEVEL_BALL", elo: "0" },
  { tier: "NET_BALL", elo: "1050" },
  { tier: "SAFARI_BALL", elo: "1100" },
  { tier: "LOVE_BALL", elo: "1150" },
  { tier: "PREMIER_BALL", elo: "1200" },
  { tier: "QUICK_BALL", elo: "1250" },
  { tier: "POKE_BALL", elo: "1300" },
  { tier: "SUPER_BALL", elo: "1350" },
  { tier: "ULTRA_BALL", elo: "1400" },
  { tier: "MASTER_BALL", elo: "1500" },
  { tier: "BEAST_BALL", elo: "1600" },
]

const TIERS_ROW = TIER_INFO.map((t) => `  ${t.tier} — ${t.elo} ELO`).join("\n")

const HELP: Record<string, Record<string, { title: string; body: string }>> = {
  tiers: {
    en: { title: "Rank Tiers", body: `Tiers group players by ELO (ranking score). Higher tier = better players.\n${TIERS_ROW}\nBEAST_BALL is the highest rank, LEVEL_BALL the lowest.` },
    es: { title: "Tiers de Ranking", body: `Los tiers agrupan jugadores por ELO (puntaje de ranking). A mayor tier, mejores jugadores.\n${TIERS_ROW}\nBEAST_BALL es el rango más alto, LEVEL_BALL el más bajo.` },
    pt: { title: "Tiers de Ranqueamento", body: `Os tiers agrupam jogadores por ELO (pontuação de ranking). Quanto maior o tier, melhores os jogadores.\n${TIERS_ROW}\nBEAST_BALL é o ranking mais alto, LEVEL_BALL o mais baixo.` },
  },
  avg_rank: {
    en: { title: "Average Rank (Avg Rank)", body: "The average finishing position of players using that Pokémon/item/composition. 8 players per game, 1st is best, 8th is worst. An avg_rank of 2.50 means they place around 2nd-3rd on average." },
    es: { title: "Average Rank (Avg Rank)", body: "La posición promedio en que terminan los jugadores que usan ese Pokémon/item/composición. Son 8 jugadores por partida, 1° es el mejor, 8° el peor. Un avg_rank de 2.50 significa que en promedio quedan 2° o 3°." },
    pt: { title: "Average Rank (Avg Rank)", body: "A colocação média dos jogadores que usam aquele Pokémon/item/composição. São 8 jogadores por partida, 1° é o melhor, 8° é o pior. Um avg_rank de 2.50 significa que ficam em 2° ou 3° em média." },
  },
  count: {
    en: { title: "Count", body: "Number of recorded games with this data point. Higher count = more statistically significant. Low counts (e.g. < 100) can be misleading — a single lucky game can skew the average." },
    es: { title: "Count", body: "Cantidad de partidas registradas con este dato. Mientras más alto, más representativo estadísticamente. Valores bajos (ej. < 100) pueden ser engañosos — una sola partida con suerte distorsiona el promedio." },
    pt: { title: "Count", body: "Quantidade de partidas registradas com este dado. Quanto maior, mais representativo estatisticamente. Valores baixos (ex. < 100) podem ser enganosos — uma única partida com sorte distorce a média." },
  },
  pages: {
    en: { title: "Pages", body: "• Best Items — Search a Pokémon and see the best items to use on it, ranked by performance across tiers.\n• Pokémon — Stats per Pokémon broken down by rank tier.\n• Top Pokémon — Highest performing Pokémon by average rank, filterable by tier.\n• Top Items — Highest performing items by average rank, filterable by tier.\n• Compositions — Winning team compositions from the current meta." },
    es: { title: "Páginas", body: "• Best Items — Busca un Pokémon y ve los mejores items para usarlo, ordenados por rendimiento según tier.\n• Pokémon — Estadísticas de cada Pokémon separado por tier de ranking.\n• Top Pokémon — Los Pokémon con mejor avg_rank, filtrable por tier.\n• Top Items — Los items con mejor avg_rank, filtrable por tier.\n• Compositions — Composiciones de equipo ganadoras del meta actual." },
    pt: { title: "Páginas", body: "• Best Items — Procure um Pokémon e veja os melhores itens para usar nele, ordenados por desempenho por tier.\n• Pokémon — Estatísticas de cada Pokémon separado por tier de ranking.\n• Top Pokémon — Os Pokémon com melhor avg_rank, filtrável por tier.\n• Top Items — Os itens com melhor avg_rank, filtrável por tier.\n• Compositions — Composições de equipe vencedoras do meta atual." },
  },
}

const nav = [
  { href: "/best-items", label: "Best Items" },
  { href: "/pokemon", label: "Pokémon" },
  { href: "/top-pokemon", label: "Top Pokémon" },
  { href: "/top-items", label: "Top Items" },
  { href: "/compositions", label: "Compositions" },
  { href: "/contact", label: "Contact" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [help, setHelp] = useState<string | null>(null)
  const [lang, setLang] = useState<"en" | "es" | "pt">("en")

  useEffect(() => {
    if (help) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [help])

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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-yellow-400">{HELP[help as keyof typeof HELP]?.[lang]?.title || help}</h2>
                <div className="flex gap-1">
                  {(["en", "es", "pt"] as const).map((l) => (
                    <button key={l} onClick={() => setLang(l)}
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${lang === l ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-400 hover:text-white"}`}
                    >{l}</button>
                  ))}
                </div>
              </div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {HELP[help as keyof typeof HELP]?.[lang]?.body || "No info available."}
              </pre>
              <div className="flex gap-2 mt-4 flex-wrap">
                {Object.entries(HELP).map(([k, v]) => (
                  <button key={k} onClick={() => setHelp(k)}
                    className={`px-3 py-1 rounded text-xs ${help === k ? "bg-yellow-500 text-black" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                  >{v[lang].title}</button>
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
